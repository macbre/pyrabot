#!/usr/bin/env node
/**
 * Skrypt importujący wybrane zdjęcie z Google Picasa
 */
var bot = require('nodemw'),
	client = new bot('config.js'),
	URL = process.argv[2],
	DEST = process.argv[3];

if (!URL || !DEST) {
	console.log('Podaj link obrazka do importu i nazwę docelową');
	console.log(process.argv[1] + ' <URL> <nazwa docelowa>');
	process.exit(1);
}

URL = URL.replace('?feat=directlink', '');

client.log('Import: ' + URL);
client.log('Plik: ' + DEST);

client.fetchUrl(URL, function(err, resp) {
	if (err) {
		console.error(err);
		return;
	}

	// pobierz opis i link do oryginału zdjęcia
	matches = resp.match(/{'preload': (.*)},\n/);

	if (!matches) {
		console.error('JSON info not found!');
		return;
	}

	// parsuj JSON z feed'em
	var preload = JSON.parse(matches[1]),
		feed = preload.feed;

	//client.logData(feed);

	var desc = feed.htmlCaption.trim(),
		imageUrl = feed.media.thumbnail[0].url;

	client.log('Zdjęcie: ' + imageUrl);
	client.log('Opis: ' + desc);

	// upload	
	client.logIn(function() {
		var params = {
			comment: 'Import z Google Picasa',
			text: ('{{Picasa|' + URL +'}}\n\n' + desc).trim()
		};

		client.log('Wrzucam plik <' + imageUrl + '> jako <' + DEST + '>...');

		// dodaj zdjęcie
		client.uploadByUrl(DEST, imageUrl, params, function(res) {
			console.log('Import zakończony');
		});
	});
});
