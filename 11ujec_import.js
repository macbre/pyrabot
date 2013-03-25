/**
 * Skrypt importujący wybrane zdjęcia ze strony 11ujec.blogspot.com
 */
var bot = require('../lib/bot').bot,
	client = new bot('config.js');

var STREET = 'Ulica Masztalarska',
	URL = 'http://11ujec.blogspot.com/2012/02/ulica-masztalarska.html',
	IMAGES = [
		'http://2.bp.blogspot.com/-hwxYUudU8xk/Ty2dOs14yRI/AAAAAAAAHck/r_yjk0uVquo/s1600/IMG_8540.jpg',
		'http://1.bp.blogspot.com/-ocTwlZzD3iY/Ty2dSme4sgI/AAAAAAAAHdA/fcmZ0vJqyoo/s1600/IMG_8548.jpg',
		'http://2.bp.blogspot.com/-f1tchrb_0z0/Ty2dWYwpxtI/AAAAAAAAHdY/Zp2hH_VceCk/s1600/IMG_8554.jpg',
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
