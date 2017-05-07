matchThree.input = (function() {
	var inputHandlers;
	var keys = {
		37 : "KEY_LEFT",
		38 : "KEY_UP",
		39 : "KEY_RIGHT",
		40 : "KEY_DOWN",
		13 : "KEY_ENTER",
		32 : "KEY_SPACE",
		65 : "KEY_A",

		// alpha(keyboard) keys 66 - 89
		90 : "KEY_Z"
	};

	function init() {
		var dom = matchThree.dom;
		var $ = dom.$;
		var controls = matchThree.settings.controls;
		var board = $("#screen-game .game-board")[0];
		inputHandlers = {};
		dom.bind(board, "mousedown", function(e) {
			handleClick(e, "CLICK", e);
		});
		dom.bind(board, "touchstart", function(e) {
			handleClick(e, "TOUCH", e.targetTouches[0]);
		});
		dom.bind(document, "keydown", function(e) {
			var keyName = keys[e.keyCode];
			if(keyName && controls[keyName]) {
				e.preventDefault();
				trigger(controls[keyName]);
			}
		});

	}

	function handleClick(e, control, click) {
		var settings = matchThree.settings;
		var action = settings.controls[control];
		if(!action) {
			return;
		} else {
			var board = matchThree.dom.$("#screen-game .game-board")[0];
			var rect = board.getBoundingClientRect();
			var relX, relY;
			var tileX, tileY;

			// click a position relative to the board
			relX = click.clientX - rect.left;
			relY = click.clientY - rect.top;
			// tile coordinates
			tileX = Math.floor(relX / rect.width * settings.cols);
			tileY = Math.floor(relY / rect.height * settings.rows);

			// trigger fuction bound to action
			trigger(action, tileX, tileY);
			// prevent the default
			e.preventDefault();
		}
	}

	function bind(action, handler) {
		if(!inputHandlers[action]) {
			inputHandlers[action] = [];
		}
		inputHandlers[action].push(handler);
	}

	function trigger(action) {
		var handlers = inputHandlers[action];
		var args = Array.prototype.slice.call(arguments, 1);
		console.log("Game Action: " + action);
		if(handlers) {
			for (var i = 0; i < handlers.length; i++) {
				handlers[i].apply(null, args);
			}
		}
	}

	return {
		init : init,
		bind : bind
	};
})();