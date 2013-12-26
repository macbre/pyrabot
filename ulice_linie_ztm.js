#!/usr/bin/env node
var fs = require('fs'),
	bot = require('nodemw'),
	client = new bot('config.js');

var SUMMARY = 'Aktualizacja danych o liniach ZTM';

var db = JSON.parse(fs.readFileSync('db/ztm-ulice.json'));

client.logIn(function(data) {
	// aktualizuj infoboxy
	client.getPagesInCategory('Ulice', function(pages) {
		if (pages) pages.forEach(function(page) {
			if (page.ns !== 0) return;

			// sprawdź bazę ulic
			var lines;
			for (var street in db) {
				if (page.title.indexOf(street) > -1) {
					lines = db[street];
					break;
				}
			}

			if (typeof lines !== 'undefined') {
				var tramLines = [],
					busLines = [];

				lines.forEach(function(line) {
					((line > 40 || line === 'L') ? busLines : tramLines).push(line);
				});

				console.log(page.title + ': ' + JSON.stringify({tram: tramLines, bus: busLines}));

				client.getArticle(page.title, function(content) {
					// wstaw nowe dane
					content = content.
						replace(/\|autobusy\s?\=(.*)\n/, '|autobusy=' + busLines.join(',') + "\n").
						replace(/\|tramwaje\s?\=(.*)\n/, '|tramwaje=' + tramLines.join(',') + "\n");

					//console.log(content);
					console.log(page.title + ' gotowa do aktualizacji...');

					// edytuj
					client.edit(page.title, content, SUMMARY, function() {
						console.log(page.title + ' done!');
					});
				});
			}
		});
	});
	
	client.getPagesInCategory('Ulice z transportem publicznym', function(pages) {
		if (pages) pages.forEach(function(page) {
			if (page.ns !== 0) return;

			// sprawdź bazę ulic
			var found = false;
			for (var street in db) {
				if (page.title.indexOf(street) > -1) {
					found = true;
					break;
				}
			}

			if (found) return;

			console.log(page.title + ': brak danych');

			client.getArticle(page.title, function(content) {
				// wstaw nowe dane
				content = content.
					replace(/\|autobusy\s?\=(.*)\n/, '|autobusy=' + "\n").
					replace(/\|tramwaje\s?\=(.*)\n/, '|tramwaje=' + "\n");

				//console.log(content);
				console.log(page.title + ' gotowa do usunięcia danych o liniach ZTM...');

				// edytuj
				client.edit(page.title, content, SUMMARY + ' (usunięcie danych)', function() {
					console.log(page.title + ' done!');
				});
			});
		});
	});	
});
