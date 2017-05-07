var matchThree = (function() {
	var scriptQueue = [];
	var numResourcesLoaded = 0; 
	var numResources = 0; 
	var executeRunning = false;
	var settings = {
		rows: 8,
		cols: 8, 
		baseScore: 100, 
		numTileTypes: 7,
		baseLevelTimer : 60000,
		baseLevelScore : 1500,
		baseLevelExp : 1.05,
		controls : {
			// keyboard
			KEY_UP : "moveUp",
			KEY_LEFT : "moveLeft",
			KEY_DOWN : "moveDown",
			KEY_RIGHT : "moveRight",
			KEY_ENTER : "selectTile",
			KEY_SPACE : "selectTile",
			// mouse and touch 
			CLICK : "selectTile",
			TOUCH : "selectTile",
			// gamepad
			BUTTON_A : "selectTile",
			LEFT_STICK_UP : "moveUp",
			LEFT_STICK_DOWN : "moveDown",
			LEFT_STICK_RIGHT : "moveRight",
			LEFT_STICK_LEFT : "moveLeft"
		}
	};

	function getLoadProgress() {
		return numResourcesLoaded / numResources;
	}

	function executeScriptQueue() {
		var next = scriptQueue[0];
		var first; 
		var script;

		if(next && next.loaded) {
			executeRunning = true;
			// remove the first item from the queue 
			scriptQueue.shift();
			first = document.getElementsByTagName("script")[0];
			script = document.createElement("script");
			script.onload = function() {
				if(next.callback) {
					next.callback();
				}
				// try to execute moAr
				executeScriptQueue();
			}; 
			script.src = next.src; 
			first.parentNode.insertBefore(script, first);
		} else {
			executeRunning = false;
		}
	}

	function load(src, callback) {
		var image;
		var queueEntry;

		numResources++;

		// add to executionQueue
		queueEntry = {
			src: src,
			callback: callback,
			loaded: false
		};
		scriptQueue.push(queueEntry);

		image = new Image();
		image.onload = image.onerror = function() {
			numResourcesLoaded++;
			queueEntry.loaded = true; 
			if(!executeRunning) {
				executeScriptQueue();
			}
		};
		image.src = src;
	}

	function setup() {
		matchThree.showScreen("screen-splash");
	}

	function showScreen(screenId) {
		var dom = matchThree.dom;
		var $ = dom.$; 
		var activeScreen = $("#game .screen.active")[0];
		var screen = $("#" + screenId)[0];

		if(!matchThree.screens[screenId]) {
			console.warn("Screen module " + screenId + " is not implemented yet!");
			return; //TODO: clean this shit up
		}

		if(activeScreen) {
			dom.removeClass(activeScreen, "active");
		}
		dom.addClass(screen, "active");
		matchThree.screens[screenId].run();
	}

	// :-D 
	function isStandalone() {
		return (window.navigator.standalone !== false);
	}

	return {
		load: load,
		setup: setup,
		showScreen: showScreen,
		isStandalone : isStandalone,
		screens: {},
		settings : settings,
		getLoadProgress : getLoadProgress
	};

})(); 