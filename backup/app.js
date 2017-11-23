/*
 * Create a list that holds all of your cards
 */

var HTMLCardListTemplate = '<li class="card"><div class="flipper"><div class="back"></div><div class="front"><i class="%data%"></i></div></div></li>';
var HTMLStar = '<li><i class="fa fa-star"></i></li>';
var HTMLHalfStar = '<li><i class="fa fa-star-half-o" aria-hidden="true"></i></li>';
var HTMLEmptyStar = '<li><i class="fa fa-star-o" aria-hidden="true"></i></li>';

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

var card = {
 //    "cards" : [
	//     '<li class="card"><i class="fa fa-diamond"></i></li>',
	//     '<li class="card"><i class="fa fa-paper-plane-o"></i></li>',
	//     '<li class="card"><i class="fa fa-anchor"></i></li>',
	//     '<li class="card"><i class="fa fa-bolt"></i></li>',
	//     '<li class="card"><i class="fa fa-cube"></i></li>',
	//     '<li class="card"><i class="fa fa-anchor"></i></li>',
	//     '<li class="card"><i class="fa fa-leaf"></i></li>',
	//     '<li class="card"><i class="fa fa-bicycle"></i></li>',
	//     '<li class="card"><i class="fa fa-diamond"></i></li>',
	//     '<li class="card"><i class="fa fa-bomb"></i></li>',
	//     '<li class="card"><i class="fa fa-leaf"></i></li>',
	//     '<li class="card"><i class="fa fa-bomb"></i></li>',
	//     '<li class="card"><i class="fa fa-bolt"></i></li>',
	//     '<li class="card"><i class="fa fa-bicycle"></i></li>',
	//     '<li class="card"><i class="fa fa-paper-plane-o"></i></li>',
	//     '<li class="card"><i class="fa fa-cube"></i></li>'
	// ],
	"cards": [],

	"init": function() {
		card_meta_data = theme_icons.getMetaData(gameLevel, cardTheme);
		pairsCount = card_meta_data.length;
		maxErrorCount = pairsCount * 3; // 3 chances for each pair
		errorCount = maxErrorCount;
		console.log(card_meta_data);
		card.cards = [];
		card_meta_data.forEach(function(ele){
			console.log("wow::" + ele);
			card.cards.push(HTMLCardListTemplate.replace("%data%", ele));
			card.cards.push(HTMLCardListTemplate.replace("%data%", ele));
		});
	},

	/*
	 * Display the cards on the page
	 *   - shuffle the list of cards using the provided "shuffle" method below
	 *   - loop through each card and create its HTML
	 *   - add each card's HTML to the page
	 */

	// Shuffle function from http://stackoverflow.com/a/2450976
	"shuffle":  function() {
	    var currentIndex = card.cards.length, temporaryValue, randomIndex;

	    while (currentIndex !== 0) {
	        randomIndex = Math.floor(Math.random() * currentIndex);
	        currentIndex -= 1;
	        temporaryValue = card.cards[currentIndex];
	        card.cards[currentIndex] = card.cards[randomIndex];
	        card.cards[randomIndex] = temporaryValue;
	    }

	    return card.cards;
	},

	"show": function (array) {
		console.log("hello")
		$(".deck").empty();
		array.forEach(function(c) {
			console.log(c)
			$(".deck:last").append(c);
		});
	}

};

var clickedCards = new Map();
var openedCards = []; // both opened
var cardsToBeClosed = [];
var clickedTimer;
var closeTimer;
var moveSteps = 0;
var pairsCount = 0;
var errorCount = 0;
var maxErrorCount = 0; // Allowed max error count, other wise the core will be zero
var cardTheme = "Original-Theme";
var gameLevel = 0; // 0 - easy  1 - middle 2 - difficult

function playMatchSound() {
	matchSound = new Audio("./audio/match.mp3");
	matchSound.play();
}

function playMismatchSound() {
	mismatchSound = new Audio("./audio/mismatch.mp3");
	mismatchSound.play();
}

