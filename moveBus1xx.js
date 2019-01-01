/**
 * Zmiana numeracji poznańskich linii autobusowych od stycznia 2019r.
 *
 * 52 -> 152
 */
var bot = require('nodemw'),
	client = new bot('config.js');

var SUMMARY = 'Zmiana numeracji poznańskich linii autobusowych od stycznia 2019r.';

client.logIn(function() {
	client.getPagesInCategory('Linie autobusowe', (err, pages) => {
		var stubsFound = 0,
			idx = 0;

		//console.log("Pages: " + pages.length);

		pages.forEach(page => {
			if (page.ns !== 0) {
				return;
			}

			var matches = page.title.match(/nr (\d+)$/),
				num = matches ? parseInt(matches[1], 10) : false;

			if (!num) return;
			if (num < 40 || num > 99) return;

			/// if (num > 75) return; // TODO

			var newTitle = 'Linia autobusowa nr ' + (num + 100 + '');
			console.log(page.title + ' -> ' + newTitle);

			client.getArticle(page.title, (err, content) => {
				// template
				content = content.replace('|numer=' + num, '|numer=' + (num+100+''));

				// '''Linia autobusowa nr 51'''
				content = content.replace('nr ' + num + "'''", 'nr ' + (num+100+'') + "'''");

				// console.log(page.title, content); return;

				// replace numbers
				client.edit(page.title, content, SUMMARY, () => {
					// and move the page
					client.move(page.title, newTitle, SUMMARY, () => {
						console.log(" # " + page.title + " moved");
					});
				});
			});
		});
	});
});
