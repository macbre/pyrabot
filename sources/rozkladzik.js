#!/usr/bin/env phantomjs
/**
 * Pobierz dane o liniach tramwajowych i autobusowych:
 *
 *  - pętle
 *  - liczba przystanków
 */
var URL = 'http://www.rozkladzik.pl/poznan/';

var page = require('webpage').create();

console.log('Otwieram <' + URL + '>...');

// przekaż do konsoli
page.onConsoleMessage = function(msg) {
	console.log(msg);
};

page.onError = function(err) {
	console.log('Error: ' + err);
};

page.open(URL, function(status) {
	if (status !== 'success') {
		phantom.exit(1);
	}

	console.log('Strona załadowana...');

	// poczekaj na załadowanie listy linii via AJAX
	setTimeout(function() {
		var json = page.evaluate(function() {
			var lines,
				data = {};

			console.log('Pobieram listę linii...');
			$('#tab_time_table_title').click();

			lines = $('#tab_time_table table td.lineName');
			console.log('Znalezionych linii: ' + lines.length);

			lines.each(function() {
				var currentLine = $(this).text(),
					entry;

				// za tramwaj
				if (currentLine[0] === 'T') {
					return;
				}

				entry = {
					typ: '',
					petle: [],
					//strefy: [],
					przystanki: 0,
					//czas: 0,
					//agency: ''
				};

				console.log('> Linia nr ' + currentLine);

				// rozwiń trasę danej linii
				$(this).click();
				$('.dirName[nr=0]').click();

				// typ linii
				switch ($('.dirName img').attr('src')) {
					case 'img/veh_1.png':
						entry.typ = 'bus';
						break;

					case 'img/veh_2.png':
						entry.typ = 'tram';
						break;
				}

				// przystanki
				var stops = $('.timeTable .busStopRow').not('[title]').children('.bsName');
				entry.przystanki = stops.length;

				// pętle
				$.each([
					stops.first().text(),
					stops.last().text()
				], function(idx, value) {
					// "Górczyn (GORC41)" -> "Górczyn"
					var text = value.split('(').shift().trim();

					text = text.
						replace('Os. Sobieskiego', 'Osiedle Jana III Sobieskiego').
						replace(/^os\.\s?/i, 'Osiedle ');

					entry.petle.push(text);
				});

				//console.log(JSON.stringify(entry));
				data[currentLine] = entry;
			});

			console.log('Gotowe');
			return JSON.stringify(data, null, '  ');
		});

		if (json === '{}') {
			phantom.exit(1);
		}

		// zapisz do pliku
		var fs = require('fs');
		fs.write('../db/ztm-linie.json', json, 'w');

		phantom.exit(0);
	}, 100);
});
