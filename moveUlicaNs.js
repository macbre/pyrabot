/**
 * Przenosi szkice artykułów o ulicach do namespace'a Ulica (id 2500)
 */
var bot = require('nodemw'),
	client = new bot('config.js');

var SUMMARY = 'Przenoszenie szkiców artykułów o ulicach do oddzielnego namespace\'a',
	STUB = '{{Szkic}}',
	TEMPLATE = '{{Kandydat do przeniesienia|$1}}',
	BATCH = 250;

client.logIn(function() {
	client.getPagesInCategory('Ulice', function(pages) {
		var stubsFound = 0,
			idx = 0;

		console.log("Articles: " + pages.length);

		pages.forEach(function(page) {
			if (page.ns !== 0) {
				return;
			}

			if (++idx > BATCH) {
				return;
			}

			client.getArticle(page.title, function(content) {
				if (content.indexOf(STUB) === -1) {
					return;
				}

				var newTitle = 'Ulica:' + page.title.replace(/^Ulica /, '');

				stubsFound++;
				console.log(" * #" + stubsFound + " stub found: " + page.title + " -> " + newTitle);

				client.move(page.title, newTitle, SUMMARY, function() {
					console.log(" # " + page.title + " moved");
				});
			});
		});
	});
});
