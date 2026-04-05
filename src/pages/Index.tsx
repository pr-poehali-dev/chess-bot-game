import { useState } from "react";
import Icon from "@/components/ui/icon";

type Section = "home" | "game" | "stats" | "lessons" | "rules";

const PIECES: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

const INITIAL_BOARD = [
  ["r","n","b","q","k","b","n","r"],
  ["p","p","p","p","p","p","p","p"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["P","P","P","P","P","P","P","P"],
  ["R","N","B","Q","K","B","N","R"],
];

const ANALYSIS_GAMES = [
  {
    id: 1,
    white: "Карпов А.",
    black: "Каспаров Г.",
    date: "12 марта 2024",
    result: "1-0",
    moves: 42,
    opening: "Сицилианская защита",
    bestMove: "Фd4",
    comment: "Великолепный эндшпиль. Белые грамотно использовали преимущество двух слонов в открытой позиции. Ключевой момент — ход 28.Фd4, создающий неотразимые угрозы по диагонали.",
  },
  {
    id: 2,
    white: "Иванов С.",
    black: "Петров М.",
    date: "8 марта 2024",
    result: "½-½",
    moves: 65,
    opening: "Ферзевый гамбит",
    bestMove: "Лe1",
    comment: "Напряжённая борьба в дебюте ферзевого гамбита. Позиция оставалась равной на протяжении всей партии. Упущенный шанс на ходу 41 мог дать белым решающее преимущество.",
  },
  {
    id: 3,
    white: "Смирнов В.",
    black: "Козлов Д.",
    date: "1 марта 2024",
    result: "0-1",
    moves: 38,
    opening: "Испанская партия",
    bestMove: "Кf5",
    comment: "Чёрные провели блестящую атаку на королевском фланге. Жертва коня на ходу 24 оказалась решающей. Белые не нашли единственного защищающего хода и вынуждены были сдаться.",
  },
];

const LESSONS = [
  { id: 1, title: "Основы дебюта", level: "Начинающий", duration: "15 мин", icon: "BookOpen", desc: "Изучите принципы развития фигур, контроль центра и безопасность короля." },
  { id: 2, title: "Тактические удары", level: "Средний", duration: "25 мин", icon: "Zap", desc: "Двойной удар, связка, вилка — освойте основные тактические приёмы." },
  { id: 3, title: "Эндшпиль: Ладья и король", level: "Средний", duration: "20 мин", icon: "Crown", desc: "Техника реализации преимущества в окончаниях с ладьями." },
  { id: 4, title: "Стратегия позиционной игры", level: "Продвинутый", duration: "35 мин", icon: "Target", desc: "Слабые поля, пешечные структуры и долгосрочные планы." },
  { id: 5, title: "Дебют: Сицилианская защита", level: "Средний", duration: "30 мин", icon: "Shield", desc: "Разберём основные варианты одного из самых популярных дебютов." },
  { id: 6, title: "Атака на короля", level: "Продвинутый", duration: "40 мин", icon: "Swords", desc: "Жертвы и комбинации при атаке на короля противника." },
];

const STATS = {
  total: 142,
  wins: 89,
  draws: 21,
  losses: 32,
  rating: 1847,
  ratingChange: 23,
  streak: 7,
  bestGame: "vs Петров М.",
  history: [1820, 1835, 1810, 1842, 1830, 1847],
};

const RULES_DATA = [
  {
    title: "Ходы фигур",
    icon: "ChevronRight",
    content: "Каждая фигура ходит по-своему: Король — на одну клетку в любом направлении. Ферзь — на любое расстояние по горизонтали, вертикали или диагонали. Ладья — по горизонтали и вертикали. Слон — по диагонали. Конь — буквой Г (2+1 клетки). Пешка — вперёд на 1 клетку (первый ход — на 2).",
  },
  {
    title: "Специальные ходы",
    icon: "Star",
    content: "Рокировка: король смещается на 2 клетки к ладье, ладья перепрыгивает через короля. Возможна, если король и ладья не ходили, между ними нет фигур, и король не под шахом. Взятие на проходе: пешка может взять пешку противника, только что прошедшую две клетки. Превращение: пешка, достигшая последней горизонтали, превращается в любую фигуру (кроме короля).",
  },
  {
    title: "Цель игры",
    icon: "Target",
    content: "Цель — поставить мат королю противника. Мат — это шах (нападение на короля), от которого нет защиты. Партия может завершиться ничьёй: при согласии сторон, пате (нет хода, но нет шаха), троекратном повторении позиции, правиле 50 ходов или недостатке материала.",
  },
  {
    title: "Оценка позиции",
    icon: "BarChart2",
    content: "Фигуры имеют примерную ценность: Ферзь — 9 очков, Ладья — 5, Слон и Конь — 3, Пешка — 1. Позиционные факторы: контроль центра, активность фигур, безопасность короля, пешечная структура. Хороший план всегда важнее материального преимущества.",
  },
];

interface CastleRights { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean; }

function getLegalMoves(
  board: string[][],
  row: number,
  col: number,
  castleRights: CastleRights,
  enPassant: [number, number] | null,
): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];
  const isW = (p: string) => p !== "" && p === p.toUpperCase();
  const isB = (p: string) => p !== "" && p === p.toLowerCase();
  const friendly = isW(piece) ? isW : isB;
  const enemy    = isW(piece) ? isB : isW;
  const moves: [number, number][] = [];
  const inBounds = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

  const slide = (drs: number[], dcs: number[]) => {
    for (let i = 0; i < drs.length; i++) {
      let r = row + drs[i], c = col + dcs[i];
      while (inBounds(r, c)) {
        if (friendly(board[r][c])) break;
        moves.push([r, c]);
        if (enemy(board[r][c])) break;
        r += drs[i]; c += dcs[i];
      }
    }
  };
  const jump = (deltas: [number, number][]) => {
    for (const [dr, dc] of deltas) {
      const r = row + dr, c = col + dc;
      if (inBounds(r, c) && !friendly(board[r][c])) moves.push([r, c]);
    }
  };

  const p = piece.toLowerCase();

  if (p === "r") slide([-1,1,0,0],[0,0,-1,1]);
  if (p === "b") slide([-1,-1,1,1],[-1,1,-1,1]);
  if (p === "q") { slide([-1,1,0,0],[0,0,-1,1]); slide([-1,-1,1,1],[-1,1,-1,1]); }
  if (p === "n") jump([[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]);

  if (p === "k") {
    jump([[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]);
    // Рокировка
    if (isW(piece) && row === 7 && col === 4) {
      if (castleRights.wK && !board[7][5] && !board[7][6] && board[7][7] === "R")
        moves.push([7, 6]);
      if (castleRights.wQ && !board[7][3] && !board[7][2] && !board[7][1] && board[7][0] === "R")
        moves.push([7, 2]);
    }
    if (isB(piece) && row === 0 && col === 4) {
      if (castleRights.bK && !board[0][5] && !board[0][6] && board[0][7] === "r")
        moves.push([0, 6]);
      if (castleRights.bQ && !board[0][3] && !board[0][2] && !board[0][1] && board[0][0] === "r")
        moves.push([0, 2]);
    }
  }

  if (p === "p") {
    const dir = isW(piece) ? -1 : 1;
    const startRow = isW(piece) ? 6 : 1;
    if (inBounds(row+dir, col) && !board[row+dir][col]) {
      moves.push([row+dir, col]);
      if (row === startRow && !board[row+2*dir][col]) moves.push([row+2*dir, col]);
    }
    for (const dc of [-1, 1]) {
      if (!inBounds(row+dir, col+dc)) continue;
      if (enemy(board[row+dir][col+dc])) moves.push([row+dir, col+dc]);
      // Взятие на проходе
      if (enPassant && enPassant[0] === row+dir && enPassant[1] === col+dc)
        moves.push([row+dir, col+dc]);
    }
  }

  return moves;
}

function ChessBoard() {
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [legalMoves, setLegalMoves] = useState<[number, number][]>([]);
  const [board, setBoard] = useState(INITIAL_BOARD.map(r => [...r]));
  const [turn, setTurn] = useState<"white" | "black">("white");
  const [castleRights, setCastleRights] = useState<CastleRights>({ wK: true, wQ: true, bK: true, bQ: true });
  const [enPassant, setEnPassant] = useState<[number, number] | null>(null);

  const isWhitePiece = (p: string) => p !== "" && p === p.toUpperCase();
  const isBlackPiece = (p: string) => p !== "" && p === p.toLowerCase();

  const handleClick = (row: number, col: number) => {
    const piece = board[row][col];
    if (!selected) {
      if ((turn === "white" && isWhitePiece(piece)) || (turn === "black" && isBlackPiece(piece))) {
        setSelected([row, col]);
        setLegalMoves(getLegalMoves(board, row, col, castleRights, enPassant));
      }
      return;
    }
    const [sr, sc] = selected;
    if (sr === row && sc === col) { setSelected(null); setLegalMoves([]); return; }
    const srcPiece = board[sr][sc];
    const dstPiece = board[row][col];
    if ((turn === "white" && isWhitePiece(dstPiece)) || (turn === "black" && isBlackPiece(dstPiece))) {
      setSelected([row, col]);
      setLegalMoves(getLegalMoves(board, row, col, castleRights, enPassant));
      return;
    }
    const isLegal = legalMoves.some(([r, c]) => r === row && c === col);
    if (!isLegal) { setSelected(null); setLegalMoves([]); return; }

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = srcPiece;
    newBoard[sr][sc] = "";

    // Рокировка — двигаем ладью
    if (srcPiece.toLowerCase() === "k" && Math.abs(col - sc) === 2) {
      if (col === 6) { newBoard[row][5] = newBoard[row][7]; newBoard[row][7] = ""; }
      if (col === 2) { newBoard[row][3] = newBoard[row][0]; newBoard[row][0] = ""; }
    }

    // Взятие на проходе — убираем пешку
    if (srcPiece.toLowerCase() === "p" && enPassant && row === enPassant[0] && col === enPassant[1]) {
      const capturedRow = turn === "white" ? row + 1 : row - 1;
      newBoard[capturedRow][col] = "";
    }

    // Обновляем права на рокировку
    const cr = { ...castleRights };
    if (srcPiece === "K") { cr.wK = false; cr.wQ = false; }
    if (srcPiece === "k") { cr.bK = false; cr.bQ = false; }
    if (srcPiece === "R" && sr === 7 && sc === 7) cr.wK = false;
    if (srcPiece === "R" && sr === 7 && sc === 0) cr.wQ = false;
    if (srcPiece === "r" && sr === 0 && sc === 7) cr.bK = false;
    if (srcPiece === "r" && sr === 0 && sc === 0) cr.bQ = false;

    // Взятие на проходе — запоминаем клетку
    let newEP: [number, number] | null = null;
    if (srcPiece.toLowerCase() === "p" && Math.abs(row - sr) === 2) {
      newEP = [(sr + row) / 2, col];
    }

    setBoard(newBoard);
    setCastleRights(cr);
    setEnPassant(newEP);
    setSelected(null);
    setLegalMoves([]);
    setTurn(turn === "white" ? "black" : "white");
  };

  const CELL = 52;
  const BOARD = CELL * 8;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm font-golos tracking-widest uppercase" style={{ color: "var(--gold-light)" }}>
        Ход: {turn === "white" ? "Белые ♔" : "Чёрные ♚"}
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
        <div style={{ display: "flex", flexDirection: "column", height: BOARD, paddingBottom: "0" }}>
          {[8,7,6,5,4,3,2,1].map(n => (
            <div key={n} style={{ height: CELL, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-muted)", fontSize: "11px", fontFamily: "var(--font-golos)", width: "18px" }}>{n}</div>
          ))}
        </div>
        <div>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(8, ${CELL}px)`,
            gridTemplateRows: `repeat(8, ${CELL}px)`,
            width: BOARD,
            height: BOARD,
            border: "3px solid var(--wood-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 2px var(--gold-dark)",
            borderRadius: "4px",
            overflow: "hidden",
          }}>
            {board.map((row, ri) =>
              row.map((piece, ci) => {
                const isLight = (ri + ci) % 2 === 0;
                const isSel = selected && selected[0] === ri && selected[1] === ci;
                const isLegal = legalMoves.some(([r, c]) => r === ri && c === ci);
                const isCapture = isLegal && piece !== "";
                return (
                  <div
                    key={`${ri}-${ci}`}
                    onClick={() => handleClick(ri, ci)}
                    style={{
                      width: CELL,
                      height: CELL,
                      background: isSel
                        ? "var(--gold-highlight)"
                        : isLight ? "var(--cell-light)" : "var(--cell-dark)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: isLegal ? "pointer" : "default",
                      transition: "background 0.15s",
                      position: "relative",
                    }}
                  >
                    {piece && (
                      <span style={{
                        fontSize: "32px",
                        lineHeight: 1,
                        userSelect: "none",
                        position: "relative",
                        zIndex: 1,
                        filter: isWhitePiece(piece)
                          ? "drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
                          : "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
                        color: isWhitePiece(piece) ? "#f5e6c8" : "#1a0e05",
                      }}>
                        {PIECES[piece]}
                      </span>
                    )}
                    {isLegal && !isCapture && (
                      <div style={{
                        position: "absolute",
                        width: "34%",
                        height: "34%",
                        borderRadius: "50%",
                        background: "rgba(50, 180, 80, 0.75)",
                        boxShadow: "0 0 6px rgba(50,180,80,0.5)",
                        pointerEvents: "none",
                        zIndex: 2,
                      }} />
                    )}
                    {isCapture && (
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        border: "4px solid rgba(50, 180, 80, 0.8)",
                        boxShadow: "inset 0 0 6px rgba(50,180,80,0.4)",
                        pointerEvents: "none",
                        zIndex: 2,
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ display: "flex", width: BOARD, paddingTop: "4px" }}>
            {["a","b","c","d","e","f","g","h"].map(l => (
              <div key={l} style={{ width: CELL, color: "var(--gold-muted)", fontSize: "11px", fontFamily: "var(--font-golos)", textAlign: "center" }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => { setBoard(INITIAL_BOARD.map(r => [...r])); setSelected(null); setLegalMoves([]); setTurn("white"); setCastleRights({ wK: true, wQ: true, bK: true, bQ: true }); setEnPassant(null); }}
          className="wood-btn-sm"
        >
          <Icon name="RotateCcw" size={14} /> Сбросить
        </button>
        <button className="wood-btn-sm">
          <Icon name="BarChart2" size={14} /> Анализ
        </button>
      </div>
    </div>
  );
}

export default function Index() {
  const [active, setActive] = useState<Section>("home");
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: "home", label: "Главная", icon: "Home" },
    { id: "game", label: "Игра", icon: "Grid3x3" },
    { id: "stats", label: "Статистика", icon: "BarChart2" },
    { id: "lessons", label: "Уроки", icon: "BookOpen" },
    { id: "rules", label: "Правила", icon: "ScrollText" },
  ];

  return (
    <div className="chess-app">
      {/* Header */}
      <header className="chess-header">
        <div className="header-inner">
          <div className="logo-area">
            <span className="logo-piece">♛</span>
            <div>
              <div className="logo-title">Шахматный Клуб</div>
              <div className="logo-sub">Классическая игра</div>
            </div>
          </div>
          <nav className="main-nav">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`nav-item ${active === item.id ? "nav-active" : ""}`}
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main-content">

        {/* HOME */}
        {active === "home" && (
          <div className="section-home">
            <div className="hero-section">
              <div className="hero-bg-pieces" aria-hidden="true">
                {["♔","♕","♖","♗","♘","♙","♚","♛","♜","♝","♞","♟"].map((p, i) => (
                  <span key={i} className="bg-piece" style={{ "--i": i } as React.CSSProperties}>{p}</span>
                ))}
              </div>
              <div className="hero-content">
                <div className="hero-badge">Добро пожаловать в клуб</div>
                <h1 className="hero-title">Искусство<br /><em>шахматной игры</em></h1>
                <p className="hero-desc">
                  Играйте партии, изучайте дебюты, анализируйте сыгранные позиции
                  с профессиональными комментариями и лучшими ходами.
                </p>
                <div className="hero-btns">
                  <button className="wood-btn" onClick={() => setActive("game")}>
                    <Icon name="Play" size={18} /> Начать игру
                  </button>
                  <button className="wood-btn-outline" onClick={() => setActive("lessons")}>
                    <Icon name="BookOpen" size={18} /> Уроки
                  </button>
                </div>
              </div>
              <div className="hero-board-preview">
                <ChessBoard />
              </div>
            </div>

            <div className="features-grid">
              {[
                { icon: "BarChart2", title: "Анализ партий", desc: "Разбор ходов с комментариями и указанием лучших продолжений" },
                { icon: "BookOpen", title: "Уроки и дебюты", desc: "Структурированные уроки от начинающего до продвинутого уровня" },
                { icon: "Trophy", title: "Рейтинг и статистика", desc: "Отслеживайте прогресс, рейтинг и результаты сыгранных партий" },
                { icon: "Lightbulb", title: "Лучшие ходы", desc: "Система подсказок покажет оптимальное продолжение в любой позиции" },
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon">
                    <Icon name={f.icon} size={24} />
                  </div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GAME */}
        {active === "game" && (
          <div className="section-page">
            <div className="page-header">
              <h2 className="page-title">Игра</h2>
              <div className="gold-line" />
            </div>
            <div className="game-layout">
              <div className="game-board-wrap">
                <ChessBoard />
              </div>
              <div className="game-sidebar">
                <div className="sidebar-card">
                  <h3 className="sidebar-title">Текущая партия</h3>
                  <div className="player-row">
                    <span className="player-piece black-piece">♚</span>
                    <div>
                      <div className="player-name">Чёрные</div>
                      <div className="player-rating">Рейтинг: 1824</div>
                    </div>
                  </div>
                  <div className="vs-divider">— vs —</div>
                  <div className="player-row">
                    <span className="player-piece white-piece">♔</span>
                    <div>
                      <div className="player-name">Белые (Вы)</div>
                      <div className="player-rating">Рейтинг: 1847</div>
                    </div>
                  </div>
                </div>
                <div className="sidebar-card">
                  <h3 className="sidebar-title">Журнал ходов</h3>
                  <div className="moves-log">
                    {[["e4","e5"],["Кf3","Кc6"],["Сb5","a6"]].map(([w,b], i) => (
                      <div key={i} className="move-row">
                        <span className="move-num">{i+1}.</span>
                        <span className="move">{w}</span>
                        <span className="move">{b}</span>
                      </div>
                    ))}
                    <div className="move-row">
                      <span className="move-num">4.</span>
                      <span style={{ color: "var(--gold-muted)", fontStyle: "italic" }}>— ожидание хода</span>
                    </div>
                  </div>
                </div>
                <div className="sidebar-card hint-card">
                  <div className="hint-header">
                    <Icon name="Lightbulb" size={16} />
                    <span>Лучший ход</span>
                  </div>
                  <div className="hint-move">Сa4</div>
                  <div className="hint-desc">Испанская партия. Продолжение атаки на пункт e5.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATS */}
        {active === "stats" && (
          <div className="section-page">
            <div className="page-header">
              <h2 className="page-title">Статистика</h2>
              <div className="gold-line" />
            </div>

            <div className="stats-top">
              <div className="stat-card rating-card">
                <div className="stat-label">Рейтинг Эло</div>
                <div className="stat-big">{STATS.rating}</div>
                <div className="stat-change positive">
                  <Icon name="TrendingUp" size={16} />
                  +{STATS.ratingChange} за месяц
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Серия побед</div>
                <div className="stat-big" style={{ color: "var(--gold)" }}>🔥 {STATS.streak}</div>
                <div className="stat-sub">побед подряд</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Всего партий</div>
                <div className="stat-big">{STATS.total}</div>
                <div className="stat-sub">{STATS.bestGame} — лучшая</div>
              </div>
            </div>

            <div className="results-section">
              <h3 className="section-subtitle">Результаты партий</h3>
              <div className="results-bar-wrap">
                <div className="results-bar">
                  <div className="bar-segment bar-win" style={{ width: `${(STATS.wins/STATS.total)*100}%` }}>
                    {STATS.wins} побед
                  </div>
                  <div className="bar-segment bar-draw" style={{ width: `${(STATS.draws/STATS.total)*100}%` }}>
                    {STATS.draws}
                  </div>
                  <div className="bar-segment bar-loss" style={{ width: `${(STATS.losses/STATS.total)*100}%` }}>
                    {STATS.losses} пор.
                  </div>
                </div>
              </div>
              <div className="results-legend">
                <span><span className="legend-dot dot-win" />Победы: {STATS.wins} ({Math.round(STATS.wins/STATS.total*100)}%)</span>
                <span><span className="legend-dot dot-draw" />Ничьи: {STATS.draws} ({Math.round(STATS.draws/STATS.total*100)}%)</span>
                <span><span className="legend-dot dot-loss" />Поражения: {STATS.losses} ({Math.round(STATS.losses/STATS.total*100)}%)</span>
              </div>
            </div>

            <div className="rating-history">
              <h3 className="section-subtitle">Динамика рейтинга</h3>
              <div className="rating-chart">
                {STATS.history.map((val, i) => {
                  const min = Math.min(...STATS.history);
                  const max = Math.max(...STATS.history);
                  const pct = ((val - min) / (max - min + 1)) * 80 + 20;
                  return (
                    <div key={i} className="chart-col">
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill" style={{ height: `${pct}%` }} />
                      </div>
                      <div className="chart-month">{["Янв","Фев","Мар","Апр","Май","Июн"][i]}</div>
                      <div className="chart-val">{val}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* LESSONS */}
        {active === "lessons" && (
          <div className="section-page">
            <div className="page-header">
              <h2 className="page-title">Уроки</h2>
              <div className="gold-line" />
            </div>
            <div className="lessons-grid">
              {LESSONS.map((lesson) => (
                <div key={lesson.id} className="lesson-card">
                  <div className="lesson-icon-wrap">
                    <Icon name={lesson.icon} size={28} />
                  </div>
                  <div className="lesson-body">
                    <div className="lesson-meta-row">
                      <span className={`lesson-level ${lesson.level === "Начинающий" ? "level-green" : lesson.level === "Средний" ? "level-gold" : "level-red"}`}>
                        {lesson.level}
                      </span>
                      <span className="lesson-duration">
                        <Icon name="Clock" size={12} /> {lesson.duration}
                      </span>
                    </div>
                    <h3 className="lesson-title">{lesson.title}</h3>
                    <p className="lesson-desc">{lesson.desc}</p>
                    <button className="wood-btn-sm">
                      <Icon name="Play" size={14} /> Начать урок
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RULES */}
        {active === "rules" && (
          <div className="section-page">
            <div className="page-header">
              <h2 className="page-title">Правила игры</h2>
              <div className="gold-line" />
            </div>
            <div className="rules-intro">
              <span className="rules-big-piece">♟</span>
              <p>Шахматы — одна из древнейших игр мира. Два игрока поочерёдно ходят своими фигурами на доске 8×8, стремясь поставить мат королю противника.</p>
            </div>
            <div className="rules-list">
              {RULES_DATA.map((rule, i) => (
                <div key={i} className={`rule-item ${expandedRule === i ? "rule-expanded" : ""}`}>
                  <button className="rule-header" onClick={() => setExpandedRule(expandedRule === i ? null : i)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Icon name={rule.icon} size={20} />
                      <span className="rule-title">{rule.title}</span>
                    </div>
                    <Icon name={expandedRule === i ? "ChevronUp" : "ChevronDown"} size={20} />
                  </button>
                  {expandedRule === i && (
                    <div className="rule-content">{rule.content}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="analysis-section">
              <h3 className="section-subtitle">Анализ сыгранных партий</h3>
              <div className="analysis-list">
                {ANALYSIS_GAMES.map(game => (
                  <div
                    key={game.id}
                    className="analysis-card"
                    onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
                  >
                    <div className="analysis-top">
                      <div className="analysis-players">
                        <span className="a-white">♔ {game.white}</span>
                        <span className={`a-result ${game.result === "1-0" ? "r-white" : game.result === "0-1" ? "r-black" : "r-draw"}`}>
                          {game.result}
                        </span>
                        <span className="a-black">♚ {game.black}</span>
                      </div>
                      <div className="analysis-meta">
                        <span>{game.opening}</span>
                        <span>·</span>
                        <span>{game.moves} ходов</span>
                        <span>·</span>
                        <span>{game.date}</span>
                        <Icon name={selectedGame === game.id ? "ChevronUp" : "ChevronDown"} size={16} />
                      </div>
                    </div>
                    {selectedGame === game.id && (
                      <div className="analysis-body">
                        <div className="best-move-row">
                          <Icon name="Star" size={16} />
                          <span>Лучший ход: <strong>{game.bestMove}</strong></span>
                        </div>
                        <p className="analysis-comment">{game.comment}</p>
                        <button
                          className="wood-btn-sm"
                          onClick={e => { e.stopPropagation(); setActive("game"); }}
                        >
                          <Icon name="Play" size={14} /> Просмотр партии
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="chess-footer">
        <span className="footer-pieces">♔ ♕ ♖ ♗ ♘ ♙</span>
        <span>Шахматный Клуб © 2024</span>
        <span className="footer-pieces">♟ ♞ ♝ ♜ ♛ ♚</span>
      </footer>
    </div>
  );
}