/*
 * Create a list that holds all of your cards
 */

var HTMLCardListTemplate = '<li class="card"><div class="cover"></div><i class="%data%"></i></li>';
// var HTMLCardListTemplate = '<li class="card"><i class="%data%"></i></li>';
var HTMLStar = '<li><i class="fa fa-star"></i></li>';
var HTMLHalfStar = '<li><i class="fa fa-star-half-o" aria-hidden="true"></i></li>';
var HTMLEmptyStar = '<li><i class="fa fa-star-o" aria-hidden="true"></i></li>';
var HTMLResult = '<p class="result-content">with %data% moves, %data2% in %data3% mode</p>'

// Const
var totalTime = 30; // used in countdown mode

var clickedCards = new Map();
var openedCards = []; // both opened
var cardsToBeClosed = []; // mismatch opened cards
var clickedTimer; // for click single card
var closeTimer; // for mismatch opened cards
var moveSteps = 0; // it's also pairs for opened card
var pairsCount = 0; // total pairs, don't change it after init
var errorCount = 0; // remain error chance for mismatch
var maxErrorCount = 0; // Allowed max error count, other wise the core will be zero, don't change it after init
var cardTheme = "Original-Theme"; // "Original-Theme" "Money-Theme" "Transportation-Theme"
var gameLevel = 0; // 0 - easy  1 - middle 2 - difficult
var gameMode = 0; // 0 - normal 1 - speed
var gameSkin = 0; // 0 - Blue 1 - Yellow 2 Green
var consumedTime = 0; // used in normal mode
var remainTime = totalTime; // used in countdown mode
var interval; // for countdown and timer
var isGameStarted = false;

function updateTime() {
	interval = setInterval(function(){
		consumedTime += 1;
		updateTimeLabel(consumedTime);
	}, 1000);
}

function updateCountdown() {
	interval = setInterval(function(){
		remainTime -= 1;
		if (remainTime >= 0) {
			updateScore();
			updateTimeLabel(remainTime);
		} else {
			// remain time is minus
			clearInterval(interval);
			promptRetryDialog();
		}
		
	}, 1000);
}

function updateTimeLabel(time) {
	$("#timer").text(time + "s");
}


//TODO: To be done for larger scale icons
var theme_icons = {
	"easyMeta" : {
		"Original-Theme": [
			"fa fa-diamond",
			"fa fa-anchor",
			"fa fa-bolt",
			"fa fa-cube",
			"fa fa-leaf",
			"fa fa-bicycle",
			"fa fa-bomb",
			"fa fa-paper-plane-o"
		],
		"Money-Theme": [
			"fa fa-eur",
			"fa fa-usd",
			"fa fa-btc",
			"fa fa-gbp",
			"fa fa-gg",
			"fa fa-ils",
			"fa fa-inr",
			"fa fa-rub"
		],
		"Transportation-Theme": [
			"fa fa-ambulance",
			"fa fa-bus",
			"fa fa-car",
			"fa fa-taxi",
			"fa fa-truck",
			"fa fa-subway",
			"fa fa-train",
			"fa fa-ship"
		],
	},

	"middleMeta" : {
		"Original-Theme": [
			"fa fa-diamond",
			"fa fa-anchor",
			"fa fa-bolt",
			"fa fa-cube",
			"fa fa-leaf",
			"fa fa-bicycle",
			"fa fa-bomb",
			"fa fa-paper-plane-o",
			"fa fa-beer",
			"fa fa-flag",
			"fa fa-gavel",
			"fa fa-glass"
		],
		"Money-Theme": [
			"fa fa-eur",
			"fa fa-usd",
			"fa fa-btc",
			"fa fa-gbp",
			"fa fa-gg",
			"fa fa-ils",
			"fa fa-inr",
			"fa fa-rub",
			"fa fa-krw",
			"fa fa-try",
			"fa fa-money",
			"fa fa-jpy"
		],
		"Transportation-Theme": [
			"fa fa-ambulance",
			"fa fa-bus",
			"fa fa-car",
			"fa fa-taxi",
			"fa fa-truck",
			"fa fa-subway",
			"fa fa-train",
			"fa fa-ship",
			"fa fa-plane",
			"fa fa-fighter-jet",
			"fa fa-rocket",
			"fa fa-motorcycle"
		],
	},

	"DifficultMeta" : {

	},

	"getMetaData": function(level, theme) {
		metaData = [];
		if (level == 1) {
			metaData = theme_icons.middleMeta;
		} else if (level == 2) {
			metaData = theme_icons.difficultMeta;
		} else {
			metaData = theme_icons.easyMeta;
		}
		return metaData[theme];
	}
}

