/**
 * Skrypt importujący wybrane zdjęcia z serwisu Europeana
 */
var bot = require('nodemw'),
	client = new bot('config.js');

	URL = 'http://resources21.kb.nl/gvn/SFA03/SFA03_SFA022001409_X.jpg', // adres obrazka (oryginał)
	ID = '92034/CA041B490D078A94D2F53B36B27AAD994B679189', // ID publikacji (Europeana)
	NAME = 'File:Paul von Hindenburg - w szkole kadetów.jpg'; // docelowa nazwa pliku

client.logIn(function() {
	console.log('Import pliku <' + NAME + '> z serwisu Europeana...');

	client.fetchUrl("http://www.europeana.eu/portal/record/" + ID + ".html", function(res) {
		if (!res) {
			return;
		}

		// opis zdjęcia
		var matches = res.match(/<title>([^<]+)<\/title>/);
		if (!matches) {
			return;
		}

		var DESC = matches[1].trim();
		console.log("Opis: " + DESC);

		// dodaj zdjęcia
		client.uploadByUrl(NAME, URL, 'Import zdjęcia z serwisu Europeana', function(res) {
			console.log('Upload ' + NAME + ' zakończony');

			var content = '{{Europeana|' + ID + '}}\n\n' + DESC;
			client.edit(NAME, content.trim(), 'Oznaczanie pliku z serwisu Europeana', function(res) {
				console.log('Plik ' + NAME + ' oznaczony');
			});
		});
	});
});
