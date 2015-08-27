#!/usr/bin/env node
var fs = require('fs'),
	bot = require('nodemw'),
	client = new bot('config.js');

var SUMMARY = 'Aktualizacja danych o ulicach z bazy Geopozu';

var db = JSON.parse(fs.readFileSync('db/ulice.json'));

client.logIn(function(err) {
	// aktualizuj infobox
	client.getPagesInCategory('Ulice', function(err, pages) {
		//pages = pages.slice(0, 50);

		client.log('Stron do aktualizacji: ' + pages.length);

		pages.forEach(function(page) {
			if (page.ns !== 0 && page.ns !== 2500 /* NS_ULICA */) return;

			client.getArticle(page.title, function(err, content) {
				var orig = content,
					name = page.title.replace(/Ulica[ :]/, ''),
					entry = db[name];

				if (!entry) return;

				client.log('> ' + name);
				//client.log(content);

				// |długość=760 m
				if (content.indexOf('|długość') < 0) {
					content = content.replace("|dzielnice=", "|długość=\n|dzielnice=");
					client.log('  Dodaję parametr długość');
				}

				if (entry.dlugosc) {
					content = content.replace(/\|długość(.*)\n/, "|długość=" + entry.dlugosc + " m\n");
				}

				// |numery= 2-14, 16
				if (entry.numeracja) {
					content = content.replace(/\|numery(.*)\n/, "|numery=" + entry.numeracja + "\n");
				}

				// |kody=60-123,60-134
				if (entry.kody_pocztowe) {
					content = content.replace(/\|kody(.*)\n/, "|kody=" + entry.kody_pocztowe + "\n");
				}

				// zmiana?
				if (orig === content) return;

				client.log(client.diff(orig, content));

				client.edit(page.title, content, SUMMARY, function(err) {
					console.log(page.title + ' zaktualizowana');
				});
			});
		});
	});
});
