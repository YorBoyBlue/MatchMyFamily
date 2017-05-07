var matchThree = {};

importScripts("board.js");

addEventListener("message", function(event) {

	var board = matchThree.board, message = event.data;

	switch(message.command) {

		case "initialize":
			matchThree.settings = message.data;
			board.initialize(callback);
			//board.initialize();
		break;

		case "swap":
			board.swap(
				message.data.x1,
				message.data.y1,
				message.data.x2,
				message.data.y2,
				callback
			);
		break;

		// case "print":
		// 	board.print();
		// break;
	}

	function callback(data) {
		postMessage({
			id: message.id,
			data: data,
			tiles: board.getBoard()
		});
	}

}, false);