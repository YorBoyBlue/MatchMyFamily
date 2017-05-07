matchThree.board = (function() {
	var worker, messageCount, callbacks;

	function initialize(callback) {
		rows = matchThree.settings.rows;
		cols = matchThree.settings.cols;
		messageCount = 0;
		callbacks = [];
		worker = new Worker("js/board.worker.js");
		matchThree.dom.bind(worker, "message", messageHandler);
		post("initialize", matchThree.settings, callback);
	}

	function post(command, data, callback) {
		callbacks[messageCount] = callback;
		worker.postMessage({
			id: messageCount,
			command: command,
			data: data
		});
		messageCount++;
	}

	function swap(x1, y1, x2, y2, callback) {
		post("swap", {
			x1: x1,
			y1: y1,
			x2: x2,
			y2: y2
		}, callback);
	}

	function messageHandler(event) {
		// uncomment to log worker messages
		//console.log(event.data);

		var message = event.data;
		tiles = message.tiles;

		if(callbacks[message.id]) {
			callbacks[message.id](message.data);
			delete callbacks[message.id];
		}
	}

	function getBoard() {
    	var copy = [], x;
    	for(x = 0; x < cols; x++) {
    		copy[x] = tiles[x].slice(0);
    	}
    	return copy;
    }

	function print() {
		//post("print");
		var str = "";
		for(var y = 0; y < rows; y++) {
			for(var x = 0; x < cols; x++) {
				str += getTile(x, y) + " ";
			}
			str += "\r\n";
		}
		console.log(str);
	}

	function getTile(x, y) {
		if(x < 0 || x > cols-1 || y < 0 || y > rows-1) {
			return -1;
		} else {
			return tiles[x][y];
		}
	}

	return {
		initialize: initialize,
		swap: swap,
		getBoard: getBoard,
		print: print
	};

})();