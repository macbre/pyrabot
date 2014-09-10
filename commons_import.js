#!/usr/bin/env node
/**
 * Skrypt importujący wybrane zdjęcia ze strony 11ujec.blogspot.com
 */
var bot = require('nodemw'),
	client = new bot('config.js'),
	commons = new bot({
		server: 'commons.wikimedia.org',
		path: '/w'
	}),
	IMAGE = process.argv[2] || '',
	DEST;

if (IMAGE === '') {
	console.log('Podaj nazwę obrazka do importu');
	process.exit(1);
}

if (IMAGE.indexOf('File:') < 0) {
	IMAGE = 'File:' + IMAGE;
}

DEST = process.argv[3] || IMAGE;

client.log(IMAGE);
client.log(DEST);

client.logIn(function() {
	// pobierz URL do "pełnej" wersji obrazka
	commons.getImageInfo(IMAGE, function(res) {
		var url = res.url,
			params;

		params = {
			comment: 'Import zdjęcia z Wikimedia Commons',
			text: '{{Wikimedia}}'
		};

		console.log('Import pliku <' + IMAGE + '> z Wikimedia Commons jako <' + DEST + '>...');

		// dodaj zdjęcia
		client.uploadByUrl(DEST, url, params, function(res) {
			console.log('Upload ' + DEST + ' zakończony');
		});
	});
});
