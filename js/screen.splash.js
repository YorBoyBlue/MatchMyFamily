matchThree.screens["screen-splash"] = (function(){
	var firstRun = true;

	function checkProgress() {
		var $ = matchThree.dom.$;
		var p = matchThree.getLoadProgress() * 100;
		$("#screen-splash .indicator")[0].style.width = p + "%";
		if(p == 100) {
			setup();
		} else {
			setTimeout(checkProgress, 30);
		}
	}

	function setup() {
		var dom = matchThree.dom, $ = dom.$, screen = $("#screen-splash")[0];
		$(".continue", screen)[0].style.display = "block";
		dom.bind("#screen-splash", "click", function() {
			matchThree.showScreen("screen-menu");
		});
	}

	function run() {
		if(firstRun) {
			checkProgress();
			firstRun = false;
		}
	}

	return {
		run: run
	};









})();