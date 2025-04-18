const stage = document.getElementById("stage");
const squareTemplate = document.getElementById("square-template");
const stoneStateList = [];
let currentColor = 1;
const currentTurnText = document.getElementById("current-turn");
const passButton = document.getElementById("pass");
let timeLeft = 60;
let timerInterval;

const player1Name = prompt("黒のプレイヤー名を入力してください", "黒");
const player2Name = prompt("白のプレイヤー名を入力してください", "白");

const canPlayerMove = (color) => {
  return stoneStateList.some((_, i) => {
    if (stoneStateList[i] !== 0) return false;
    return getReversibleStones(i, color).length > 0;
  });
};

const checkGameEnd = () => {
  const noBlack = !canPlayerMove(1);
  const noWhite = !canPlayerMove(2);
  const boardFull = stoneStateList.every((s) => s !== 0);

  if (noBlack && noWhite || boardFull) {
    const black = stoneStateList.filter((s) => s === 1).length;
    const white = 64 - black;
    let result = "引き分けです";

    if (black > white) result = `${player1Name}の勝ちです！`;
    else if (black < white) result = `${player2Name}の勝ちです！`;

    alert(`ゲーム終了：黒${black}、白${white}。${result}`);
    clearInterval(timerInterval);
    return true;
  }
  return false;
};

const changeTurn = () => {
  currentColor = 3 - currentColor;
  currentTurnText.textContent = currentColor === 1 ? player1Name : player2Name;

  if (!canPlayerMove(currentColor)) {
    if (!canPlayerMove(3 - currentColor)) {
      checkGameEnd();
      return;
    }

    alert(`${currentTurnText.textContent}は置ける場所がないため、パスします`);
    currentColor = 3 - currentColor;
    currentTurnText.textContent = currentColor === 1 ? player1Name : player2Name;
  }

  displayPlaceableSquares();
};

const getReversibleStones = (index, color = currentColor) => {
  const directions = [-1, 1, -8, 8, -9, -7, 7, 9];
  const reversible = [];
  const row = Math.floor(index / 8);
  const col = index % 8;

  for (const dir of directions) {
    const temp = [];
    let i = index + dir;

    while (i >= 0 && i < 64) {
      const r = Math.floor(i / 8);
      const c = i % 8;

      if (Math.abs(r - row) > 1 && Math.abs(c - col) > 1) break;
      if (stoneStateList[i] === 0) break;
      if (stoneStateList[i] === color) {
        reversible.push(...temp);
        break;
      } else {
        temp.push(i);
      }

      if (Math.abs(c - col) > 1 || Math.abs(r - row) > 1) break;
      i += dir;
    }
  }

  return reversible;
};

const displayPlaceableSquares = () => {
  for (let i = 0; i < 64; i++) {
    const square = document.querySelector(`[data-index='${i}']`);
    if (stoneStateList[i] === 0 && getReversibleStones(i).length > 0) {
      square.parentElement.style.backgroundColor = "lightgreen";
    } else {
      square.parentElement.style.backgroundColor = "";
    }
  }
};

const onClickSquare = (index) => {
  const reversibleStones = getReversibleStones(index);

  if (stoneStateList[index] !== 0 || reversibleStones.length === 0) {
    alert("ここには置けないよ！");
    return;
  }

  stoneStateList[index] = currentColor;
  document.querySelector(`[data-index='${index}']`).setAttribute("data-state", currentColor);

  reversibleStones.forEach((i) => {
    stoneStateList[i] = currentColor;
    document.querySelector(`[data-index='${i}']`).setAttribute("data-state", currentColor);
  });

  if (!checkGameEnd()) {
    changeTurn();
    clearInterval(timerInterval);
    timeLeft = 60;
    startTimer();
  }
};

const createSquares = () => {
  for (let i = 0; i < 64; i++) {
    const square = squareTemplate.cloneNode(true);
    square.removeAttribute("id");
    stage.appendChild(square);

    const stone = square.querySelector('.stone');
    const defaultState = (i === 27 || i === 36) ? 1 : (i === 28 || i === 35) ? 2 : 0;

    stone.setAttribute("data-state", defaultState);
    stone.setAttribute("data-index", i);
    square.querySelector('.stone').setAttribute("data-index", i);
    square.querySelector('.stone').dataset.index = i;
    square.querySelector('.stone').style.pointerEvents = "none";

    stoneStateList.push(defaultState);

    square.addEventListener("click", () => onClickSquare(i));
  }
};

const startTimer = () => {
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time-left").textContent = timeLeft;

    if (timeLeft === 0) {
      clearInterval(timerInterval);
      alert("タイムアップ！ターン交代します。");
      changeTurn();
      timeLeft = 60;
      startTimer();
    }
  }, 1000);
};

window.onload = () => {
  createSquares();
  passButton.addEventListener("click", () => {
    clearInterval(timerInterval);
    changeTurn();
    timeLeft = 60;
    startTimer();
  });
  currentTurnText.textContent = player1Name;
  displayPlaceableSquares();
  startTimer();
};