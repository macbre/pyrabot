#!/usr/bin/env node
/**
 * Skrypt tworzący szkice stron o liniach autobusowych na podstawie danych z ZTM
 */
var fs = require('fs'),
	bot = require('nodemw'),
	client = new bot('config.js');

var SUMMARY = 'Automatyczne tworzenie stron o liniach autobusowych';

var db = JSON.parse(fs.readFileSync('db/ztm-linie.json')),
	year = 2015,
	text = '';

// Czerwonak
/**
text = 'linia uruchomiona [[1 stycznia]] [[2015]] roku wraz z integracją komunikacji miejskiej na terenie gminy [[Czerwonak]] i części gminy [[Murowana Goślina]]' +
'<ref>[http://www.ztm.poznan.pl/czerwonak-m-go-l/wykaz-linii-oraz-mapy/ ztm.poznan.pl - nowa organizacja linii oraz opłat za korzystanie z komunikacji miejskiej na terenie gminy Czerwonak i części gminy Murowana Goślina]</ref>.\n\n' +
'== Źródła ==\n<references />';
/**/

client.logIn(function(err, data) {

	for (var line in db) {
		if (line == 201) continue;

		// tylko linie autobusowe
		if (line > 40 || line === 'L') {
			(function(line) {
				var data = db[line],
					petle = data.petle || [],
					nocna = line > 230 && line < 300,
					title = 'Linia autobusowa nr ' + line;

				if (petle.length === 0) {
					return;
				}

				if (petle.length == 1) {
					petle[1] = petle[0];
				}

				console.log(title + ': ' + JSON.stringify(petle));

				client.getArticle(title, function(err, content) {
					// strona istnieje
					if (typeof content !== 'undefined') {
						return;
					}

					console.log('Tworzę stronę "' + title + '"...');

					// infobox
					content =  [
						"{{Linia autobusowa infobox",
						"|numer=" + line,
						"|historyczna=",
						"|wahadłowa=",
						"|nocna=" + (nocna ? "tak" : ""),
						"|podmiejska=" + (line > 300 ? "tak" : ""),
						"|foto=",
						"|pętla1=" + petle[0],
						"|pętla2=" + petle[1],
						"|przystanki=" + data.przystanki,
						"|dlugosc=",
						"|uruchomiona=" + year,
						"|zlikwidowana=",
						"|wydział=",
						"|historia=[[" + year + "]]: " + petle[0] + '-' + petle[1],
						"}}",
						"{{Szkic}}",
					].join("\n");

					// dodatkowy tekst
					if (text !== '') {
						content += "\n\n";
						content += "'''" + title + "''' - " + text;

						content = content.trim();
					}

					// nawigacja
					content += "\n\n{{Nawigacja Linie autobusowe}}";

					console.log(content);

					// edytuj
					client.edit(title, content, SUMMARY + ': ' + petle[0] + ' - ' + petle[1], function(err) {
						if (!err) {
							console.log(title + ' założona');
						}
					});
				});
			})(line);
		}
	}
});
