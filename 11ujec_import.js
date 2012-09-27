/**
 * Skrypt importujący wybrane zdjęcia ze strony 11ujec.blogspot.com
 */
var bot = require('../lib/bot').bot,
	client = new bot('config.js');

var STREET = 'Ulica Rzeczańska',
	URL = 'http://11ujec.blogspot.com/2012/05/ulica-rzeczanska.html',
	IMAGES = [
		'http://3.bp.blogspot.com/-9MHvoWj0j1I/T7FQsH_0UZI/AAAAAAAAJ7c/zmN5_u8yBqk/s1600/IMG_6295.jpg',
		'http://2.bp.blogspot.com/-HROHvjjn1es/T7FQjP_5d0I/AAAAAAAAJ6k/lssq8o76enE/s1600/IMG_6286.jpg',
		'http://3.bp.blogspot.com/-TnPJn-_5jrg/T7FQwixBiLI/AAAAAAAAJ70/G_NSG5HdJN4/s1600/IMG_6310.jpg'
	],
	CATEGORIES = [
		STREET,
		'Żegrze'
	];

client.logIn(function() {
	console.log('Import zdjęć dla artykułu "' + STREET + '" <' + URL + '>...');

	// upload
	var cnt = 1;
	IMAGES.forEach(function(image) {
		var filename = STREET + ' ' + (cnt++) + '.jpg';

		// dodaj zdjęcia
		client.uploadByUrl(filename, image, 'Import zdjęć ze strony 11ujec.blogspot.com', function(res) {
			console.log('Upload ' + filename + ' zakończony');

			// oznacz zdjęcia szablonem autora + kategoria
			var categories = '[[Kategoria:' + CATEGORIES.join(']]\n[[Kategoria:')  + ']]',
				content = '{{Fotografie 11 ujęć}}\n\n' + categories;

			client.edit('Plik:' + filename, content, 'Oznaczanie zdjęć ze strony 11ujec', function(res) {
				console.log('Plik ' + filename + ' oznaczony');
			});
		});
	});

	// generuj wikitekst galerii
	var wikitext = [
		'== Galeria ==',
		'{{11 ujęć|' + URL + '}}',
		'<gallery captionalign="left" orientation="none" widths="200" columns="3" bordercolor="#ffffff" bordersize="large" spacing="small">'
	];

	var cnt = 1;
	IMAGES.forEach(function(image) {
		wikitext.push(STREET + ' ' + (cnt++) + '.jpg');
	});

	wikitext.push('</gallery>');

	wikitext = wikitext.join("\n");

	console.log('');
	console.log(wikitext);
	console.log('');
});
