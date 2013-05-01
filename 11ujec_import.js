/**
 * Skrypt importujący wybrane zdjęcia ze strony 11ujec.blogspot.com
 */
var bot = require('nodemw'),
	client = new bot('config.js');

var STREET = 'Ulica Gołębia',
	URL = 'http://11ujec.blogspot.com/2012/02/ulica-goebia.html',
	IMAGES = [
		'http://4.bp.blogspot.com/-PWM-0BtCN50/T0aaD60jHCI/AAAAAAAAHws/q2YD1hWZREU/s1600/IMG_0974.jpg',
		'http://4.bp.blogspot.com/-KpdbhvYQAM0/T0aaNnAALaI/AAAAAAAAHxk/QT68mVzo9Go/s1600/IMG_0982.jpg',
		'http://3.bp.blogspot.com/-PdXji6zYNE8/T0aaFR5NG6I/AAAAAAAAHw0/I6ejpeCqltE/s1600/IMG_0975.jpg',
	],
	CATEGORIES = [
		STREET,
		//'Śródka'
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
