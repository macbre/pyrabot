var fs = require('fs'),
	bot = require('../lib/bot').bot,
	client = new bot('config.js');

var SUMMARY = 'Zaktualizowano dane o przystankach końcowych';

// odczytaj bazę pętli
var db = JSON.parse(fs.readFileSync('db/petle.json'));

function updateLine(pageTitle) {
	var page = {title: pageTitle};

	var line = page.title.substring(20), // usuń prefix "Linia tramwajowa/autobusowa nr "
		stops = db[line];

	console.log("\n" + page.title + ' (#' + line + ')');

	if (typeof stops === 'undefined') {
		console.log('>>> brak danych!');
		return;
	}

	// linie autobusowa z jedną pętlą (62, 89, 94, 96, ...)
	if (stops.length === 1) {
		stops[1] = stops[0];
	}

	console.log(stops);

	client.getArticle(page.title, function(content) {
		// aktualizuj infobox
		content = content.replace(/\|pętla1\s?=[^|]+/, "|pętla1=" + stops[0] + "\n");
		content = content.replace(/\|pętla2\s?=[^|]+/, "|pętla2=" + stops[1] + "\n");

		//console.log('\n\n================================\n' + page.title + '\n================================');
		//console.log(content);

		// zapisz zmiany
		client.edit(page.title, content, SUMMARY, function(data) {
			console.log('\n\n> ' + page.title + ' zaktualizowana!');
		});
	});
}

client.logIn(function() {
	client.getPagesByPrefix('Linia tramwajowa nr', function(pages) {
		pages && pages.forEach(function(page) {
			if (page.ns != 0) {
				return;
			}

			updateLine(page.title);
		});
	});

	client.getPagesByPrefix('Linia autobusowa nr', function(pages) {
		pages && pages.forEach(function(page) {
			if (page.ns != 0) {
				return;
			}

			updateLine(page.title);
		});
	});
});
