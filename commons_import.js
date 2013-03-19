/**
 * Skrypt importujący wybrane zdjęcia ze strony 11ujec.blogspot.com
 */
var bot = require('../lib/bot').bot,
	client = new bot('config.js'),
	commons = new bot({
		server: 'commons.wikimedia.org',
		path: '/w'
	}),

	IMAGE = 'File:MPK_Poznań_Tramwaj.Konstal_102Na_Tram_nr_40,_Linia_1,_Poznan_May_1991_-_Flickr_-_sludgegulper.jpg';

client.logIn(function() {
	// pobierz URL do "pełnej" wersji obrazka
	commons.getImageInfo(IMAGE, function(res) {
		var url = res.url;

		console.log('Import pliku <' + IMAGE + '> z Wikimedia Commons...');

		// dodaj zdjęcia
		client.uploadByUrl(IMAGE, url, 'Import zdjęcia z Wikimedia Commons', function(res) {
			console.log('Upload ' + IMAGE + ' zakończony');

			var content = '{{Wikimedia}}'
			client.edit(IMAGE, content, 'Oznaczanie pliku z Wikimedia Commons', function(res) {
				console.log('Plik ' + IMAGE + ' oznaczony');
			});
		});
	});
});
