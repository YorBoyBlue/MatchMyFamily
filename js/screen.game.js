matchThree.screens["screen-game"] = (function() {
	var firstRun = true, paused, pauseStart, cursor, gameState;
	var dom = matchThree.dom;
	var overlay = dom.$("#screen-game .pause-overlay")[0];
	var settings = matchThree.settings;
	var board = matchThree.board;


	function setup() {
		var input = matchThree.input;

		dom.bind("footer button.exit" , "click", exitGame);
		dom.bind("footer button.pause" , "click", pauseGame);
		dom.bind(".pause-overlay" , "click", resumeGame);

		input.init();
		input.bind("selectTile", selectTile);
		input.bind("moveUp", moveUp);
		input.bind("moveDown", moveDown);
		input.bind("moveRight", moveRight);
		input.bind("moveLeft", moveLeft);
	}

	function startGame() {
		var display = matchThree.display;
		gameState = {
			level : 0,
			score : 0,
			timer: 0,
			startTime: 0,
			endTime : 0
		};
		updateGameInfo();
		setLevelTimer(true);
		board.init(function() {
			display.init(function() {
				display.redraw(board.getBoard(), function() {
					cursor = {
						x : 0,
						y : 0,
						selected : false
					};
					advanceLevel();
				});
			});
		});
		paused = false;		
		overlay.style.display = "none"; 
	}

	function advanceLevel() {
		gameState.level++;
		announce("Level " + gameState.level);
		updateGameInfo();
		gameState.startTime = Date.now();
		gameState.endTime = matchThree.settings.baseLevelTimer * Math.pow(gameState.level, -0.05 * gameState.level);
		setLevelTimer(true);
		matchThree.display.levelUp();
	}

	function announce(str) {
		var dom = matchThree.dom,
			$ = dom.$,
			element = $("#screen-game .announcement")[0];
		element.innerHTML = str;
		dom.removeClass(element, "zoomfade");
		setTimeout(function() {
			dom.addClass(element, "zoomfade");
		}, 1);
	}

	function updateGameInfo() {
		var $ = dom.$;
		$("#screen-game .score span")[0].innerHTML = gameState.score;
		$("#screen-game .level span")[0].innerHTML = gameState.level;
	}

	function setLevelTimer(reset) {
		var $ = dom.$;
		if(gameState.timer) {
			clearTimeout(gameState.timer);
			gameState.timer = 0;
		}
		if(reset) {
			gameState.startTime = Date.now();
			gameState.endTime = settings.baseLevelTimer * Math.pow(gameState.level, -0.05 * gameState.level);
		}
		var delta = gameState.startTime + gameState.endTime - Date.now(), 
			percent = (delta / gameState.endTime) * 100,
			progress = $("#screen-game .time .indicator")[0];
		if(delta < 0) {
			gameOver();
		} else {
			progress.style.width = percent + "%";
			gameState.timer = setTimeout(setLevelTimer, 30);
		}
	}

	function exitGame() {
		pauseGame();
		var confirmed = window.confirm("Do you want to return to the main menu?");
		if(confirmed) {
			matchThree.showScreen("screen-menu");
		} else {
			resumeGame();
		}
	}

	function pauseGame() {
		if(paused) {
			return;
		} 
		overlay.style.display = "block"; 
		paused = true;
		pauseStart = Date.now();
		clearTimeout(gameState.timer);
		matchThree.display.pause();
	}

	function resumeGame() {
		overlay.style.display = "none"; 
		paused = false;
		var pauseTime = Date.now() - pauseStart;
		gameState.startTime += pauseTime;
		setLevelTimer();
		matchThree.display.resume(pauseTime);
	}

	function gameOver() {
		matchThree.display.gameOver(function() {
			announce("Game Over!");
		setTimeout(function() {
				matchThree.showScreen("screen-menu");
            }, 2500);
        });
	}

	function setCursor(x, y, select) {
		cursor.x = x;
		cursor.y = y;
		cursor.selected = select;
		matchThree.display.setCursor(x, y, select);
	}

	function selectTile(x, y) {
		if(paused) {
			return;
		}
		if(arguments.length === 0) {
			selectTile(cursor.x, cursor.y);
			return;
		}

		if(cursor.selected) {
			var dx = Math.abs(x - cursor.x);
			var dy = Math.abs(y - cursor.y);
			var distance = dx + dy;
			if(distance === 0) {
				setCursor(x, y, false);
			} else if(distance == 1) {
				// selected an adjacent tile
				matchThree.board.swap(cursor.x, cursor.y, x, y, playBoardEvents);
				setCursor(x, y, false);
			} else {
				setCursor(x, y, true);
			}
		} else {
			setCursor(x, y, true);
		}
	}

	function playBoardEvents(e) {
		var display = matchThree.display;
		if(e.length > 0) {
			var boardEvent = e.shift();
			var next = function() {
				playBoardEvents(e);
			};

			switch(boardEvent.type) {

				case "move":
					matchThree.display.moveTiles(boardEvent.data, next);
					break;

				case "remove":
					matchThree.display.removeTiles(boardEvent.data, next);
					break;

				case "refill":
					announce("No Moves!");
					matchThree.display.refill(boardEvent.data, next);
					break;

				case "score":
					addScore(boardEvent.data);
					next();
					break;

				default:
					next();
					break;
			}
		} else {
			display.redraw(board.getBoard(), function() {
				// good to go again
			});
		}
	}

	function addScore(points) {
		var settings = matchThree.settings,
			nextLevelAt = Math.pow(settings.baseLevelScore, Math.pow(settings.baseLevelExp,	gameState.level - 1));
		gameState.score += points;
		if(gameState.score >= nextLevelAt) {
			advanceLevel();
		}
		updateGameInfo();
	}

	function moveCursor(x, y) {
		if(paused) {
			return;
		}
		if(cursor.selected) {
			x += cursor.x;
			y += cursor.y;
			if(x >= 0 && x < settings.cols && y >= 0 && y < settings.rows) {
				selectTile(x, y);
			} else {
				x = (cursor.x + x + settings.cols) % settings.cols;
				y = (cursor.y + y + settings.rows) % settings.rows;
				setCursor(x, y, false);
			}
		}
	}

	function moveLeft() {
		moveCursor(-1, 0);
	}

	function moveRight() {
		moveCursor(1, 0);
	}

	function moveUp() {
		moveCursor(0, -1);
	}

	function moveDown() {
		moveCursor(0, 1);
	}

	function run() {
		if(firstRun) {
			setup();
			firstRun = false;
		}
		startGame();
	}

	return {
		run: run
	};


})();