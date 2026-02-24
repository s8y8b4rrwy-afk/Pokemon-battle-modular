def generate_path(grid):
    lines = grid.strip().split('\n')
    paths = []
    for y, line in enumerate(lines):
        for x, char in enumerate(line):
            if char != ' ':
                # 1x1 rect at x, y
                paths.append(f"M{x},{y} h1 v1 h-1 Z")
    return " ".join(paths)

shapes = {
    "lightning": ["  XX    ",
                  "  XXX   ",
                  "   XXX  ",
                  "   XXXX ",
                  "    XXX ",
                  "  XXXX  ",
                  "   XXX  ",
                  "     X  "],
                  
    "fire":      ["   X    ",
                  "  XXX X ",
                  " XXXXXX ",
                  "XXXXXXX ",
                  " XXXXX  ",
                  "  XXX   "],
                  
    "water":     ["   XX   ",
                  "  XXXX  ",
                  " XXXXXX ",
                  " XXXXXX ",
                  " XXXXXX ",
                  "  XXXX  ",
                  "   XX   "],
                  
    "leaf":      ["   X    ",
                  "  XXX   ",
                  " XXXXX  ",
                  "XXXXXX  ",
                  " XXXXX  ",
                  "  XXX   ",
                  "    XX  "],
                  
    "star":      ["   XX   ",
                  " XXXXXX ",
                  "XXXXXXXX",
                  " XXXXXX ",
                  " XXXXXX ",
                  "XX    XX"],
                  
    "claw":      ["X  X  X ",
                  "XX XX XX",
                  "X  X  X ",
                  " X  X  X",
                  " X  X  X",
                  " X  X  X"],
                  
    "fist":      ["  XXXX  ",
                  " XXXXXX ",
                  " XXXXXX ",
                  " XX  XX ",
                  " X XX X ",
                  "  XXXX  "],

    "skull":     ["  XXXX  ",
                  " XXXXXX ",
                  " XX  XX ",
                  " XXXXXX ",
                  "  X XX  ",
                  "  X XX  "],
                  
    "spiral":    [" XXXXX  ",
                  "X     X ",
                  "X XXX X ",
                  "X X   X ",
                  "X XXXXX ",
                  "X       ",
                  " XXXXX  "],
                  
    "bird":      [" X    X ",
                  "XXXX XXX",
                  "  XXXX  ",
                  "   XX   ",
                  "   XX   ",
                  "   XX   "],
                  
    "duck":      ["  XX    ",
                  "XXXXX   ",
                  "   XX   ",
                  "  XXXX  ",
                  " XXXXXX ",
                  "  XXXX  "],
                  
    "rock":      ["   XX   ",
                  " XXXXX  ",
                  "XXXXX X ",
                  "XXXXXXX ",
                  " XXXXX  ",
                  "  XXX   "],
                  
    "sparkle":   ["   XX   ",
                  "   XX   ",
                  " XXXXXX ",
                  " XXXXXX ",
                  "   XX   ",
                  "   XX   "],
                  
    "music":     ["   XXX  ",
                  "   X X  ",
                  "   X X  ",
                  "  XX XX ",
                  " XXX XXX"],
                  
    "heart":     [" XX  XX ",
                  "XXXXXXXX",
                  "XXXXXXXX",
                  " XXXXXX ",
                  "  XXXX  ",
                  "   XX   "],
                  
    "eye":       ["   XX   ",
                  " XXXXXX ",
                  "XX XX XX",
                  "XX XX XX",
                  " XXXXXX ",
                  "   XX   "],
                  
    "bubble":    ["  XXXX  ",
                  " XX  XX ",
                  "XX X  XX",
                  "XX    XX",
                  " XX  XX ",
                  "  XXXX  "],
                  
    "zzz":       ["XXXX  XX",
                  "  X   X ",
                  " X   X  ",
                  "XXXX XX "],

    "drop":      ["   XX   ",
                  "   XX   ",
                  "  XXXX  ",
                  " XXXXXX ",
                  "  XXXX  ",
                  "   XX   "],

    "shield":    ["XXXXXX  ",
                  "X    X  ",
                  "XXXXXX  ",
                  " XXXX   ",
                  "  XX    "],
                  
    "wall":      ["XXXX XXX",
                  "X  X X X",
                  "XXXX XXX",
                  "XX XXXXX",
                  "X X X  X",
                  "XX XXXXX"],
                  
    "anger":     ["X X  X X",
                  " X    X ",
                  "  XXXX  ",
                  " X    X ",
                  "X X  X X"]
}

for k, v in shapes.items():
    print(f"{k}: {{ vb: '0 0 {len(v[0])} {len(v)}', d: '{generate_path(chr(10).join(v))}' }},")
