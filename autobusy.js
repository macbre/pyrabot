#!/usr/bin/env node
/**
 * Skrypt tworzący szkice stron o liniach autobusowych na podstawie danych z ZTM
 */
var fs = require('fs'),
	bot = require('nodemw'),
	client = new bot('config.js');

var SUMMARY = 'Automatyczne tworzenie stron o liniach autobusowych';

var db = JSON.parse(fs.readFileSync('db/ztm-linie.json')),
	year = 2023,
	text = '';

/**
// Kórnik
text = 'linia włączona w system transportu Poznania [[1 sierpnia]] [[2019]] roku wraz z integracją komunikacji miejskiej na terenie gmin [[Kórnik]] i [[Zaniemyśl]]' +
'<ref>[https://www.ztm.poznan.pl/pl/aktualnosci/od-1-sierpnia-2019-roku-integracja-transportu-publicznego-miasta-poznania-i-gmin-kornik-i-zaniemysl-najwazniejsze-informacje-dla-pasazerow ztm.poznan.pl - Od 1 sierpnia 2019 roku – integracja transportu publicznego Miasta Poznania i gmin Kórnik i Zaniemyśl. Najważniejsze informacje dla pasażerów]</ref>.\n\n' +
'== Źródła ==\n<references />';
**/

// minibusy
text = 'linia podmiejska biegnąca po trasie {trasa}.';

text += '\n\n== Źródła ==\n<references />';

// text += '\n\n[[Kategoria:Linie minibusowe]]';

client.logIn(function(err, data) {

	for (var line in db) {
		if (line == 201) continue;

		// if (! ['416'].includes(line) ) continue;

		// if (line < 500 || line > 570)  continue;

		if (line < 300 || line > 999) continue;

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
						"|brygady=" + (data.brygady || ''),
						"|przystanki=" + (data.przystanki || ''),
						"|przebieg=" + (data.przebieg || ''),
						"|dlugosc=",
						"|uruchomiona=",
						// "|uruchomiona=" + year,
						"|zlikwidowana=",
						"|wydział=",
						"|historia=",
						// "|historia=[[" + year + "]]: " + petle[0] + '-' + petle[1],
						"}}",
						"{{Szkic}}",
					].join("\n");

					// dodatkowy tekst
					if (text !== '') {
						content += "\n\n";
						content += "'''" + title + "''' - " + text.replace('{trasa}', `${petle[0]} - ${petle[1]}`);

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
