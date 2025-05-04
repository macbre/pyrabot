#!/usr/bin/env node
const fs = require('node:fs'),
	bot = require('nodemw'),
	client = new bot('config.js');

const SKIP = '<!-- pyrabot skip -->';

// odczytaj bazę pętli
const db = JSON.parse(fs.readFileSync('db/ztm-linie.json'));

/**
 * @param {string} pageTitle 
 * @returns {void}
 */
function updateLine(pageTitle) {
	const page = {title: pageTitle};

	const line = page.title.substring(20), // usuń prefix "Linia tramwajowa/autobusowa nr "
		lineNumeric = parseInt(line, 10),
		stops = db[line] && db[line].petle,
		rozklad = (db[line] && db[line].rozklad) || `https://www.ztm.poznan.pl/pl/rozklad-jazdy/${line}`,
		przystanki = db[line] && db[line].przystanki,
		brygady = db[line] && db[line].brygady,
		przebieg = db[line] && db[line].przebieg;
 
	console.log("\n" + page.title + ' (#' + line + ')');

	if (typeof stops === 'undefined' || stops.length === 0) {
		console.log('>>> brak danych!');
		return;
	}

	if (line == '31' || line == '32') {
		return;
	}

	// linie autobusowa z jedną pętlą (62, 89, 94, 96, ...)
	if (stops.length === 1) {
		stops[1] = stops[0];
	}

	console.log(JSON.stringify(db[line]));
	console.log(stops);
	console.log('Przystanków: ' + przystanki);

	client.getArticle(page.title, function(err, content) {
		if (err) {
			console.log('Failed to get the content of ' + page.title);
			throw err;	
		}

		if (content.indexOf('|historyczna=tak') > -1) {
			client.log(page.title + ': linia historyczna - pomijam');
			return;
		}

		if (content.indexOf(SKIP) > -1) {
			client.log(page.title + ' - skip!');
			return;
		}

		var orig = content;

		// aktualizuj infobox
		content = content.replace(/\|\s?pętla1\s?=[^|}]+/, "|pętla1=" + stops[0] + "\n");
		content = content.replace(/\|\s?pętla2\s?=[^|}]+/, "|pętla2=" + stops[1] + "\n");

		if (przystanki > 0) {
			// dodaj parametr do wikitekstu
			if (content.indexOf('|przystanki') < 0) {
				content = content.replace(/\|pętla1=/, '|przystanki=\n|pętla1=');
			}

			content = content.replace(/\|przystanki\s?=[^|}]+/, "|przystanki=" + przystanki + "\n");
		}

		if (brygady > 0) {
			// dodaj parametr do wikitekstu
			if (content.indexOf('|brygady') < 0) {
				content = content.replace(/\|przystanki=/, '|brygady=\n|przystanki=');
			}

			content = content.replace(/\|brygady\s?=[^|}]+/, "|brygady=" + brygady + "\n");
		}

		if (przebieg) {
			// dodaj przebieg do wikitekstu
			if (content.indexOf('|przebieg') < 0) {
				content = content.replace(/\|pętla1=/, '|przebieg=\n|pętla1=');
			}

			content = content.replace(/\|przebieg\s?=[^|}]+/, "|przebieg=" + przebieg + "\n");
		}

		if (rozklad) {
			// dodaj parametr do wikitekstu
			if (content.indexOf('|rozkład') < 0) {
				content = content.replace(/\|przebieg=/, '|rozkład=\n|przebieg=');
			}

			content = content.replace(/\|rozkład\s?=[^|}]+/, "|rozkład=" + rozklad + "\n");
		}

		// kolory
		if (content.indexOf('kolor1') < 0) {
			content = content.replace(/\|rozkład=/, '|kolor1=\n|kolor2=\n|rozkład=');
		}

		content = content.replace(/\|kolor1\s?=[^|}]+/, "|kolor1=" + db[line]['kolor1'] + "\n");
		content = content.replace(/\|kolor2\s?=[^|}]+/, "|kolor2=" + db[line]['kolor2'] + "\n");

		// operatorzy linii podmiejskich
		if (lineNumeric >= 300) {
			let operator = '';

			// Czerwonak
			if (lineNumeric >= 300 && lineNumeric <= 399) {
				operator = 'TRANSKOM';
			}

			// Swarzędz
			if (lineNumeric >= 400 && lineNumeric <= 499) {
				operator = 'Swarzędzkie Przedsiębiorstwo Komunalne';
			}

			// Kórnik
			if (lineNumeric >= 500 && lineNumeric <= 599) {
				operator = 'KPA KOMBUS';
			}

			// Luboń
			if (lineNumeric >= 600 && lineNumeric <= 699) {
				operator = 'Translub';
			}

			// Komorniki
			if (lineNumeric >= 700 && lineNumeric <= 799) {
				operator = 'PUK';
			}

			// Tarnowo Podgórne
			if (lineNumeric >= 800 && lineNumeric <= 899) {
				operator = 'TPBUS';
			}

			// Suchy Las
			if (lineNumeric >= 900 && lineNumeric <= 999) {
				operator = 'ZKP Suchy Las';
			}

			// dodaj parametr do wikitekstu
			if (content.indexOf('|operator') < 0) {
				content = content.replace(/\|pętla1=/, '|operator=\n|pętla1=');
			}

			content = content.replace(/\|operator\s?=[^|}]+/, "|operator=" + operator + "\n");
		}

		// usuń stare parametry
		// |przejazd=82
		// |strefy=A
		content = content.
			replace(/\|przejazd=\d+\n/, '').
			replace(/\|strefy=[ABC, ]+\n/, '');

		//console.log('\n\n================================\n' + page.title + '\n================================');
		//console.log(content); return;

		if (content === orig) {
			console.log('No diff for ' + page.title);
			return;
		}

		console.log(client.diff(orig, content));
	
		// zapisz zmiany
		var comment = stops[0] + ' - ' + stops[1];

		client.edit(page.title, content, comment, function(err, data) {
			if (err) {
				console.error('Error: ' + page.title);
				console.error(err);
				return;
			}

			console.log('\n\n> ' + page.title + ' zaktualizowana!');
		});
	});
}

client.logIn(function(err) {

	if (err) {
		console.error('Failed to log in: ' + err);
		throw err;	
	}

	// aktualizuj Moduł:Przystanki-linie
	const lua = fs.readFileSync('db/ztm-stops.lua').toString();

	client.edit('Module:Przystanki-linie', lua, 'Aktualizacja listy przystanków', function(err, _) {
		if (err) {
			console.error('Error: Module:Przystanki-linie');
			console.error(err);
			return;
		}

		console.log('\n\n> Moduł:Przystanki-linie zaktualizowany!');
	});

	client.getPagesByPrefix('Linia tramwajowa nr', function(err, pages) {
		pages && pages.forEach(function(page) {
			if (page.ns != 0) {
				return;
			}

			updateLine(page.title);
		});
	});
	/**/
	client.getPagesByPrefix('Linia autobusowa nr', function(err, pages) {
		pages && pages.forEach(function(page) {
			if (page.ns != 0) {
				return;
			}

			updateLine(page.title);
		});
	});
});
