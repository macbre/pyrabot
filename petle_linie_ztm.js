var fs = require('fs'),
	bot = require('../lib/bot').bot,
	client = new bot('config.js');

var SUMMARY = 'Zaktualizowano dane o liniach ZTM (strefy taryfowe)';

// odczytaj bazę pętli
var db = JSON.parse(fs.readFileSync('db/ztm-linie.json'));

function updateLine(pageTitle) {
	var page = {title: pageTitle};

	var line = page.title.substring(20), // usuń prefix "Linia tramwajowa/autobusowa nr "
		stops = db[line] && db[line].petle,
		czas = db[line] && db[line].czas,
		przystanki = db[line] && db[line].przystanki,
		strefy = db[line] && db[line].strefy.join(', ');
 
	console.log("\n" + page.title + ' (#' + line + ')');

	if (typeof stops === 'undefined' || stops.length === 0) {
		console.log('>>> brak danych!');
		return;
	}

	// linie autobusowa z jedną pętlą (62, 89, 94, 96, ...)
	if (stops.length === 1) {
		stops[1] = stops[0];
	}

	console.log(JSON.stringify(db[line]));
	console.log(stops);
	console.log('Czas: ' + czas);
	console.log('Przystanków: ' + przystanki);
	console.log('Strefy: ' + strefy);

	client.getArticle(page.title, function(content) {
		// aktualizuj infobox
		content = content.replace(/\|pętla1\s?=[^|]+/, "|pętla1=" + stops[0] + "\n");
		content = content.replace(/\|pętla2\s?=[^|]+/, "|pętla2=" + stops[1] + "\n");

		if (czas > 0) {
			// dodaj parametr do wukitekstu
			if (content.indexOf('|przejazd') < 0) {
				content = content.replace(/\|dlugosc=/, '|przejazd=\n|dlugosc=');
			}

			content = content.replace(/\|przejazd\s?=[^|]+/, "|przejazd=" + czas + "\n");
		}

		if (przystanki > 0) {
			// dodaj parametr do wukitekstu
			if (content.indexOf('|przystanki') < 0) {
				content = content.replace(/\|dlugosc=/, '|przystanki=\n|dlugosc=');
			}

			content = content.replace(/\|przystanki\s?=[^|]+/, "|przystanki=" + przystanki + "\n");
		}

		if (strefy) {
			// dodaj parametr do wukitekstu
			if (content.indexOf('|strefy') < 0) {
				content = content.replace(/\|dlugosc=/, '|strefy=\n|dlugosc=');
			}

			content = content.replace(/\|strefy\s?=[^|]+/, "|strefy=" + strefy + "\n");
		}


		//console.log('\n\n================================\n' + page.title + '\n================================');
		//console.log(content); return;
	
		// zapisz zmiany
		client.edit(page.title, content, SUMMARY, function(data) {
			console.log('\n\n> ' + page.title + ' zaktualizowana!');
		});
	});
}

client.logIn(function() {
	/**
	client.getPagesByPrefix('Linia tramwajowa nr', function(pages) {
		pages && pages.forEach(function(page) {
			if (page.ns != 0) {
				return;
			}

			updateLine(page.title);
		});
	});
	**/
	client.getPagesByPrefix('Linia autobusowa nr', function(pages) {
		pages && pages.forEach(function(page) {
			if (page.ns != 0) {
				return;
			}

			updateLine(page.title);
		});
	});
});
