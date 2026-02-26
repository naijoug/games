(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ChessContent = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const PUZZLE_TIERS = {
    mate1: [
      {
        id: "mate1-scholars-finish",
        title: "学者杀收官",
        goalLabel: "一步杀",
        sideToMove: "w",
        setupMoves: ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6"],
        solutionLine: [{ actor: "player", san: "Qxf7#" }],
        intro: "白方已摆出经典进攻形态，找到直接将死的一步。",
      },
      {
        id: "mate1-fools-mate",
        title: "愚人将杀",
        goalLabel: "一步杀",
        sideToMove: "b",
        setupMoves: ["f3", "e5", "g4"],
        solutionLine: [{ actor: "player", san: "Qh4#" }],
        intro: "黑方抓住王翼暴露的机会，一步结束战斗。",
      },
    ],
    mate2: [
      {
        id: "mate2-scholars-build",
        title: "学者杀两步版",
        goalLabel: "两步杀",
        sideToMove: "w",
        setupMoves: ["e4", "e5", "Bc4", "Nc6"],
        solutionLine: [
          { actor: "player", san: "Qh5" },
          { actor: "opponent", san: "Nf6" },
          { actor: "player", san: "Qxf7#" },
        ],
        intro: "按照教学线路制造威胁并完成将死。",
      },
      {
        id: "mate2-black-fools-route",
        title: "黑方愚人将杀（两步）",
        goalLabel: "两步杀",
        sideToMove: "b",
        setupMoves: ["f3"],
        solutionLine: [
          { actor: "player", san: "e5" },
          { actor: "opponent", san: "g4" },
          { actor: "player", san: "Qh4#" },
        ],
        intro: "黑方先争夺中心，等待白方继续暴露王翼后完成将死。",
      },
    ],
    mate3: [
      {
        id: "mate3-legal-trap",
        title: "Légal 经典弃后陷阱",
        goalLabel: "三步杀",
        sideToMove: "w",
        setupMoves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "d6", "Nc3", "Bg4", "h3", "Bh5"],
        solutionLine: [
          { actor: "player", san: "Nxe5" },
          { actor: "opponent", san: "Bxd1" },
          { actor: "player", san: "Bxf7+" },
          { actor: "opponent", san: "Ke7" },
          { actor: "player", san: "Nd5#" },
        ],
        intro: "经典战术主题：先手弃后，利用子力协同完成致命打击。",
      },
      {
        id: "mate3-scholars-full",
        title: "学者杀完整三步",
        goalLabel: "三步杀",
        sideToMove: "w",
        setupMoves: ["e4", "e5"],
        solutionLine: [
          { actor: "player", san: "Bc4" },
          { actor: "opponent", san: "Nc6" },
          { actor: "player", san: "Qh5" },
          { actor: "opponent", san: "Nf6" },
          { actor: "player", san: "Qxf7#" },
        ],
        intro: "从更早阶段开始构建威胁，体验将军、发展与终结的衔接。",
      },
    ],
  };

  const LESSONS = [
    {
      id: "legal-mate",
      title: "Légal's Mate（经典弃后将杀）",
      summary: "通过弃后诱导对手贪吃，随后用轻子配合完成将杀的经典组合。",
      moves: [
        { san: "e4", note: "白方占据中心并打开王象与后。" },
        { san: "e5" },
        { san: "Nf3", note: "发展王马，继续施压 e5。" },
        { san: "Nc6" },
        { san: "Bc4", note: "瞄准 f7，形成潜在战术支点。" },
        { san: "d6" },
        { san: "Nc3" },
        { san: "Bg4", note: "黑方钉住马，但也给了白方战术素材。" },
        { san: "h3" },
        { san: "Bh5" },
        { san: "Nxe5", note: "关键一击：表面上白后要被吃，实则是组合开始。" },
        { san: "Bxd1" },
        { san: "Bxf7+", note: "白方用象和马形成连续先手。" },
        { san: "Ke7" },
        { san: "Nd5#", note: "终结：马、象与王位受限共同构成将杀网。" },
      ],
    },
    {
      id: "scholars-mate",
      title: "Scholar's Mate（学者杀）",
      summary: "最经典的新手战术教学之一：快速发展并集中攻击 f7 弱点。",
      moves: [
        { san: "e4", note: "白方打开后与象，争夺中心。" },
        { san: "e5" },
        { san: "Bc4", note: "白方的象直接瞄准 f7。" },
        { san: "Nc6" },
        { san: "Qh5", note: "后加入攻击，形成对 f7 的双重威胁。" },
        { san: "Nf6", note: "黑方发展马，但忽视了 f7 的致命点。" },
        { san: "Qxf7#", note: "白后吃兵将死，黑王无处可逃。" },
      ],
    },
    {
      id: "opera-game",
      title: "Morphy Opera Game（节选终局组合）",
      summary: "展现快速发展、弃子打开线路与重子协同压制的经典范例。",
      moves: [
        { san: "e4", note: "Morphy 以开放局开局，强调先手与发展。" },
        { san: "e5" },
        { san: "Nf3" },
        { san: "d6" },
        { san: "d4", note: "直接挑战中心，争取主动。" },
        { san: "Bg4" },
        { san: "dxe5" },
        { san: "Bxf3" },
        { san: "Qxf3" },
        { san: "dxe5" },
        { san: "Bc4" },
        { san: "Nf6" },
        { san: "Qb3", note: "同时盯住 b7 与 f7，制造双重压力。" },
        { san: "Qe7" },
        { san: "Nc3" },
        { san: "c6" },
        { san: "Bg5" },
        { san: "b5" },
        { san: "Nxb5", note: "开始战术突破，优先考虑王安全与线路。" },
        { san: "cxb5" },
        { san: "Bxb5+" },
        { san: "Nbd7" },
        { san: "O-O-O", note: "完成发展并把车快速投入 d 线。" },
        { san: "Rd8" },
        { san: "Rxd7", note: "典型交换牺牲，清除关键防守者。" },
        { san: "Rxd7" },
        { san: "Rd1" },
        { san: "Qe6" },
        { san: "Bxd7+", note: "继续抽走防守子，让黑王彻底裸露。" },
        { san: "Nxd7" },
        { san: "Qb8+" },
        { san: "Nxb8" },
        { san: "Rd8#", note: "所有子力协调到位，完成经典将杀。" },
      ],
    },
  ];

  return {
    PUZZLE_TIERS,
    LESSONS,
  };
});
