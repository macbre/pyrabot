#!/usr/bin/env node
var fs = require('fs'),
	bot = require('nodemw'),
	client = new bot('config.js');

var SUMMARY = 'Zaktualizowano dane o liniach ZTM';

// odczytaj bazę pętli
var db = JSON.parse(fs.readFileSync('db/ztm-linie.json'));

function updateLine(pageTitle) {
	var page = {title: pageTitle};

	var line = page.title.substring(20), // usuń prefix "Linia tramwajowa/autobusowa nr "
		stops = db[line] && db[line].petle,
		rozklad = db[line] && db[line].rozklad,
		przystanki = db[line] && db[line].przystanki;;
 
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
	console.log('Przystanków: ' + przystanki);

	client.getArticle(page.title, function(err, content) {
		if (content.indexOf('|historyczna=tak') > -1) {
			client.log(page.title + ': linia historyczna - pomijam');
			return;
		}

		// aktualizuj infobox
		content = content.replace(/\|pętla1\s?=[^|]+/, "|pętla1=" + stops[0] + "\n");
		content = content.replace(/\|pętla2\s?=[^|]+/, "|pętla2=" + stops[1] + "\n");

		if (przystanki > 0) {
			// dodaj parametr do wukitekstu
			if (content.indexOf('|przystanki') < 0) {
				content = content.replace(/\|dlugosc=/, '|przystanki=\n|dlugosc=');
			}

			content = content.replace(/\|przystanki\s?=[^|]+/, "|przystanki=" + przystanki + "\n");
		}

		if (rozklad) {
			// dodaj parametr do wukitekstu
			if (content.indexOf('|rozkład') < 0) {
				content = content.replace(/\|przystanki=/, '|rozkład=\n|przystanki=');
			}

			content = content.replace(/\|rozkład\s?=[^|]+/, "|rozkład=" + rozklad + "\n");
		}

		// usuń stare parametry
		// |przejazd=82
		// |strefy=A
		content = content.
			replace(/\|przejazd=\d+\n/, '').
			replace(/\|strefy=[ABC, ]+\n/, '');

		//console.log('\n\n================================\n' + page.title + '\n================================');
		//console.log(content); return;
	
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
	// aktualizuj Moduł:Przystanki-linie
	var lua = fs.readFileSync('db/ztm-stops.lua').toString();

	client.edit('Module:Przystanki-linie', lua, 'Aktualizacja listy przystanków', function(err, data) {
		if (err) {
			console.error('Error: Module:Przystanki-linie');
			console.error(err);
			return;
		}

		console.log('\n\n> Moduł:Przystanki-linie zaktualizowany!');
	});

	/**/
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
