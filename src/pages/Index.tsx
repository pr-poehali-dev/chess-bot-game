import { useState, useEffect, useRef } from "react";
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

const DEBUT_LESSON = {
  title: "Основы дебюта",
  intro: "Дебют — это первые 10–15 ходов партии. Именно здесь закладывается фундамент всей игры. Три главных принципа дебюта помогут вам не уступить сопернику уже с первых ходов.",
  principles: [
    {
      num: "01",
      title: "Контролируйте центр",
      icon: "Target",
      color: "#c9a227",
      text: "Центр доски (клетки e4, e5, d4, d5) — самые важные поля. Фигуры в центре контролируют больше клеток и быстрее перебрасываются на любой фланг. Начинайте с хода пешкой на e4 или d4 — это сразу захватывает центр.",
      tip: "Лучшие первые ходы: 1.e4 или 1.d4 за белых, 1...e5 или 1...d5 за чёрных.",
      board: [
        ["r","n","b","q","k","b","n","r"],
        ["p","p","p","p","","p","p","p"],
        ["","","","","","","",""],
        ["","","","","p","","",""],
        ["","","","","P","","",""],
        ["","","","","","","",""],
        ["P","P","P","P","","P","P","P"],
        ["R","N","B","Q","K","B","N","R"],
      ],
      highlight: [[3,4],[4,4],[3,3],[4,3]],
    },
    {
      num: "02",
      title: "Развивайте фигуры",
      icon: "Zap",
      color: "#7abf7a",
      text: "Каждый ход в дебюте должен вводить в игру новую фигуру. Кони и слоны должны выйти с исходных позиций как можно раньше. Не ходите одной фигурой дважды без крайней необходимости — это потеря темпа.",
      tip: "Правило: к 5-му ходу оба коня и хотя бы один слон должны быть развиты.",
      board: [
        ["r","","b","q","k","b","","r"],
        ["p","p","p","p","","p","p","p"],
        ["","","n","","","n","",""],
        ["","","","","p","","",""],
        ["","","","","P","","",""],
        ["","","N","","","N","",""],
        ["P","P","P","P","","P","P","P"],
        ["R","","B","Q","K","B","","R"],
      ],
      highlight: [[2,2],[2,5],[5,2],[5,5]],
    },
    {
      num: "03",
      title: "Сделайте рокировку",
      icon: "Shield",
      color: "#7ab0df",
      text: "Рокировка — важнейший ход в дебюте. Она одновременно прячет короля в безопасное место и активирует ладью. Старайтесь сделать рокировку в первые 10 ходов. Король в центре в миттельшпиле — мишень для атаки.",
      tip: "Для рокировки: освободите поля между королём и ладьёй (выведите коня и слона).",
      board: [
        ["r","","b","q","","r","k",""],
        ["p","p","p","p","","p","p","p"],
        ["","","n","","","n","",""],
        ["","","","","p","","",""],
        ["","","","","P","","",""],
        ["","","N","","","N","",""],
        ["P","P","P","P","","P","P","P"],
        ["R","","B","Q","","R","K",""],
      ],
      highlight: [[0,6],[7,6]],
    },
    {
      num: "04",
      title: "Не выводите ферзя рано",
      icon: "AlertTriangle",
      color: "#e08080",
      text: "Ферзь — самая сильная фигура, но в дебюте он легко теряет темп под атаками. Соперник будет гонять его по всей доске, пока сам развивает фигуры. Выводите ферзя только после того, как развили коней и слонов.",
      tip: "Исключение: некоторые дебютные системы допускают ранний выход ферзя, но это требует точной игры.",
      board: [
        ["r","n","b","","k","b","n","r"],
        ["p","p","p","p","","p","p","p"],
        ["","","","","","","",""],
        ["","","","","p","","",""],
        ["","","","","P","q","",""],
        ["","","","","","","",""],
        ["P","P","P","P","","P","P","P"],
        ["R","N","B","Q","K","B","N","R"],
      ],
      highlight: [[4,5]],
    },
    {
      num: "05",
      title: "Не ходите пешками без нужды",
      icon: "XCircle",
      color: "#c9a227",
      text: "Лишние пешечные ходы в дебюте — потеря времени. Каждый пешечный ход, не связанный с захватом центра или развитием, даёт сопернику лишний темп. Двигайте только те пешки, которые открывают дорогу фигурам.",
      tip: "Хорошо: e4, d4, c3, b3 — помогают развитию. Плохо: a3, h3 в самом начале — просто потеря хода.",
      board: [
        ["r","n","b","q","k","b","n","r"],
        ["","p","p","p","","p","p",""],
        ["p","","","","","","","p"],
        ["","","","","p","","",""],
        ["","","","","P","","",""],
        ["P","","","","","","","P"],
        ["","P","P","P","","P","P",""],
        ["R","N","B","Q","K","B","N","R"],
      ],
      highlight: [[2,0],[2,7],[5,0],[5,7]],
    },
    {
      num: "06",
      title: "Популярные дебюты для начинающих",
      icon: "BookOpen",
      color: "#b07ab0",
      text: "Итальянская партия (1.e4 e5 2.Кf3 Кc6 3.Сc4): простой и эффективный дебют. Белые быстро развиваются и готовятся к рокировке. Лондонская система (1.d4 2.Кf3 3.Сf4): надёжный дебют с ясным планом — контроль центра и спокойное развитие.",
      tip: "Совет: выучите один дебют за белых и один за чёрных. Не пытайтесь запомнить всё сразу.",
      board: [
        ["r","","b","q","k","b","","r"],
        ["p","p","p","p","","p","p","p"],
        ["","","n","","","n","",""],
        ["","","","","p","","",""],
        ["","","B","","P","","",""],
        ["","","","","","N","",""],
        ["P","P","P","P","","P","P","P"],
        ["R","N","B","Q","K","","","R"],
      ],
      highlight: [[4,2],[5,5],[0,4],[7,4]],
    },
  ],
};

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

