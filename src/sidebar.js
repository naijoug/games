export function initSidebar(activeGame) {
  const games = [
    '2048',
    'breakout',
    'chess',
    'codebreaker',
    'connect4',
    'hangman',
    'hackerword',
    'invaders',
    'lightsout',
    'memory',
    'minesweeper',
    'pong',
    'simon',
    'snake',
    'sokoban',
    'tictactoe',
    'xiangqi',
  ];

  const sidebarHTML = `
    <div class="sidebar">
      <div class="logo">
        <span class="logo-prompt">&gt;</span>
        <span class="logo-text">terminal_games</span>
      </div>
      <nav class="nav">
        ${games.map(game => `
          <a href="/games/${game}/index.html" class="nav-item ${game === activeGame ? 'active' : ''}">
            $ ${game}
          </a>
        `).join('')}
      </nav>
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
}
