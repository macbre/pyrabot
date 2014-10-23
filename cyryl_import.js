#!/usr/bin/env node
/**
 * Skrypt importujący wybrane zdjęcie z portalu Cyryl
 *
 * @see http://www.cyryl.poznan.pl/katalog.php?pdgObRozsz=1&id_obiektu=21369
 */
var bot = require('nodemw'),
	client = new bot('config.js'),
	SIGN = process.argv[2],
	DEST = process.argv[3],
	URL;

if (!SIGN || !DEST) {
	console.log('Podaj sygnaturę obrazka do importu i nazwę docelową');
	console.log(process.argv[1] + ' <sygnatura> <nazwa docelowa>');
	process.exit(1);
}

URL = 'http://www.cyryl.poznan.pl/katalog.php?reset=1&baza=obiekty&sygnatura=' + SIGN;

client.log('Sygnatura: ' + SIGN);
client.log('URL: ' + URL);
client.log('Plik: ' + DEST);

client.logIn(function() {
	var jsdom = require('jsdom');

	jsdom.env(
		URL,
		["http://code.jquery.com/jquery.js"],
		function (errors, window) {
			var $ = window.$,
				imageUrl = 'http://www.cyryl.poznan.pl/' + $('.obraz > a').attr('href'),
				desc = $('.tytul_obiektu > a').text(),
				date = $('.data_obiektu').text().split('.').pop().trim();

			client.log('Obrazek: ' + imageUrl);
			client.log('Opis: ' + desc);
			client.log('Data: ' + date);

			// upload
			var params = {
				comment: 'Import z Cyryla',
				text: ('{{Cyryl|' + SIGN + '}}\n\n' + desc + "\n\n[[Kategoria:" + date + "]]").trim()
			};

			client.log('Wrzucam plik <' + imageUrl + '> jako <' + DEST + '>...');
			client.log(JSON.stringify(params));

			// dodaj zdjęcie
			client.uploadByUrl(DEST, imageUrl, params, function(res) {
				console.log('Import zakończony');
			});
		}
	);
});
