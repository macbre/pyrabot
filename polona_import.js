#!/usr/bin/env node
/**
 * Skrypt importujący wybrane materiały z serwisy Polona
 *
 * ./polona_import.js "https://polona.pl/item/31585172/0/" "Plan Poznania - 1923.jpg"
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
	// https://polona.pl/item/5587569/0/
	// https://polona.pl/resources/item/5587569/
	var id = URL.match(/\/item\/(\d+)/)[1];

	client.fetchUrl('https://polona.pl/resources/item/' + id, function(err, resp) {
		if (err) throw err;

		var data = JSON.parse(resp),
			desc = '{{Polona|' + id + '}}\n\n' + data.title,
			imageUrl = data.pages[0].archive_url; // https://polona.pl/archive?uid=31585172&cid=32157616&name=download_fullJPG

		// upload
		var params = {
			comment: 'Import z serwisu Polona',
			text: desc.trim()
		};

		client.uploadByUrl(DEST, imageUrl, params, function(err, res) {
			console.log('Import zakończony');
		});
	});
});