// Находит позицию короля заданного цвета
function findKing(board: string[][], isWhite: boolean): [number, number] | null {
  const king = isWhite ? "K" : "k";
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c] === king) return [r, c];
  return null;
}

// Проверяет, атакована ли клетка противником
function isSquareAttacked(board: string[][], row: number, col: number, byWhite: boolean): boolean {
  const isW = (p: string) => p !== "" && p === p.toUpperCase();
  const isB = (p: string) => p !== "" && p === p.toLowerCase();
  const isEnemy = byWhite ? isW : isB;

  // Проверяем атаку по направлениям (ладья/ферзь)
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    let r = row+dr, c = col+dc;
    while (r>=0&&r<8&&c>=0&&c<8) {
      const p = board[r][c];
      if (p) { if (isEnemy(p) && (p.toLowerCase()==="r"||p.toLowerCase()==="q")) return true; break; }
      r+=dr; c+=dc;
    }
  }
  // Диагонали (слон/ферзь)
  for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
    let r = row+dr, c = col+dc;
    while (r>=0&&r<8&&c>=0&&c<8) {
      const p = board[r][c];
      if (p) { if (isEnemy(p) && (p.toLowerCase()==="b"||p.toLowerCase()==="q")) return true; break; }
      r+=dr; c+=dc;
    }
  }
  // Конь
  for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
    const r=row+dr, c=col+dc;
    if (r>=0&&r<8&&c>=0&&c<8&&isEnemy(board[r][c])&&board[r][c].toLowerCase()==="n") return true;
  }
  // Король
  for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
    const r=row+dr, c=col+dc;
    if (r>=0&&r<8&&c>=0&&c<8&&isEnemy(board[r][c])&&board[r][c].toLowerCase()==="k") return true;
  }
  // Пешка
  const pawnDir = byWhite ? 1 : -1;
  for (const dc of [-1,1]) {
    const r=row+pawnDir, c=col+dc;
    if (r>=0&&r<8&&c>=0&&c<8&&isEnemy(board[r][c])&&board[r][c].toLowerCase()==="p") return true;
  }
  return false;
}

// Проверяет, находится ли король под шахом после хода
function isInCheckAfterMove(board: string[][], sr: number, sc: number, dr: number, dc: number, turn: "white" | "black"): boolean {
  const sim = board.map(r => [...r]);
  sim[dr][dc] = sim[sr][sc];
  sim[sr][sc] = "";
  const kingPos = findKing(sim, turn === "white");
  if (!kingPos) return false;
  return isSquareAttacked(sim, kingPos[0], kingPos[1], turn !== "white");
}

// Проверяет, атакована ли рокировочная клетка
function castlePathSafe(board: string[][], row: number, cols: number[], byWhite: boolean): boolean {
  return cols.every(c => !isSquareAttacked(board, row, c, byWhite));
}

