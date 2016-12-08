#!/usr/bin/env node
/**
 * Skrypt importujący zalążek artykułubiogramu
 */
var bot = require('nodemw'),
	client = new bot('config.js'),
	wikipedia = new bot({
		protocol: 'https',
		server: 'pl.wikipedia.org',
		path: '/w',
		debug: true
	}),
	OSOBA = process.argv[2] || '',
	DEST = process.argv[3] || OSOBA;

if (OSOBA === '') {
	console.log('Podaj tytuł biogramu');
	process.exit(1);
}

client.log(OSOBA);
client.log(DEST);

function formatDate(day) {
	parts = day.split(' ');
	return `[[${parts[0]} ${parts[1]}]] [[${parts[2]}]]`;
}

client.logIn(function(err) {
	// pobierz biogram
	wikipedia.getArticle(OSOBA, function(err, content) {

		if (typeof content === 'undefined') {
			throw 'Brak artykułu';
		}

		wikipedia.parse(content, undefined, function(err, parsed) {
			if (err) throw err;

			//console.log(parsed);

			var image = parsed.match(/\d+px-([^"]+)"/),
				firstPara = parsed.match(/<p>(<b>[^\n]+)<\/p>/),
				born, died;

			if (!image || !firstPara) throw 'No matches';

			image = decodeURIComponent(image[1]);
			firstPara = firstPara[0];

			firstPara = firstPara.
				// <p> tags
				replace(/<\/?p>/g, '').
				// bold
				replace(/<\/?b>/g, "'''").
				// remove <ref>
				replace(/\[\d+\]/g, '').
				// remove HTML
				replace(/<[^>]+>/g, '');

			// bio
			born = firstPara.match(/ur. (\d+ [^\s]+ \d{4})/);
			died = firstPara.match(/zm. (\d+ [^\s]+ \d{4})/);

			if (born && died) {
				born = formatDate(born[1]);
				died = formatDate(died[1]);
			}

			// remove bio data
			firstPara = firstPara.replace(/ \(ur.[^)]+\)/, '');

			// auto-linking
			firstPara = firstPara.replace(/\d{4}/g, '[[$&]]');

			//console.log([image, born, died, firstPara]);

			var wikitext = `
{{Osoba infobox
|osoba=${DEST}
|grafika=${image}
|data_ur=${born}
|miejsce_ur=
|data_sm=${died}
|miejsce_sm=
}}
{{Szkic}}

${firstPara}
`.trim();

			console.log(wikitext);
		});

		/**
		var url = res.url,
			params;

		params = {
			comment: 'Import zdjęcia z Wikimedia Commons',
			text: '{{Wikimedia|' + src + '}}'
		};

		console.log('Import pliku <' + IMAGE + '> z Wikimedia Commons jako <' + DEST + '>...');

		// dodaj zdjęcia
		client.uploadByUrl(DEST, url, params, function(err, res) {
			if (err) {
				console.error(err);
				return;
			}

			var info = res.imageinfo;

			client.log('File page: <%s>', info.descriptionurl);
			client.log('URL:       <%s>', info.url);

			console.log('Upload ' + DEST + ' zakończony');
		});
		**/
	});
});
