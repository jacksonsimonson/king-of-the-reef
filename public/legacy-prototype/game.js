const SIZE = 4;
const GOALS = new Set([5, 10]);
const DIRECTIONS = {
  up: { dr: -1, dc: 0, opposite: "down" },
  right: { dr: 0, dc: 1, opposite: "left" },
  down: { dr: 1, dc: 0, opposite: "up" },
  left: { dr: 0, dc: -1, opposite: "right" },
};

const playerDeck = [
  { id: "bluegill", name: "Bluegill", type: "Pond", art: "🐟", arrows: ["up", "right"] },
  { id: "catfish", name: "Catfish", type: "River", art: "🐟", arrows: ["left", "right", "down"] },
  { id: "puffer", name: "Pufferfish", type: "Reef", art: "🐡", arrows: ["up", "down"] },
  { id: "trout", name: "Trout", type: "Stream", art: "🐠", arrows: ["up", "left", "right"] },
];

const aiDeck = [
  { id: "bass", name: "Bass", type: "Lake", art: "🐟", arrows: ["down", "left"] },
  { id: "eel", name: "Eel", type: "Reef", art: "〰️", arrows: ["up", "down", "right"] },
  { id: "perch", name: "Perch", type: "Pond", art: "🐠", arrows: ["left", "right"] },
  { id: "shark", name: "Shark", type: "Ocean", art: "🦈", arrows: ["up", "left", "down"] },
];

const boardEl = document.querySelector("#board");
const handEl = document.querySelector("#hand");
const template = document.querySelector("#card-template");
const statusEl = document.querySelector("#status");
const selectedLabel = document.querySelector("#selected-label");
const turnLabel = document.querySelector("#turn-label");
const aiCount = document.querySelector("#ai-count");
const playerScore = document.querySelector("#player-score");
const aiScore = document.querySelector("#ai-score");
const resultPanel = document.querySelector("#result");
const resultTitle = document.querySelector("#result-title");
const resultCopy = document.querySelector("#result-copy");

let board;
let playerHand;
let rivalHand;
let selectedCard;
let turn;
let finished;

function resetGame() {
  board = Array(SIZE * SIZE).fill(null);
  playerHand = playerDeck.map(card => ({ ...card, owner: "player" }));
  rivalHand = aiDeck.map(card => ({ ...card, owner: "ai" }));
  selectedCard = null;
  turn = "player";
  finished = false;
  resultPanel.hidden = true;
  render();
  announce("Choose a fish from your hand.");
}

function render() {
  renderBoard();
  renderHand();
  updateHud();
}

function renderBoard() {
  boardEl.replaceChildren();
  board.forEach((card, index) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `cell${GOALS.has(index) ? " goal" : ""}${!card && selectedCard && turn === "player" ? " legal" : ""}`;
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", card ? `${card.name}, controlled by ${card.owner === "player" ? "you" : "the rival"}` : `Open water tile ${index + 1}`);
    cell.addEventListener("click", () => playPlayerCard(index));
    if (card) cell.append(renderBoardCard(card));
    boardEl.append(cell);
  });
}

function renderBoardCard(card) {
  const el = document.createElement("div");
  el.className = `board-card ${card.owner}`;
  el.innerHTML = `<span class="fish-art" aria-hidden="true">${card.art}</span><span class="fish-name">${card.name}</span>`;
  card.arrows.forEach(direction => {
    const arrow = document.createElement("span");
    arrow.className = `arrow arrow-${direction}`;
    arrow.textContent = { up: "▲", right: "▶", down: "▼", left: "◀" }[direction];
    el.append(arrow);
  });
  return el;
}

function renderHand() {
  handEl.replaceChildren();
  playerHand.forEach(card => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = card.id;
    node.classList.toggle("selected", selectedCard?.id === card.id);
    node.disabled = turn !== "player" || finished;
    node.querySelector(".fish-art").textContent = card.art;
    node.querySelector(".fish-name").textContent = card.name;
    node.querySelector(".fish-type").textContent = card.type;
    for (const direction of Object.keys(DIRECTIONS)) {
      node.querySelector(`.arrow-${direction}`).hidden = !card.arrows.includes(direction);
    }
    node.addEventListener("click", () => {
      selectedCard = selectedCard?.id === card.id ? null : card;
      announce(selectedCard ? `${selectedCard.name} selected. Choose an open tile.` : "Selection cleared.");
      render();
    });
    handEl.append(node);
  });
  selectedLabel.textContent = selectedCard ? `${selectedCard.name} selected` : "No fish selected";
}

