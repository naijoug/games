const fs = require('fs');
const path = require('path');

const games = ['2048', 'chess', 'connect4', 'hangman', 'memory', 'minesweeper', 'simon', 'snake', 'tictactoe', 'xiangqi'];

const layoutTemplate = (game, content, extraHead) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terminal Games - ${game}</title>
  <link rel="stylesheet" href="../../src/style.css">
  ${extraHead || ''}
  <style>
    /* Global Terminal Overrides for v1 */
    body { margin: 0; }
    
    /* Strip out old backgrounds and colors */
    .page, .layout, main, .board-wrap, .panel, .glass, .glass-sub { 
      background: transparent !important; 
      color: var(--text-primary) !important;
      box-shadow: none !important;
      border-radius: 0 !important;
    }

    .board, #board, canvas {
      border: 1px solid var(--border-primary) !important;
      background: var(--bg-elevated) !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }

    button, .btn, .primary-btn {
      background: transparent !important;
      border: 1px solid var(--border-primary) !important;
      color: var(--accent-green) !important;
      font-family: var(--font-mono-ui) !important;
      cursor: pointer !important;
      border-radius: 0 !important;
      text-transform: lowercase;
    }
    
    button:before { content: "["; color: var(--text-secondary); }
    button:after { content: "]"; color: var(--text-secondary); }

    button:hover { border-color: var(--accent-green) !important; }
    
    /* Typography Overrides */
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-mono-ui) !important;
      color: var(--text-emphasis) !important;
      text-transform: lowercase;
    }

    /* Strip rounded corners everywhere */
    * { border-radius: 0 !important; }
    
    /* Make game-area take full width and height */
    .game-area-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="logo">
      <span class="logo-prompt">&gt;</span>
      <span class="logo-text">terminal_games</span>
    </div>
    <nav class="nav">
      ${games.map(g => `<a href="../${g}/index.html" class="nav-item ${g === game ? 'active' : ''}">$ ${g}</a>`).join('\n      ')}
    </nav>
  </div>
  <div class="main-content">
    <div class="header">
      <div class="title-container">
        <span class="title-prompt">&gt;</span>
        <span class="title-text">game_${game}</span>
      </div>
      <div class="subtitle">// initialized</div>
    </div>
    <div class="game-area">
      <div class="game-area-wrapper">
        ${content}
      </div>
    </div>
  </div>
</body>
</html>`;

games.forEach(game => {
  const v1Dir = path.join(__dirname, '..', 'v1', 'games', game);
  const newDir = path.join(__dirname, '..', 'games', game);
  
  if (fs.existsSync(v1Dir)) {
    // Copy all js and css
    fs.readdirSync(v1Dir).forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.css') || fs.statSync(path.join(v1Dir, file)).isDirectory()) {
        fs.cpSync(path.join(v1Dir, file), path.join(newDir, file), { recursive: true });
      }
    });

    // Read old index.html and extract body/head
    const indexHtml = fs.readFileSync(path.join(v1Dir, 'index.html'), 'utf8');
    
    let bodyMatch = indexHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : '';
    
    // Extract scripts to append them later
    let scripts = [];
    bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, match => {
      scripts.push(match);
      return '';
    });
    
    // Convert <body> elements into the template
    let extraHead = `<link rel="stylesheet" href="./styles.css">\n`;

    let finalBody = bodyContent + '\n' + scripts.join('\n');

    fs.writeFileSync(path.join(newDir, 'index.html'), layoutTemplate(game, finalBody, extraHead));
  }
});
