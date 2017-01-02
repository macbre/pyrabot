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
				author = $('.autor_obiektu > a').text() || $('.wlasciciel_obiektu > a').text(),
				place = $('.miejsce_obiektu > a').text().split(',')[1].trim(),
				desc = $('.tytul_obiektu > a').text(),
				date = $('.data_obiektu').text().split('.').pop().trim();

			// parsuj datę
			var matches = date.match(/\d{4}/);
			if (matches) date = matches[0];

			// miejsce
			place = place.replace('ul. ', 'Ulica ');

			client.log('Obrazek: ' + imageUrl);
			client.log('Autor:   ' + author);
			client.log('Miejsce: ' + place);
			client.log('Opis:    ' + desc);
			client.log('Data:    ' + date);

			// upload
			var params = {
				comment: 'Import z Cyryla',
				text: ('{{Cyryl|' + SIGN + '}}\n\nAutor: [[' + author + ']]\n\n' + desc + "\n\n[[Kategoria:" + date + "]][[Kategoria:" + author + "]][[Kategoria:" + place + "]]").trim()
			};

			client.log(params.text);

			// http://www.cyryl.poznan.pl/upload_ext/kolekcje/557/tzKGtUik0FGXDHC57Dm4_ar16x9.jpg
			// http://www.cyryl.poznan.pl/upload_ext/kolekcje/557/tzKGtUik0FGXDHC57Dm4.jpg
			imageUrl = imageUrl.replace(/_ar\d+x\d+\.jpg/, '.jpg');

			client.log('Wrzucam plik <' + imageUrl + '> jako <' + DEST + '>...');
			client.log(JSON.stringify(params));

			// dodaj zdjęcie
			client.uploadByUrl(DEST, imageUrl, params, function(res) {
				console.log('Import zakończony');
			});
		}
	);
});
