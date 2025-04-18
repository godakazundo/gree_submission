window.onload = function () {
	let startTime;
	let timer;
	let gameActive = false;
	let arr = [];
	const clickSound = new Audio('./click.mp3'); // click.mp3を読み込む

	const titleScreen = document.getElementById('title-screen');
	const main = document.getElementById('main');
	const timeLeftDisplay = document.getElementById('time-left');

	titleScreen.addEventListener('click', startGame);

	function startGame() {
			titleScreen.style.display = 'none';
			main.style.display = 'block';
			init();
	}

	function init() {
			gameActive = true;
			document.getElementById('result-message').textContent = "";
			timeLeftDisplay.textContent = '00:00:00'; // 初期化

			arr = [''];
			for (let i = 1; i <= 15; i++) arr.push(i.toString());
			shuffle(arr);
			if (!isSolvable(arr.slice())) {
					init(); // 再初期化
			} else {
					render(arr);
					startTime = Date.now();
					startTimer();
			}
	}

	function startTimer() {
			timer = setInterval(() => {
					const elapsedTime = Date.now() - startTime;
					timeLeftDisplay.textContent = formatTime(elapsedTime);
			}, 1000);
	}

	function formatTime(ms) {
			const seconds = Math.floor(ms / 1000);
			const minutes = Math.floor(seconds / 60);
			const hours = Math.floor(minutes / 60);
			const displayHours = String(hours).padStart(2, '0');
			const displayMinutes = String(minutes % 60).padStart(2, '0');
			const displaySeconds = String(seconds % 60).padStart(2, '0');
			return `${displayHours}:${displayMinutes}:${displaySeconds}`;
	}

	function shuffle(arr) {
			for (let i = arr.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[arr[i], arr[j]] = [arr[j], arr[i]];
			}
	}

	function isSolvable(arr) {
			let inversions = 0;
			let blankRow = 0;

			for (let i = 0; i < arr.length; i++) {
					if (arr[i] === '') {
							blankRow = Math.floor(i / 4) + 1;
					} else {
							for (let j = i + 1; j < arr.length; j++) {
									if (arr[j] && parseInt(arr[i]) > parseInt(arr[j])) {
											inversions++;
									}
							}
					}
			}

			if (arr.length % 2 === 1) {
					return inversions % 2 === 0;
			} else {
					return (blankRow % 2 === 1) === (inversions % 2 === 0);
			}
	}

	function checkClear(arr) {
			const goal = [];
			for (let i = 1; i <= 15; i++) goal.push(i.toString());
			goal.push('');
			return arr.toString() === goal.toString();
	}

	function render(arr) {
			const panel = document.getElementById('js-show-panel');
			panel.innerHTML = '';

			const fragment = document.createDocumentFragment();

			arr.forEach(function (element) {
					const tileWrapper = document.createElement('div');
					tileWrapper.className = 'tile-wrapper';

					const tile = document.createElement('div');
					tile.className = element !== '' ? `tile tile-${element}` : 'tile tile-none';
					tile.textContent = element;

					tileWrapper.appendChild(tile);
					fragment.appendChild(tileWrapper);
			});

			panel.appendChild(fragment);
			addEventListenerClick(arr);
	}

	function addEventListenerClick(arr) {
			const tiles = document.querySelectorAll('.tile');
			tiles.forEach(function (elem, index) {
					elem.addEventListener('click', function () {
							if (!gameActive) return;

							const i = index;
							let j;

							if (i <= 11 && arr[i + 4] === '') {
									j = i + 4;
							} else if (i >= 4 && arr[i - 4] === '') {
									j = i - 4;
							} else if (i % 4 !== 3 && arr[i + 1] === '') {
									j = i + 1;
							} else if (i % 4 !== 0 && arr[i - 1] === '') {
									j = i - 1;
							} else {
									return;
							}

							[arr[i], arr[j]] = [arr[j], arr[i]];
							render(arr);
							clickSound.currentTime = 0; // 効果音を最初から再生
							clickSound.play();

							if (checkClear(arr)) {
									clearInterval(timer);
									gameActive = false;
									document.getElementById('result-message').textContent = `クリアおめでとう！ タイム: ${timeLeftDisplay.textContent}`;
							}
					});
			});
	}

	document.getElementById('js-reset-puzzle').addEventListener('click', init);
};