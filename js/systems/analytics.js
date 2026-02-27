/**
 * Analytics System
 * Handles event tracking via GoatCounter
 */
const Analytics = {
    /**
     * Track a custom event
     * @param {string} name - Event name (e.g., 'battle_win')
     * @param {string} title - Optional human-readable title
     */
    trackEvent: function (name, title = '') {
        try {
            if (window.goatcounter && window.goatcounter.count) {
                window.goatcounter.count({
                    path: name,
                    title: title || name,
                    event: true
                });
                console.log(`[Analytics] Tracked event: ${name}`);
            }
        } catch (e) {
            console.warn('[Analytics] Failed to track event:', e);
        }
    },

    /**
     * Track an event only once per session/browser
     */
    trackOnce: function (key, name, title = '') {
        const sessionKey = `analytics_once_${key}`;
        if (sessionStorage.getItem(sessionKey)) return;

        this.trackEvent(name, title);
        sessionStorage.setItem(sessionKey, 'true');
    }
};
