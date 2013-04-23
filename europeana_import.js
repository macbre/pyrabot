/**
 * Skrypt importujący wybrane zdjęcia ze strony 11ujec.blogspot.com
 */
var bot = require('nodemw'),
	client = new bot('config.js'),

	URL = 'http://resources21.kb.nl/gvn/SFA03/SFA03_SFA022001417_X.jpg',
	ID = '512ab1187f976de2d33bd7ce',
	DESC = 'Paul von Hindenburg (1847 - 1934) in militair uniform. Opperbevelhebber van het Duitse leger en drager van vele onderscheidingen, o.a. het IJzeren Kruis en het IJzeren Kruis met de gouden stralen. Plaats en datum van de foto onbekend.',
	NAME = 'File:Paul von Hindenburg.jpg';

client.logIn(function() {
	console.log('Import pliku <' + NAME + '> z serwisu Europeana...');

	// dodaj zdjęcia
	client.uploadByUrl(NAME, URL, 'Import zdjęcia z serwisu Europeana', function(res) {
		console.log('Upload ' + NAME + ' zakończony');

		var content = '{{Europeana|' + ID + '}}\n\n' + DESC;
		client.edit(NAME, content.trim(), 'Oznaczanie pliku z serwisu Europeana', function(res) {
			console.log('Plik ' + NAME + ' oznaczony');
		});
	});
});
