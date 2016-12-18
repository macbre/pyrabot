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
	DEST = process.argv[3] || OSOBA,
	SUMMARY = 'Import zalążka artykułu z Wikipedii';

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
	wikipedia.getArticle(OSOBA, (err, content) => {

		if (typeof content === 'undefined') {
			throw 'Brak artykułu';
		}

		wikipedia.parse(content, undefined, (err, parsed) => {
			if (err) throw err;

			//console.log(parsed);

			var image = parsed.match(/\d+px-([^"]+.jpg)"/i),
				firstPara = parsed.match(/<p>(<b>[^\n]+)<\/p>/),
				born, died;

			if (!image) throw 'No image match';
			if (!firstPara) throw 'No paragraph match';

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

			client.getArticle(DEST, (err, content) => {
				// strona istnieje
				if (typeof content !== 'undefined') {
					throw 'Artykuł juz istnieje';
				}


				// edytuj
				client.edit(DEST, wikitext, SUMMARY, (err) => {
					if (err) {
						throw err;
					}
					console.log(DEST + ' - artykuł utworzony');
				});
			});

		});
	});
});