var game = {
	"cards": [],

	"init": function() {
		card_meta_data = theme_icons.getMetaData(gameLevel, cardTheme);
		pairsCount = card_meta_data.length;
		maxErrorCount = pairsCount * 3; // 3 chances for each pair
		errorCount = maxErrorCount;
		console.log(card_meta_data);
		game.cards = [];
		card_meta_data.forEach(function(ele){
			game.cards.push(HTMLCardListTemplate.replace("%data%", ele));
			game.cards.push(HTMLCardListTemplate.replace("%data%", ele));
		});
		updateScore();

		if (gameMode == 1) {
			// Speed mode
			updateTimeLabel(remainTime);
		} else {
			// Normal mode
			updateTimeLabel(consumedTime);
		}
	},

	/*
	 * Display the cards on the page
	 *   - shuffle the list of cards using the provided "shuffle" method below
	 *   - loop through each card and create its HTML
	 *   - add each card's HTML to the page
	 */

	// Shuffle function from http://stackoverflow.com/a/2450976
	"shuffle":  function() {
	    var currentIndex = game.cards.length, temporaryValue, randomIndex;

	    while (currentIndex !== 0) {
	        randomIndex = Math.floor(Math.random() * currentIndex);
	        currentIndex -= 1;
	        temporaryValue = game.cards[currentIndex];
	        game.cards[currentIndex] = game.cards[randomIndex];
	        game.cards[randomIndex] = temporaryValue;
	    }

	    return game.cards;
	},

	"show": function (array) {
		$(".deck").empty();
		array.forEach(function(c) {
			$(".deck:last").append(c);
		});
	}

};

function playMatchSound() {
	matchSound = new Audio("./audio/match.mp3");
	matchSound.play();
}

function playMismatchSound() {
	mismatchSound = new Audio("./audio/mismatch.mp3");
	mismatchSound.play();
}

function updateMoves() {
	$(".moves").text(moveSteps);
}

function reset() {
	clickedCards.clear();
	openedCards = [];
	cardsToBeClosed = [];
	clearTimeout(clickedTimer);
	clearTimeout(closeTimer);
	clearInterval(interval);

	moveSteps = 0;
	consumedTime = 0;
	remainTime = 30;
	errorCount = maxErrorCount;
	isGameStarted = false;
	updateMoves();
	updateScore();
	if (gameMode == 1) {
		// Speed mode
		updateTimeLabel(remainTime);
	} else {
		// Normal mode
		updateTimeLabel(consumedTime);
	}
}

function open(obj) {
	$(obj).addClass("open show");
}

function closeAll(objs) {
	objs.forEach(function(obj){
		close(obj);
	});
	cardsToBeClosed = [];
}

function close(obj) {
	$(obj).removeClass("open show match mismatch");
	clickedCards.clear();
}

function match(obj) {
	$(obj).addClass("match");
}

function mismatch(obj) {
	$(obj).addClass("mismatch");
}

