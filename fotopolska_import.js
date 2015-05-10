#!/usr/bin/env node
/**
 * Skrypt importujący wybrane zdjęcie z portalu fotopolska.eu
 */
var bot = require('nodemw'),
	client = new bot('config.js'),
	URL = process.argv[2],
	DEST = process.argv[3];

if (!URL || !DEST) {
	console.log('Podaj nazwę obrazka do importu i nazwę docelową');
	console.log(process.argv[1] + ' <URL> <nazwa docelowa>');
	process.exit(1);
}

client.log('Import: ' + URL);
client.log('Plik: ' + DEST);

client.logIn(function() {
	var jsdom = require('jsdom');

	jsdom.env(
		URL,
		["http://code.jquery.com/jquery.js"],
		function (errors, window) {
			var $ = window.$,
				imageUrl = 'http://fotopolska.eu/' + $('#foto').attr('src'),
				desc = $('.OpisZdjecia').text();

			client.log('Obrazek: ' + imageUrl);
			client.log('Opis: ' + desc);

			// upload	
			var params = {
				comment: 'Import z fotopolska.eu',
				text: ('{{Fotopolska|' + URL + '}}\n\n' + desc).trim()
			};

			client.log('Wrzucam plik <' + imageUrl + '> jako <' + DEST + '>...');
			client.log(params);

			// dodaj zdjęcie
			client.uploadByUrl(DEST, imageUrl, params, function(err, res) {
				console.log('Import zakończony');
			});
		}
	);
});
