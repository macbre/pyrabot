#!/usr/bin/env node
/**
 * Skrypt migrujący zdjęcia na galerię
 */

var bot = require('nodemw'),
	client = new bot('config.js');

var REASON = 'Porządkuję zdjęcia',
	PAGE = process.argv[2],
	START_FROM = parseInt(process.argv[3]) || 2;

if (!PAGE) {
	console.log('Podaj tytuł artykułu');
	process.exit(1);
}

client.log('Artykuł: ' + PAGE);
client.log('Przenieś zdjęcia od pozycji #' + START_FROM);

client.logIn(function(err) {
	if (err) return;

	client.getArticle(PAGE, function(err, content) {
		if (err) return;

		// zdjęcia
		// [[File:Schemat cytadela.jpg|thumb|220x220px|Plan Fortu Winiary]]
		var re = /\[\[(File|Plik).*\]\]\n/g,
		//var re = /\[\[(File|Plik)[^\]]+\]\]/g,
			matches = content.match(re) || false,
			orig = content;

		if (matches === false) {
			return;
		}

		//console.log(matches); return;
		
		// formatuj galerię
		var gallery = '<gallery captionalign="left" orientation="none" widths="200" bordercolor="#ffffff" bordersize="large" spacing="small">\n';

		matches.forEach(function(item, idx) {
			if (idx + 1 < START_FROM) return; // nie zmieniaj X pierwszych zdjęć w artykule

			var parts = item.replace(/\n/g, '').substr(7).split('|'); // usuń [[File:

			content = content.
				replace("\n" + item + "\n", '').
				replace(item, '');

			// nazwa pliku
			gallery += parts[0];

			// opis
			if (parts.length > 1) {
				gallery += '|' + parts.slice(3).join('').replace(/\]\]$/, '');
			}

			gallery += "\n";
		});

		gallery += '</gallery>';

		if (content.indexOf('== Galeria ==') > -1) {
			content = content.replace('== Galeria ==', '== Galeria ==\n' + gallery + '\n', content);
		}
		else {
			content = content.trim() + "\n\n== Galeria ==\n" + gallery;
		}

		console.log(client.diff(orig, content));

		// zapisz zmiany
		client.edit(PAGE, content, REASON, function() {
			console.log('# Poprawiłem '+ PAGE);
		});
	});
});
