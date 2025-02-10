#!/usr/bin/env node
var fs = require('fs'),
	bot = require('nodemw'),
	client = new bot('config.js');

var SUMMARY = 'Zaktualizowano dane o liniach ZTM',
	SKIP = '<!-- pyrabot skip -->';

// odczytaj bazę pętli
var db = JSON.parse(fs.readFileSync('db/ztm-linie.json'));

function updateLine(pageTitle) {
	var page = {title: pageTitle};

	var line = page.title.substring(20), // usuń prefix "Linia tramwajowa/autobusowa nr "
		stops = db[line] && db[line].petle,
		rozklad = (db[line] && db[line].rozklad) || `https://www.ztm.poznan.pl/pl/rozklad-jazdy/${line}`,
		przystanki = db[line] && db[line].przystanki,
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
