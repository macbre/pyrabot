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
	DEST,
	src = IMAGE;

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

client.logIn(function(err) {
	// pobierz URL do "pełnej" wersji obrazka
	commons.getImageInfo(IMAGE, function(err, res) {
		var url = res.url,
			params;

		params = {
			comment: 'Import zdjęcia z Wikimedia Commons',
			text: '{{Wikimedia|' + src + '}}'
		};

		console.log('Import pliku <' + IMAGE + '> z Wikimedia Commons jako <' + DEST + '>...');

		// dodaj zdjęcia
		client.uploadByUrl(DEST, url, params, function(err, res) {
			if (err) {
				console.error(err);
				return;
			}

			var info = res.imageinfo;

			client.log('File page: <%s>', info.descriptionurl);
			client.log('URL:       <%s>', info.url);

			console.log('Upload ' + DEST + ' zakończony');
		});
	});
});
