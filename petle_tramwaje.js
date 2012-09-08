var fs = require('fs'),
	bot = require('../lib/bot').bot,
	client = new bot('config.js');

var SUMMARY = 'Zaktualizowano dane o przystankach końcowych';

// odczytaj bazę pętli
var db = JSON.parse(fs.readFileSync('db/petle.json'));

client.logIn(function() {
	client.getPagesInCategory('Linie tramwajowe', function(pages) {
		pages && pages.forEach(function(page) {
			if (page.ns != 0) {
				return;
			}

			if (page.title.indexOf('Linia tramwajowa nr') != 0) {
				return;
			}

			client.getArticle(page.title, function(content) {
				var line = page.title.substring(20),
					stops = db[line];

				if (typeof stops === 'undefined') {
					return;
				}

				console.log("\n" + page.title + ' (#' + line + ')');
				console.log(stops);

				// aktualizuj infobox
				content = content.replace(/\|pętla1\s?=[^|]+/, "|pętla1=" + stops[0] + "\n");
				content = content.replace(/\|pętla2\s?=[^|]+/, "|pętla2=" + stops[1] + "\n");

				console.log('\n\n================================\n' + page.title + '\n================================');
				console.log(content);

				// zapisz zmiany
				/**/
				try {
					client.edit(page.title, content, SUMMARY, function(data) {
						console.log('\n\n> ' + page.title + ' edited!');
					});
				} catch(e) {
					console.log(e);
				}
				/**/
			});
		});

		console.log("\n\nDone");
	});
});
