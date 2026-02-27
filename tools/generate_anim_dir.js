const fs = require('fs');
const path = require('path');
const https = require('https');

const dirs = [
    'js/anim/anim_registry.js',
    'js/anim/registry/core.js',
    'js/anim/registry/elemental.js',
    'js/anim/registry/physical.js',
    'js/anim/registry/nature.js',
    'js/anim/registry/mystic.js',
    'js/anim/registry/steel.js'
];

async function fetchMoveType(moveName) {
    return new Promise((resolve) => {
        // Format name for pokeapi: handle spaces, etc. In the codebase, names look like 'fire-blast', 'ice-beam'
        // but sometimes there are internal ones like 'fx-fire', 'pokeball-flash'
        const queryName = moveName.toLowerCase().replace(/[^a-z0-9-]/g, '');

        // Quick escape for obvious internal animations to speed up the process
        if (queryName.startsWith('fx-') || queryName.startsWith('status-') || queryName.startsWith('stat-') || queryName === 'pokeball-flash' || queryName === 'rage-buildup' || queryName === 'explosion' || queryName === 'confused') {
            return resolve('System/Special');
        }

        https.get(`https://pokeapi.co/api/v2/move/${queryName}`, (res) => {
            if (res.statusCode !== 200) {
                // If it 404s, it's likely a custom animation or system effect
                return resolve('System/Special');
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.type.name.toUpperCase());
                } catch (e) {
                    resolve('System/Special');
                }
            });
        }).on('error', () => {
            resolve('System/Special');
        });
    });
}

async function run() {
    console.log('Parsing files...');
    let results = [];
    dirs.forEach(file => {
        const filepath = path.join(process.cwd(), file);
        if (!fs.existsSync(filepath)) return;
        const content = fs.readFileSync(filepath, 'utf8');
        const regex = /AnimFramework\.register\(\s*(['\"`])(.*?)\1/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            results.push({ name: match[2], file: file });
        }
    });

    // Remove exact duplicates from multiple files just in case
    const uniqueMap = new Map();
    results.forEach(r => uniqueMap.set(r.name, r));
    results = Array.from(uniqueMap.values());

    console.log(`Found ${results.length} animations. Querying PokeAPI for types... This might take a few seconds.`);

    // To avoid blasting PokeAPI too hard, we chunk the requests
    const chunkedResults = [];
    for (let i = 0; i < results.length; i += 20) {
        chunkedResults.push(results.slice(i, i + 20));
    }

    const completeData = [];
    for (const chunk of chunkedResults) {
        const promises = chunk.map(async r => {
            const type = await fetchMoveType(r.name);
            return { ...r, type };
        });
        const resolvedChunk = await Promise.all(promises);
        completeData.push(...resolvedChunk);
    }

    console.log('Generating JSON...');
    const resultJson = {};

    const grouped = {};
    completeData.forEach(r => {
        if (!grouped[r.type]) grouped[r.type] = [];
        grouped[r.type].push(r);
    });

    // Sort groups alphabetically, but put System/Special at the end
    const sortedTypes = Object.keys(grouped).sort((a, b) => {
        if (a === 'System/Special') return 1;
        if (b === 'System/Special') return -1;
        return a.localeCompare(b);
    });

    sortedTypes.forEach(type => {
        resultJson[type] = grouped[type]
            .sort((a, b) => a.name.localeCompare(b.name))
            // Only output the file name to save tokens
            .reduce((acc, current) => {
                acc[current.name] = current.file.replace('js/anim/registry/', '');
                return acc;
            }, {});
    });

    if (!fs.existsSync('docs')) {
        fs.mkdirSync('docs');
    }
    fs.writeFileSync('docs/ANIMATION_DIRECTORY.json', JSON.stringify(resultJson, null, 2));
    console.log('Generated docs/ANIMATION_DIRECTORY.json based on PokeAPI types!');
}

run();
