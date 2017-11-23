
var loadCompleted = function() {
	$('.circle-loader').toggleClass('load-complete');
	$('.checkmark').toggle();
}
console.log("congratulations!");

setTimeout(loadCompleted, 1000);