function playPlayerCard(index) {
  if (finished || turn !== "player" || !selectedCard || board[index]) return;
  const card = selectedCard;
  playerHand = playerHand.filter(item => item.id !== card.id);
  selectedCard = null;
  placeCard(index, card);
  if (checkEnd()) return;
  turn = "ai";
  render();
  announce("The rival is choosing a fish…");
  setTimeout(playAiTurn, 650);
}

function playAiTurn() {
  if (finished) return;
  const open = board.map((card, index) => card ? null : index).filter(index => index !== null);
  if (!open.length || !rivalHand.length) return finishGame();

  let best = null;
  for (const card of rivalHand) {
    for (const index of open) {
      let value = GOALS.has(index) ? 8 : 0;
      value += card.arrows.length * .4;
      value += threatenedNeighbors(index, card);
      value += Math.random() * 2;
      if (!best || value > best.value) best = { card, index, value };
    }
  }

  rivalHand = rivalHand.filter(card => card.id !== best.card.id);
  placeCard(best.index, best.card);
  if (checkEnd()) return;
  turn = "player";
  render();
  announce("Your turn. Choose a fish.");
}

function threatenedNeighbors(index, card) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  return card.arrows.reduce((score, direction) => {
    const d = DIRECTIONS[direction];
    const r = row + d.dr;
    const c = col + d.dc;
    if (!inside(r, c)) return score;
    const neighbor = board[r * SIZE + c];
    return score + (neighbor?.owner === "player" && !neighbor.arrows.includes(d.opposite) ? 3 : 0);
  }, 0);
}

function placeCard(index, card) {
  board[index] = card;
  resolvePushes(index, card);
  render();
}

function resolvePushes(index, card) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  for (const direction of card.arrows) {
    const d = DIRECTIONS[direction];
    const nearRow = row + d.dr;
    const nearCol = col + d.dc;
    if (!inside(nearRow, nearCol)) continue;
    const nearIndex = nearRow * SIZE + nearCol;
    const target = board[nearIndex];
    if (!target || target.arrows.includes(d.opposite)) continue;

    const farRow = nearRow + d.dr;
    const farCol = nearCol + d.dc;
    if (!inside(farRow, farCol)) {
      board[nearIndex] = null;
      continue;
    }
    const farIndex = farRow * SIZE + farCol;
    if (!board[farIndex]) {
      board[farIndex] = target;
      board[nearIndex] = null;
    }
  }
}

function inside(row, col) {
  return row >= 0 && row < SIZE && col >= 0 && col < SIZE;
}

function getScores() {
  let player = 0;
  let ai = 0;
  GOALS.forEach(index => {
    if (board[index]?.owner === "player") player++;
    if (board[index]?.owner === "ai") ai++;
  });
  return { player, ai };
}

function updateHud() {
  const score = getScores();
  playerScore.textContent = score.player;
  aiScore.textContent = score.ai;
  aiCount.textContent = `${rivalHand.length} fish remaining`;
  turnLabel.textContent = turn === "player" ? "Your turn" : "Rival turn";
}

function checkEnd() {
  if ((playerHand.length === 0 && rivalHand.length === 0) || board.every(Boolean)) {
    finishGame();
    return true;
  }
  return false;
}

function finishGame() {
  finished = true;
  const score = getScores();
  if (score.player > score.ai) {
    resultTitle.textContent = "You landed it!";
    resultCopy.textContent = `You control ${score.player} pearl tiles to the rival's ${score.ai}.`;
  } else if (score.ai > score.player) {
    resultTitle.textContent = "The rival got away";
    resultCopy.textContent = `The rival controls ${score.ai} pearl tiles to your ${score.player}. Try a different current.`;
  } else {
    resultTitle.textContent = "Tied tide";
    resultCopy.textContent = `Both schools control ${score.player} pearl tile${score.player === 1 ? "" : "s"}.`;
  }
  resultPanel.hidden = false;
  renderHand();
  updateHud();
}

function announce(message) {
  statusEl.textContent = message;
}

document.querySelector("#rules-button").addEventListener("click", event => {
  const rules = document.querySelector("#rules");
  rules.hidden = !rules.hidden;
  event.currentTarget.setAttribute("aria-expanded", String(!rules.hidden));
});
document.querySelector("#rematch").addEventListener("click", resetGame);

resetGame();