//TODO: it's not good enough for the score rule to be extended
function updateScore() {
	$(".stars").empty();
	console.log("error count: " + errorCount);
	console.log((maxErrorCount - errorCount) / maxErrorCount);
	console.log((pairsCount -  1) / pairsCount);
	if (gameMode == 1) {
		if (remainTime / totalTime >= 0.6) {
			$(".stars:last").append(HTMLStar, HTMLStar, HTMLStar);
		} else if (remainTime / totalTime >= 0.5) {
			$(".stars:last").append(HTMLStar, HTMLStar, HTMLHalfStar);
		} else if (remainTime / totalTime >= 0.4) {
			$(".stars:last").append(HTMLStar, HTMLStar, HTMLEmptyStar);
		} else if (remainTime / totalTime >= 0.3) {
			$(".stars:last").append(HTMLStar, HTMLHalfStar, HTMLEmptyStar);
		} else if (remainTime / totalTime >= 0.2) {
			$(".stars:last").append(HTMLStar, HTMLEmptyStar, HTMLEmptyStar);
		} else if (remainTime / totalTime > 0) {
			$(".stars:last").append(HTMLHalfStar, HTMLEmptyStar, HTMLEmptyStar);
		} else {
			$(".stars:last").append(HTMLEmptyStar, HTMLEmptyStar, HTMLEmptyStar);
		}	
	} else {
		// Normal mode or default rules
		if (errorCount / maxErrorCount >= (pairsCount -  1) / pairsCount) {
			$(".stars:last").append(HTMLStar, HTMLStar, HTMLStar);
		} else if (errorCount / maxErrorCount >= (pairsCount -  2) / pairsCount) {
			$(".stars:last").append(HTMLStar, HTMLStar, HTMLHalfStar);
		} else if (errorCount / maxErrorCount >= (pairsCount -  3) / pairsCount) {
			$(".stars:last").append(HTMLStar, HTMLStar, HTMLEmptyStar);
		} else if (errorCount / maxErrorCount >= (pairsCount -  4) / pairsCount) {
			$(".stars:last").append(HTMLStar, HTMLHalfStar, HTMLEmptyStar);
		} else if (errorCount / maxErrorCount >= (pairsCount -  5) / pairsCount) {
			$(".stars:last").append(HTMLStar, HTMLEmptyStar, HTMLEmptyStar);
		} else if (errorCount / maxErrorCount >= (pairsCount -  6) / pairsCount) {
			$(".stars:last").append(HTMLHalfStar, HTMLEmptyStar, HTMLEmptyStar);
		} else {
			$(".stars:last").append(HTMLEmptyStar, HTMLEmptyStar, HTMLEmptyStar);
		}
	}
}

function promptRetryDialog() {
	if (gameMode == 1) {
		$(".retry-message").text("Timeout! Retry again!");
	} else {
		$(".retry-message").text("Don't give up! Retry again!");
	}
    $(".retry").dialog({
      modal: true,
      // fluid: true, //new option
      // resizable: false,
      buttons: {
        Ok: function() {
          $(this).dialog("close");
          restart(false);
        }
      }
    });
}

function openResult() {
	$(".container").addClass("hide");
	// $(".result").addClass("show");
	$(".congratulations").css("display", "block");
	setTimeout(function() {
		$(".circle-loader").toggleClass("load-complete");
		$(".checkmark").toggle();
	}, 1000);

	clearInterval(interval);
	if (gameMode == 1) {
		$(".result").append(HTMLResult.replace("%data%", moveSteps).replace("%data2%", "Remain " + remainTime + "s").replace("%data3%", "Speed"));
	} else {
		$(".result").append(HTMLResult.replace("%data%", moveSteps).replace("%data2%", "Consume " + consumedTime + "s").replace("%data3%", "Normal"));
	}
	
}

// This function only used by congratulation page
function replay() {
	$(".congratulations").css("display", "none");
	restart(false);
	$(".container").removeClass("hide");
}

function restart(init) {
	reset();
	if (init) {
		game.init();
	}
	game.show(game.shuffle());	
}

function promptHelp() {
    $(".helper").dialog({
      width: "50%",
      // maxWidth: 300,
      modal: true,
      // fluid: true, //new option
      // resizable: false,
      buttons: {
        Ok: function() {
          $(this).dialog("close");
        }
      }
    });
}

function toggleSettingsPanel() {
	if ($("#menu").hasClass("open")) {
		$("#menu").removeClass("open")
		$("#menu").addClass("close")
	} else {
		$("#menu").removeClass("close");
		$("#menu").addClass("open");
	}
	event.stopPropagation();
}

function updateSkin() {
	if (gameSkin == 1) {
		$(".deck").addClass("yellow");
		$(".deck").removeClass("blue");
		$(".deck").removeClass("green");
	} else if (gameSkin == 2) {
		$(".deck").addClass("green");
		$(".deck").removeClass("blue");
		$(".deck").removeClass("yellow");
	} else {
		$(".deck").addClass("blue");
		$(".deck").removeClass("yellow");
		$(".deck").removeClass("green");
	}
}

