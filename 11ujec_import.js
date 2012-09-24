/**
 * Skrypt importujący wybrane zdjęcia ze strony 11ujec.blogspot.com
 */
var bot = require('../lib/bot').bot,
	client = new bot('config.js');

var STREET = 'Ulica Inflancka',
	URL = 'http://11ujec.blogspot.com/2012/09/ulica-inflancka.html',
	IMAGES = [
		'http://4.bp.blogspot.com/-QMXJ8Q5_SQc/UF9u17ZVy0I/AAAAAAAANxI/nIqck2_-PvM/s1600/IMG_0447.jpg',
		'http://3.bp.blogspot.com/-shiPSjV9NmE/UF9u3IkTxFI/AAAAAAAANxM/NMe0bWMPM60/s1600/IMG_0450.jpg',
		'http://2.bp.blogspot.com/-BMtStFWTNlQ/UF9u9gnDVnI/AAAAAAAANyA/TsJEKT5Xpfg/s1600/IMG_0466.jpg'
	];

client.logIn(function() {
	console.log('Import zdjęć dla artykułu "' + STREET + '" <' + URL + '>...');

	// upload
	var cnt = 1;
	IMAGES.forEach(function(image) {
		var filename = STREET + ' ' + (cnt++) + '.jpg';

		client.uploadByUrl(filename, image, 'Import ze strony 11ujec.blogspot.com', function(res) {
			console.log('Upload ' + filename + ' zakończony');

			// oznacz zdjęcia szablonem autora + kategoria
			var content = '{{Szablon:Fotografie 11 ujęć}}\n\n[[Kategoria:' + STREET + ']]';
			client.edit('Plik:' + filename, content, 'Oznaczanie zdjęć ze strony 11ujec.blogspot.com', function(res) {
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

	console.log(wikitext);
});