// ─── Компонент урока «Основы дебюта» ──────────────────────────────────────────
function DebutLesson({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const principle = DEBUT_LESSON.principles[step];
  const total = DEBUT_LESSON.principles.length;
  const CELL = 44;

  const isW = (p: string) => p !== "" && p === p.toUpperCase();

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Шапка */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button className="wood-btn-sm" onClick={onBack}>
          <Icon name="ChevronLeft" size={14} /> Назад
        </button>
        <div>
          <div style={{ fontFamily: "var(--font-cormorant)", fontSize: 28, fontWeight: 600, color: "var(--gold-light)" }}>
            Основы дебюта
          </div>
          <div style={{ fontSize: 12, color: "var(--gold-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Урок для начинающих · 6 принципов
          </div>
        </div>
      </div>

      {/* Прогресс */}
      <div style={{ display: "flex", gap: 6 }}>
        {DEBUT_LESSON.principles.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              flex: 1, height: 4, borderRadius: 2, border: "none", cursor: "pointer",
              background: i === step ? "var(--gold)" : i < step ? "var(--gold-dark)" : "var(--wood-border)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {/* Контент принципа */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 32,
        alignItems: "start",
        background: "linear-gradient(135deg, rgba(45,26,10,0.85), rgba(26,14,5,0.95))",
        border: "1px solid var(--wood-border)",
        borderRadius: 10,
        padding: 28,
      }}>
        {/* Текст */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: `${principle.color}22`,
              border: `1px solid ${principle.color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: principle.color, flexShrink: 0,
            }}>
              <Icon name={principle.icon} size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--gold-muted)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Принцип {principle.num}
              </div>
              <div style={{ fontFamily: "var(--font-cormorant)", fontSize: 24, fontWeight: 600, color: principle.color, lineHeight: 1.1 }}>
                {principle.title}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--text-secondary)", margin: 0 }}>
            {principle.text}
          </p>

          <div style={{
            display: "flex", gap: 10, padding: "12px 16px",
            background: `${principle.color}10`,
            border: `1px solid ${principle.color}30`,
            borderRadius: 6,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <span style={{ fontSize: 13, color: "var(--cream)", lineHeight: 1.6 }}>{principle.tip}</span>
          </div>
        </div>

        {/* Мини-доска */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(8, ${CELL}px)`,
            gridTemplateRows: `repeat(8, ${CELL}px)`,
            border: "2px solid var(--wood-border)",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 6px 24px rgba(0,0,0,0.5)",
          }}>
            {principle.board.map((row: string[], ri: number) =>
              row.map((piece: string, ci: number) => {
                const light = (ri + ci) % 2 === 0;
                const isHighlighted = principle.highlight.some(([hr, hc]: number[]) => hr === ri && hc === ci);
                return (
                  <div
                    key={`${ri}-${ci}`}
                    style={{
                      width: CELL, height: CELL,
                      background: isHighlighted
                        ? "rgba(201,162,39,0.45)"
                        : light ? "var(--cell-light)" : "var(--cell-dark)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {isHighlighted && (
                      <div style={{
                        position: "absolute", inset: 0,
                        border: "2px solid rgba(201,162,39,0.8)",
                        pointerEvents: "none",
                      }} />
                    )}
                    {piece && (
                      <span style={{
                        fontSize: 26, lineHeight: 1, userSelect: "none",
                        color: isW(piece) ? "#f5e6c8" : "#1a0e05",
                        filter: isW(piece) ? "drop-shadow(0 1px 2px rgba(0,0,0,0.9))" : "drop-shadow(0 1px 1px rgba(0,0,0,0.3))",
                        position: "relative", zIndex: 1,
                      }}>
                        {PIECES[piece]}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--gold-muted)", textAlign: "center", marginTop: 6 }}>
            Выделены ключевые поля
          </div>
        </div>
      </div>

      {/* Навигация */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          className="wood-btn-sm"
          onClick={() => setStep(s => Math.max(0, s - 1))}
          style={{ opacity: step === 0 ? 0.4 : 1 }}
          disabled={step === 0}
        >
          <Icon name="ChevronLeft" size={14} /> Назад
        </button>

        <div style={{ fontFamily: "var(--font-golos)", fontSize: 13, color: "var(--gold-muted)" }}>
          {step + 1} / {total}
        </div>

        {step < total - 1 ? (
          <button className="wood-btn" onClick={() => setStep(s => s + 1)}>
            Следующий принцип <Icon name="ChevronRight" size={16} />
          </button>
        ) : (
          <button className="wood-btn" onClick={onBack}>
            <Icon name="Check" size={16} /> Урок завершён!
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Движок бота ─────────────────────────────────────────────────────��────────

const PIECE_VALUES: Record<string, number> = { p:100, n:320, b:330, r:500, q:900, k:20000 };

// Таблицы позиционных бонусов (с точки зрения белых, для чёрных переворачиваем)
const PST: Record<string, number[]> = {
  p: [ 0,  0,  0,  0,  0,  0,  0,  0,
      50, 50, 50, 50, 50, 50, 50, 50,
      10, 10, 20, 30, 30, 20, 10, 10,
       5,  5, 10, 25, 25, 10,  5,  5,
       0,  0,  0, 20, 20,  0,  0,  0,
       5, -5,-10,  0,  0,-10, -5,  5,
       5, 10, 10,-20,-20, 10, 10,  5,
       0,  0,  0,  0,  0,  0,  0,  0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50,
      -40,-20,  0,  0,  0,  0,-20,-40,
      -30,  0, 10, 15, 15, 10,  0,-30,
      -30,  5, 15, 20, 20, 15,  5,-30,
      -30,  0, 15, 20, 20, 15,  0,-30,
      -30,  5, 10, 15, 15, 10,  5,-30,
      -40,-20,  0,  5,  5,  0,-20,-40,
      -50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5, 10, 10,  5,  0,-10,
      -10,  5,  5, 10, 10,  5,  5,-10,
      -10,  0, 10, 10, 10, 10,  0,-10,
      -10, 10, 10, 10, 10, 10, 10,-10,
      -10,  5,  0,  0,  0,  0,  5,-10,
      -20,-10,-10,-10,-10,-10,-10,-20],
  r: [  0,  0,  0,  0,  0,  0,  0,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
        0,  0,  0,  5,  5,  0,  0,  0],
  q: [-20,-10,-10, -5, -5,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5,  5,  5,  5,  0,-10,
       -5,  0,  5,  5,  5,  5,  0, -5,
        0,  0,  5,  5,  5,  5,  0, -5,
      -10,  5,  5,  5,  5,  5,  0,-10,
      -10,  0,  5,  0,  0,  0,  0,-10,
      -20,-10,-10, -5, -5,-10,-10,-20],
  k: [ 30, 40, 40, 50, 50, 40, 40, 30,
       30, 40, 40, 50, 50, 40, 40, 30,
       30, 40, 40, 50, 50, 40, 40, 30,
       30, 40, 40, 50, 50, 40, 40, 30,
       20, 30, 30, 40, 40, 30, 30, 20,
       10, 20, 20, 20, 20, 20, 20, 10,
      -20,-20,  0,  0,  0,  0,-20,-20,
      -30,-40,-40,-50,-50,-40,-40,-30],
};

function evaluateBoard(board: string[][]): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const isW = p === p.toUpperCase();
      const key = p.toLowerCase();
      const val = PIECE_VALUES[key] ?? 0;
      const pstRow = isW ? r : 7 - r;
      const pst = PST[key] ? PST[key][pstRow * 8 + c] : 0;
      score += isW ? (val + pst) : -(val + pst);
    }
  }
  return score;
}

interface BotMove { sr: number; sc: number; dr: number; dc: number; promo?: string; }

function getAllMoves(board: string[][], cr: CastleRights, ep: [number,number]|null, forWhite: boolean): BotMove[] {
  const moves: BotMove[] = [];
  const isW = (p: string) => p !== "" && p === p.toUpperCase();
  const isB = (p: string) => p !== "" && p === p.toLowerCase();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      if (forWhite && !isW(p)) continue;
      if (!forWhite && !isB(p)) continue;
      const targets = getLegalMoves(board, r, c, cr, ep);
      for (const [dr, dc] of targets) {
        // Фильтр — не оставляем короля под шахом
        if (isInCheckAfterMove(board, r, c, dr, dc, forWhite ? "white" : "black")) continue;
        // Рокировка через атакованные поля
        if (p.toLowerCase() === "k" && Math.abs(dc - c) === 2) {
          const passCol = dc === 6 ? [c, 5, 6] : [c, 3, 2];
          if (!castlePathSafe(board, r, passCol, forWhite)) continue;
        }
        // Превращение
        if ((p === "P" && dr === 0) || (p === "p" && dr === 7)) {
          for (const promo of (forWhite ? ["Q","R","B","N"] : ["q","r","b","n"]))
            moves.push({ sr: r, sc: c, dr, dc, promo });
        } else {
          moves.push({ sr: r, sc: c, dr, dc });
        }
      }
    }
  }
  return moves;
}

function applyMove(board: string[][], cr: CastleRights, ep: [number,number]|null, m: BotMove): { board: string[][], cr: CastleRights, ep: [number,number]|null } {
  const b = board.map(r => [...r]);
  const piece = b[m.sr][m.sc];
  b[m.dr][m.dc] = m.promo ?? piece;
  b[m.sr][m.sc] = "";
  // Рокировка
  if (piece.toLowerCase() === "k" && Math.abs(m.dc - m.sc) === 2) {
    if (m.dc === 6) { b[m.dr][5] = b[m.dr][7]; b[m.dr][7] = ""; }
    if (m.dc === 2) { b[m.dr][3] = b[m.dr][0]; b[m.dr][0] = ""; }
  }
  // Взятие на проходе
  if (piece.toLowerCase() === "p" && ep && m.dr === ep[0] && m.dc === ep[1]) {
    const capRow = piece === "P" ? m.dr + 1 : m.dr - 1;
    b[capRow][m.dc] = "";
  }
  const newCr = { ...cr };
  if (piece === "K") { newCr.wK = false; newCr.wQ = false; }
  if (piece === "k") { newCr.bK = false; newCr.bQ = false; }
  if (piece === "R" && m.sr === 7 && m.sc === 7) newCr.wK = false;
  if (piece === "R" && m.sr === 7 && m.sc === 0) newCr.wQ = false;
  if (piece === "r" && m.sr === 0 && m.sc === 7) newCr.bK = false;
  if (piece === "r" && m.sr === 0 && m.sc === 0) newCr.bQ = false;
  let newEP: [number,number]|null = null;
  if (piece.toLowerCase() === "p" && Math.abs(m.dr - m.sr) === 2)
    newEP = [(m.sr + m.dr) / 2, m.dc];
  return { board: b, cr: newCr, ep: newEP };
}

// Сортировка ходов для alpha-beta (взятия вперёд)
function scoreMoveOrder(board: string[][], m: BotMove): number {
  const victim = board[m.dr][m.dc];
  const aggressor = board[m.sr][m.sc];
  if (!victim) return 0;
  return (PIECE_VALUES[victim.toLowerCase()] ?? 0) - (PIECE_VALUES[aggressor.toLowerCase()] ?? 0) / 10;
}

function minimax(
  board: string[][], cr: CastleRights, ep: [number,number]|null,
  depth: number, alpha: number, beta: number, maximizing: boolean
): number {
  if (depth === 0) return evaluateBoard(board);
  const moves = getAllMoves(board, cr, ep, maximizing);
  if (moves.length === 0) {
    const kPos = findKing(board, maximizing);
    if (kPos && isSquareAttacked(board, kPos[0], kPos[1], !maximizing)) return maximizing ? -99999 : 99999;
    return 0; // пат
  }
  moves.sort((a, b) => scoreMoveOrder(board, b) - scoreMoveOrder(board, a));
  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      const { board: nb, cr: ncr, ep: nep } = applyMove(board, cr, ep, m);
      best = Math.max(best, minimax(nb, ncr, nep, depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const { board: nb, cr: ncr, ep: nep } = applyMove(board, cr, ep, m);
      best = Math.min(best, minimax(nb, ncr, nep, depth - 1, alpha, beta, true));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

// depth и шум по уровням: 1-Новичок, 2-Любитель, 3-Опытный, 4-Эксперт, 5-Мастер
const LEVEL_CONFIG = [
  { depth: 1, noise: 400, randomTop: 8 },  // Новичок
  { depth: 2, noise: 150, randomTop: 4 },  // Любитель
  { depth: 3, noise: 50,  randomTop: 2 },  // Опытный
  { depth: 4, noise: 10,  randomTop: 1 },  // Эксперт
  { depth: 5, noise: 0,   randomTop: 1 },  // Мастер
];

function getBotMove(board: string[][], cr: CastleRights, ep: [number,number]|null, level: number): BotMove | null {
  const cfg = LEVEL_CONFIG[level - 1];
  const moves = getAllMoves(board, cr, ep, false); // бот играет чёрными
  if (moves.length === 0) return null;
  moves.sort((a, b) => scoreMoveOrder(board, b) - scoreMoveOrder(board, a));

  // Для низких уровней — случайный выбор из топ-N
  if (cfg.randomTop > 1) {
    const topN = moves.slice(0, Math.min(cfg.randomTop, moves.length));
    const pick = topN[Math.floor(Math.random() * topN.length)];
    return pick;
  }

  let bestMove: BotMove | null = null;
  let bestScore = Infinity;
  for (const m of moves) {
    const { board: nb, cr: ncr, ep: nep } = applyMove(board, cr, ep, m);
    const noise = cfg.noise > 0 ? (Math.random() - 0.5) * cfg.noise : 0;
    const score = minimax(nb, ncr, nep, cfg.depth - 1, -Infinity, Infinity, true) + noise;
    if (score < bestScore) { bestScore = score; bestMove = m; }
  }
  return bestMove;
}

// ─── Экран выбора сложности ────────────────────────────────────────────────────
const LEVELS = [
  { id: 1, name: "Новичок",   desc: "Случайные ходы. Идеально для первого знакомства.", icon: "🌱", color: "#5a9a5a" },
  { id: 2, name: "Любитель",  desc: "Простые тактики, иногда зевает фигуры.", icon: "📚", color: "#7a9a3a" },
  { id: 3, name: "Опытный",   desc: "Понимает позицию, использует тактику.", icon: "⚔️", color: "#c9a227" },
  { id: 4, name: "Эксперт",   desc: "Глубокий расчёт, крепкая защита.", icon: "🏆", color: "#d07030" },
  { id: 5, name: "Мастер",    desc: "Анализирует на несколько ходов вперёд. Нужны реальные знания.", icon: "👑", color: "#c03030" },
];

function LevelSelect({ onSelect }: { onSelect: (level: number) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "28px", padding: "20px 0" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(28px,4vw,42px)", fontWeight: 600, color: "var(--gold-light)", marginBottom: "8px" }}>
          Игра против бота
        </div>
        <div style={{ fontSize: "15px", color: "var(--text-secondary)" }}>Выберите уровень сложности</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "480px" }}>
        {LEVELS.map(lvl => (
          <button
            key={lvl.id}
            onClick={() => onSelect(lvl.id)}
            style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "16px 20px",
              background: "linear-gradient(135deg, rgba(45,26,10,0.9), rgba(26,14,5,0.95))",
              border: `1px solid rgba(${lvl.id === 5 ? "192,48,48" : "107,61,26"},0.5)`,
              borderRadius: "8px", cursor: "pointer",
              transition: "all 0.2s", textAlign: "left",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = lvl.color;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 20px ${lvl.color}33`;
              (e.currentTarget as HTMLButtonElement).style.transform = "translateX(4px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = `rgba(${lvl.id === 5 ? "192,48,48" : "107,61,26"},0.5)`;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateX(0)";
            }}
          >
            <span style={{ fontSize: "28px", flexShrink: 0 }}>{lvl.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "20px", fontWeight: 600, color: lvl.color, marginBottom: "2px" }}>
                {lvl.id}. {lvl.name}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{lvl.desc}</div>
            </div>
            <Icon name="ChevronRight" size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}

interface PromotionState { row: number; col: number; color: "white" | "black"; board: string[][]; cr: CastleRights; ep: [number, number] | null; }

function ChessBoard({ level, onBack }: { level: number; onBack: () => void }) {
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [legalMoves, setLegalMoves] = useState<[number, number][]>([]);
  const [board, setBoard] = useState(INITIAL_BOARD.map(r => [...r]));
  const [turn, setTurn] = useState<"white" | "black">("white");
  const [castleRights, setCastleRights] = useState<CastleRights>({ wK: true, wQ: true, bK: true, bQ: true });
  const [enPassant, setEnPassant] = useState<[number, number] | null>(null);
  const [promotion, setPromotion] = useState<PromotionState | null>(null);
  const [alert, setAlert] = useState<{ msg: string; type: "error" | "check" } | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isWhitePiece = (p: string) => p !== "" && p === p.toUpperCase();
  const isBlackPiece = (p: string) => p !== "" && p === p.toLowerCase();

  const showAlert = (msg: string, type: "error" | "check" = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 2800);
  };

  // Фильтрует ходы, оставляющие короля под шахом, и запрещает рокировку через атакованные поля
  const getSafeMoves = (b: string[][], row: number, col: number, cr: CastleRights, ep: [number, number] | null): [number, number][] => {
    const raw = getLegalMoves(b, row, col, cr, ep);
    const piece = b[row][col];
    return raw.filter(([dr, dc]) => {
      // Рокировка: проверяем, что король не проходит через шах и не стоит под шахом
      if (piece.toLowerCase() === "k" && Math.abs(dc - col) === 2) {
        const isWhite = turn === "white";
        const passCol = dc === 6 ? [col, 5, 6] : [col, 3, 2];
        if (!castlePathSafe(b, row, passCol, !isWhite)) return false;
      }
      return !isInCheckAfterMove(b, row, col, dr, dc, turn);
    });
  };

  const finishMove = (newBoard: string[][], cr: CastleRights, newEP: [number, number] | null, nextTurn: "white" | "black") => {
    const kingPos = findKing(newBoard, nextTurn === "white");
    const inCheck = kingPos && isSquareAttacked(newBoard, kingPos[0], kingPos[1], nextTurn !== "white");
    // Проверяем мат/пат
    const nextMoves = getAllMoves(newBoard, cr, newEP, nextTurn === "white");
    if (nextMoves.length === 0) {
      if (inCheck) {
        setGameOver(nextTurn === "white" ? "Мат! Чёрные победили 🏆" : "Мат! Белые победили 🏆");
      } else {
        setGameOver("Пат! Ничья 🤝");
      }
    } else if (inCheck) {
      showAlert("Шах! Король под ударом — нужно защититься", "check");
    }
    setBoard(newBoard);
    setCastleRights(cr);
    setEnPassant(newEP);
    setSelected(null);
    setLegalMoves([]);
    setTurn(nextTurn);
  };

  // Ход бота
  useEffect(() => {
    if (turn !== "black" || gameOver || promotion) return;
    setBotThinking(true);
    const delay = level >= 4 ? 600 : 300;
    botTimerRef.current = setTimeout(() => {
      const move = getBotMove(board, castleRights, enPassant, level);
      if (!move) { setBotThinking(false); return; }
      const { board: nb, cr: ncr, ep: nep } = applyMove(board, castleRights, enPassant, move);
      setBotThinking(false);
      finishMove(nb, ncr, nep, "white");
    }, delay);
    return () => { if (botTimerRef.current) clearTimeout(botTimerRef.current); };
  }, [turn, gameOver, promotion]); // eslint-disable-line

  const handlePromotion = (piece: string) => {
    if (!promotion) return;
    const newBoard = promotion.board.map(r => [...r]);
    newBoard[promotion.row][promotion.col] = piece;
    setPromotion(null);
    finishMove(newBoard, promotion.cr, promotion.ep, promotion.color === "white" ? "black" : "white");
  };

  const handleClick = (row: number, col: number) => {
    if (promotion) return;
    const piece = board[row][col];
    if (!selected) {
      if ((turn === "white" && isWhitePiece(piece)) || (turn === "black" && isBlackPiece(piece))) {
        setSelected([row, col]);
        setLegalMoves(getSafeMoves(board, row, col, castleRights, enPassant));
      }
      return;
    }
    const [sr, sc] = selected;
    if (sr === row && sc === col) { setSelected(null); setLegalMoves([]); return; }
    const srcPiece = board[sr][sc];
    const dstPiece = board[row][col];
    if ((turn === "white" && isWhitePiece(dstPiece)) || (turn === "black" && isBlackPiece(dstPiece))) {
      setSelected([row, col]);
      setLegalMoves(getSafeMoves(board, row, col, castleRights, enPassant));
      return;
    }
    const isLegal = legalMoves.some(([r, c]) => r === row && c === col);
    if (!isLegal) {
      // Объясняем причину
      const rawMoves = getLegalMoves(board, row, col, castleRights, enPassant);
      const wouldBeInRaw = rawMoves.some(([r, c]) => r === row && c === col);
      const kingPos = findKing(board, turn === "white");
      const inCheck = kingPos && isSquareAttacked(board, kingPos[0], kingPos[1], turn !== "white");
      if (inCheck && wouldBeInRaw) {
        showAlert("Невозможный ход — король останется под шахом", "error");
      } else if (inCheck) {
        showAlert("Невозможный ход — необходимо защитить короля от шаха", "error");
      } else if (wouldBeInRaw) {
        showAlert("Невозможный ход — король окажется под шахом", "error");
      } else {
        showAlert("Невозможный ход — фигура так не ходит", "error");
      }
      setSelected(null); setLegalMoves([]); return;
    }

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

    // Превращение пешки
    if ((srcPiece === "P" && row === 0) || (srcPiece === "p" && row === 7)) {
      setSelected(null);
      setLegalMoves([]);
      setPromotion({ row, col, color: turn, board: newBoard, cr, ep: newEP });
      return;
    }

    finishMove(newBoard, cr, newEP, turn === "white" ? "black" : "white");
  };

  const levelInfo = LEVELS[level - 1];
  const CELL = 52;
  const BOARD = CELL * 8;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Шапка игры */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: BOARD + 22, gap: "12px" }}>
        <button onClick={onBack} className="wood-btn-sm" style={{ gap: "6px" }}>
          <Icon name="ChevronLeft" size={14} /> Уровни
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-golos)", fontSize: "13px" }}>
          <span style={{ color: "var(--gold-muted)" }}>Бот:</span>
          <span style={{ color: levelInfo.color, fontWeight: 600 }}>{levelInfo.icon} {levelInfo.name}</span>
        </div>
        <div style={{ fontSize: "13px", color: gameOver ? "var(--gold)" : turn === "white" ? "var(--cream)" : "var(--text-secondary)", fontWeight: 600, fontFamily: "var(--font-golos)" }}>
          {gameOver ? "Игра окончена" : botThinking ? "Думает..." : turn === "white" ? "Ваш ход ♔" : "Ход бота ♚"}
        </div>
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
      {/* Уведомление */}
      <div style={{
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: BOARD + 22,
      }}>
        {alert && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "6px",
            background: alert.type === "check"
              ? "linear-gradient(135deg, rgba(180,100,20,0.95), rgba(140,70,10,0.95))"
              : "linear-gradient(135deg, rgba(160,40,40,0.95), rgba(120,20,20,0.95))",
            border: `1px solid ${alert.type === "check" ? "rgba(220,160,50,0.6)" : "rgba(200,60,60,0.5)"}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            fontFamily: "var(--font-golos)",
            fontSize: "13px",
            color: alert.type === "check" ? "#ffe0a0" : "#ffc0c0",
            animation: "fade-in 0.2s ease-out",
            whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: "16px" }}>{alert.type === "check" ? "⚠️" : "🚫"}</span>
            {alert.msg}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => { setBoard(INITIAL_BOARD.map(r => [...r])); setSelected(null); setLegalMoves([]); setTurn("white"); setCastleRights({ wK: true, wQ: true, bK: true, bQ: true }); setEnPassant(null); setPromotion(null); setAlert(null); setGameOver(null); setBotThinking(false); if (botTimerRef.current) clearTimeout(botTimerRef.current); }}
          className="wood-btn-sm"
        >
          <Icon name="RotateCcw" size={14} /> Новая партия
        </button>
      </div>

      {/* Оверлей конца игры */}
      {gameOver && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "linear-gradient(135deg, #2d1a0a, #1a0e05)",
            border: "2px solid var(--gold-dark)",
            borderRadius: "12px",
            padding: "40px 48px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            display: "flex", flexDirection: "column", gap: "20px", alignItems: "center",
          }}>
            <div style={{ fontSize: "52px" }}>{gameOver.includes("Белые") ? "♔" : gameOver.includes("Чёрные") ? "♚" : "🤝"}</div>
            <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "28px", fontWeight: 700, color: "var(--gold-light)" }}>{gameOver}</div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="wood-btn" onClick={() => { setBoard(INITIAL_BOARD.map(r => [...r])); setSelected(null); setLegalMoves([]); setTurn("white"); setCastleRights({ wK: true, wQ: true, bK: true, bQ: true }); setEnPassant(null); setPromotion(null); setAlert(null); setGameOver(null); setBotThinking(false); }}>
                <Icon name="RotateCcw" size={16} /> Новая партия
              </button>
              <button className="wood-btn-outline" onClick={onBack}>
                <Icon name="ChevronLeft" size={16} /> Сменить уровень
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно превращения пешки */}
      {promotion && (() => {
        const isWhite = promotion.color === "white";
        const pieces = isWhite
          ? [{ p: "Q", sym: "♕", label: "Ферзь" }, { p: "R", sym: "♖", label: "Ладья" }, { p: "B", sym: "♗", label: "Слон" }, { p: "N", sym: "♘", label: "Конь" }]
          : [{ p: "q", sym: "♛", label: "Ферзь" }, { p: "r", sym: "♜", label: "Ладья" }, { p: "b", sym: "♝", label: "Слон" }, { p: "n", sym: "♞", label: "Конь" }];
        return (
          <div style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              background: "linear-gradient(135deg, #2d1a0a, #1a0e05)",
              border: "2px solid var(--gold-dark)",
              borderRadius: "12px",
              padding: "32px 28px",
              boxShadow: "0 16px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,162,39,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}>
              <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "22px", color: "var(--gold-light)", fontWeight: 600 }}>
                Превращение пешки
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Выберите фигуру</div>
              <div style={{ display: "flex", gap: "12px" }}>
                {pieces.map(({ p, sym, label }) => (
                  <button
                    key={p}
                    onClick={() => handlePromotion(p)}
                    style={{
                      width: "76px", height: "88px",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px",
                      background: "linear-gradient(135deg, rgba(74,44,20,0.8), rgba(45,26,10,0.9))",
                      border: "1px solid var(--wood-border)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      color: isWhite ? "#f5e6c8" : "#1a0e05",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--gold)";
                      (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(107,61,26,0.9), rgba(74,44,20,0.95))";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(201,162,39,0.3)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--wood-border)";
                      (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(74,44,20,0.8), rgba(45,26,10,0.9))";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                    }}
                  >
                    <span style={{
                      fontSize: "40px", lineHeight: 1,
                      filter: isWhite ? "drop-shadow(0 1px 3px rgba(0,0,0,0.9))" : "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
                      color: isWhite ? "#f5e6c8" : "#1a0e05",
                      WebkitTextStroke: isWhite ? undefined : "0.5px #c9a227",
                    }}>{sym}</span>
                    <span style={{ fontSize: "11px", color: "var(--gold-muted)", fontFamily: "var(--font-golos)" }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function Index() {
  const [active, setActive] = useState<Section>("home");
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [gameLevel, setGameLevel] = useState<number | null>(null);
  const [openLesson, setOpenLesson] = useState<number | null>(null);

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
                <ChessBoard level={3} onBack={() => {}} />
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
            {gameLevel === null ? (
              <LevelSelect onSelect={lvl => setGameLevel(lvl)} />
            ) : (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ChessBoard level={gameLevel} onBack={() => setGameLevel(null)} />
              </div>
            )}
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
            {openLesson === 1 ? (
              <DebutLesson onBack={() => setOpenLesson(null)} />
            ) : (
              <>
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
                        <button
                          className="wood-btn-sm"
                          onClick={() => lesson.id === 1 ? setOpenLesson(1) : undefined}
                          style={{ opacity: lesson.id === 1 ? 1 : 0.5, cursor: lesson.id === 1 ? "pointer" : "default" }}
                        >
                          <Icon name="Play" size={14} /> {lesson.id === 1 ? "Начать урок" : "Скоро"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
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