/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

$(window).click(function() {
	console.log("visible: " + $("#menu").css("display"))
	if ($("#menu").is(":visible")) {
		// $("#menu").hide();
		$("#menu").removeClass("open")
		$("#menu").addClass("close")
	}
});

$("#theme-orig").on("click", function(){
	cardTheme = "Original-Theme";
	restart(true);
});

$("#theme-money").on("click", function(){
	cardTheme = "Money-Theme";
	restart(true);	
});

$("#theme-trans").on("click", function(){
	cardTheme = "Transportation-Theme";
	restart(true);	
});

$("#skin-blue").on("click", function(){
	gameSkin = 0;
	updateSkin();
});

$("#skin-yellow").on("click", function(){
	gameSkin = 1;
	updateSkin();	
});

$("#skin-green").on("click", function(){
	gameSkin = 2;
	updateSkin();
});


$("#toggle").on("click", replay);

$(".restart").on("click", function() {
	restart(false);
});

$(".question").on("click", promptHelp);

$(".settings").on("click", toggleSettingsPanel);

$(".theme").on("change",function(){
	cardTheme = $(this).val();
	restart(true);
});

$(".modes").on("change",function(){
	gameMode = $(this).val();
	console.log("mode change: " + gameMode);
	restart(true);
});

$(".levels").on("change",function(){
	console.log($(this).val());
	gameLevel = $(this).val();
	restart(true);

	if(gameLevel == 1) {
		// Middle level, middle size
		$(".deck").addClass("middle-level-style");
		$(".deck").removeClass("diffcult-level-style");

		$(".card").addClass("middle-size");
		$(".card").removeClass("large-size");
	} else if (gameLevel == 2) {
		// Difficult level, large size(actually card may be smaller size)
		$(".deck").addClass("diffcult-level-style");
		$(".deck").removeClass("middle-level-style");

		$(".card").addClass("large-size");
		$(".card").removeClass("middle-size");
	} else {
		// Easy level, small size(actually may be bigger size )
		$(".deck").removeClass("middle-level-style");
		$(".deck").removeClass("diffcult-level-style");

		$(".card").removeClass("middle-size");
		$(".card").removeClass("large-size");
	}
});

 $(".deck").on("click", "li.card", function(event){
 	if (!isGameStarted) {
 		isGameStarted = true;
 		if (gameMode == 1) {
 			updateCountdown();
 		} else {
 			updateTime();
 		}
 	}

	// open the card
	var cardClass = $(this).find("i").attr("class");
	if (openedCards.includes(cardClass)) {
		// already paird successfully
		return;
	}
	if (clickedCards.size == 0) {
		open(this);
		clickedCards.set(cardClass, this);
		clickedTimer = setTimeout(close, 1500, this);
	} else if (clickedCards.has(cardClass)) {
		if (clickedCards.get(cardClass) == this) {
			// close(this);
			// Do nothing as there is a timer to close the opened card
		} else {
			clearTimeout(clickedTimer);
			// match style
			clickedCards.forEach(function(value, key) {
			    match(value);
			});
			match(this);
			openedCards.push(cardClass);
			clickedCards.clear();
			moveSteps += 1;
			playMatchSound();
		}
	} else {
		clearTimeout(clickedTimer);
		// mismatch style
		clickedCards.forEach(function(value, key) {
		    mismatch(value);
		    cardsToBeClosed.push(value);
		});
		clickedCards.clear();
		console.log("mismatch log " + $(this).find("i").attr("class"))
		mismatch(this);
		cardsToBeClosed.push(this);

		playMismatchSound();
		moveSteps += 1;
		errorCount -= 1;
		closeTimer = setTimeout(closeAll, 1000, cardsToBeClosed);
	}

	updateScore();
	updateMoves();
	if (gameMode == 0 && errorCount <= 0) {
		promptRetryDialog();
	} else if (openedCards.length >= pairsCount) {
		openResult();
	}
})


 // Execution
game.init();
game.show(game.shuffle());
$("#menu").menu();