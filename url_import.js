#!/usr/bin/env node
/**
 * Skrypt importujący wybrane zdjęcia via URL
 */
var bot = require('nodemw'),
	client = new bot('config.js'),
	IMAGE = process.argv[2] || '',
	DEST,
	src = IMAGE;

if (IMAGE === '') {
	console.log('Podaj nazwę obrazka do importu');
	process.exit(1);
}

DEST = process.argv[3] || IMAGE;

client.log(IMAGE);
client.log(DEST);

client.logIn(function(err) {
	// pobierz URL do "pełnej" wersji obrazka
	console.log('Import pliku <' + IMAGE + '> jako <' + DEST + '>...');

	// dodaj zdjęcia
	var params = {
		comment: 'Import zdjęcia via URL',
		text: '[' + IMAGE + ' Źródło]'
	};

	client.uploadByUrl(DEST, IMAGE, params, function(err, res) {
		if (err) throw err;
		console.log('Upload ' + DEST + ' zakończony', res.filename);
	});
});