function increaseMoves() {
	moveSteps += 1;
	$(".moves").text(moveSteps);
}

function reset() {
	clickedCards.clear();
	openedCards = [];
	cardsToBeClosed = [];
	clearTimeout(clickedTimer);
	clearTimeout(closeTimer);
	moveSteps = 0;
	$(".moves").text(moveSteps);
}

function open(obj) {
	console.log("open the card " + obj);
	$(obj).find(".flipper").addClass("open");
	// $(obj).find(".back").addClass("open show");
	// $(obj).find(".front").addClass("open show");
}

function closeAll(objs) {
	objs.forEach(function(obj){
		close(obj);
	});
	cardsToBeClosed = [];
}

function close(obj) {
	console.log("close the card " + obj);
	// $(obj).removeClass("open show match mismatch");
	$(obj).find(".flipper").removeClass("open")
	clickedCards.clear();
}

function match(obj) {
	console.log("match the card " + obj);
	$(obj).find(".front").addClass("match");
}

function mismatch(obj) {
	console.log("mismatch the card " + obj);
	// $(obj).find(".front").removeClass("open");
	$(obj).find(".front").addClass("mismatch");
}

//TODO: it's not good enough for the score rule to be extended
function updateScore() {
	$(".stars").empty();
	console.log("error count: " + errorCount);
	console.log((maxErrorCount - errorCount) / maxErrorCount);
	console.log((pairsCount -  1) / pairsCount);
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

function promptContinueDialog() {

}

function openResult() {
	$(".container").addClass("hide");
	// $(".result").addClass("show");
	$(".result").css("display", "block");
}

function replay() {
	// $(".result").removeClass("show");
	reset();
	$(".result").css("display", "none");
	card.show(card.shuffle());
	$(".container").removeClass("hide");
}

function restart() {
	card.show(card.shuffle());
	reset();	
}

function promptHelp() {
    $("#dialog-message").dialog({
      // width: "auto",
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
$("#toggle").on("click", replay);

$(".restart").on("click", restart);

$(".question").on("click", promptHelp);

$(".settings").on("click", toggleSettingsPanel);

$(".theme").on("change",function(){
	console.log($(this).val());
	cardTheme = $(this).val();
	card.init();
	restart();
});

$(".levels").on("change",function(){
	console.log($(this).val());
	gameLevel = $(this).val();
	card.init();
	restart();
});

 $(".deck").on("click", "li.card", function(event){
	// open the card
	console.log("card click");
	var cardClass = $(this).find("i").attr("class");
	console.log(cardClass);
	if (openedCards.includes(cardClass)) {
		return;
	}
	if (clickedCards.size == 0) {
		open(this);
		clickedCards.set(cardClass, this);
		clickedTimer = setTimeout(close, 1000, this);
	} else if (clickedCards.has(cardClass)) {
		clearTimeout(clickedTimer);
		if (clickedCards.get(cardClass) == this) {
			close(this);
		} else {
			// match style
			clickedCards.forEach(function(value, key) {
			    match(value);
			});
			match(this);
			openedCards.push(cardClass);
			clickedCards.clear();
			increaseMoves();
			playMatchSound();
		}
	} else {
		// mismatch style
		clickedCards.forEach(function(value, key) {
		    mismatch(value);
		});
		console.log("mismatch log " + $(this).find("i").attr("class"))
		mismatch(this);
		clickedCards.forEach(function(value, key) {
		    // close(value);
		    cardsToBeClosed.push(value);
		});
		playMismatchSound();
		increaseMoves();
		errorCount -= 1;
		cardsToBeClosed.push(this);
		// close(this);
		clickedCards.clear();
		clearTimeout(clickedTimer);
		closeTimer = setTimeout(closeAll, 1000, cardsToBeClosed);
	}

	updateScore();
	if (openedCards.length >= card.cards.length / 2) {
		openResult();
	}
})


 // Execution
card.init();
card.show(card.shuffle());
$("#menu").menu();
