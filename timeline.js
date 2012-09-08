var fs = require('fs'),
	data = JSON.parse(fs.readFileSync('osoby.json'));
	//data = JSON.parse(fs.readFileSync('bramy_festung.json'));

//console.log(data);

// ................................
//var since = 1820, to = 1860;
var since = 1950, to = 2012;
// ................................

var items = [];

// filtrowanie
data.forEach(function(item) {

	/**
	if (!item.from || !item.to) return;

	items.push({
		id: items.length,
		label: item.name,
		from: item.from,
		to: item.to
	});
	/((/

	/**/
	if (!item.ur || !item.sm) return;

	if (item.ur< to && item.sm > since) {
		items.push({
			id: items.length + 1,
			label: item.name,
			from: item.ur,
			to: item.sm
		});
	}
	/**/
});

console.log(items);

// zakresy
var min = since,
	max = to;

items.forEach(function(item) {
	min = Math.min(min, item.from - 10);
	max = Math.max(max, item.to + 10);
});


// renderuj wikitekst
// @see http://www.mediawiki.org/wiki/Extension:EasyTimeline/syntax
var height = 20 * items.length + 75;

var timeline = "<timeline>\n\
# generated at " + new Date().toUTCString() + " by timeline.js\n\
ImageSize = width:660 height:" + height + "\n\
PlotArea = left:150 bottom:20 top:20 right:20\n\
Alignbars = justify\n\
DateFormat  = yyyy\n\
Period = from:" + min + " till:" + max + "\n\
TimeAxis = orientation:horizontal format:yyyy\n\
\n\
#Legend = orientation:horizontal position:bottom\n\
\n\
ScaleMajor = increment:10 start:" + min + "\n\
ScaleMinor = unit:year increment:1 start:" + min + "\n";

// linie poziome
//
// legenda
timeline += "\n\nBarData =\n\n";
items.forEach(function(item) {
	timeline += "\tbar: " + item.id + " text:\"" + item.label  + "\"\n";
});

// dane
timeline += "\n\nPlotData =\n\n\twidth:14 textcolor:black color:blue align:left anchor:from shift:(10,-4)\n";
items.forEach(function(item) {
	timeline += "\tbar: " + item.id + " from:" + item.from  + " till:" + item.to + "\n";
});

timeline += '</timeline>';

console.log(timeline);
