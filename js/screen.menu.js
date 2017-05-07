matchThree.screens["screen-menu"] = (function(){
	var firstRun = true;
	var dom = matchThree.dom;

	function setup() {
		dom.bind("#screen-menu ul.menu", "click", function(e) {
			if(e.target.nodeName.toLowerCase() === "button") {
				var action = e.target.getAttribute("name");
				matchThree.showScreen(action);
			}
		});
	}

	function run() {
		if(firstRun) {
			setup();
			firstRun = false;
		}
	}

	return {
		run: run
	};









})();