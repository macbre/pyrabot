/**
 * Skrypt dodający szablon nawigacji po artykułach w danej kategorii
 */

var bot = require('../lib/bot').bot,
	client = new bot('config.js');

var SUMMARY = 'Dodano nawigację',
	templateName = 'Nawigacja Kościoły',
	category = 'Kościoły';

client.logIn(function(data) {
	client.getPagesInCategory(category, function(pages) {
		pages && pages.forEach(function(page) {
			// tylko NS_MAIN
			if (page.ns != 0) {
				return;
			}

			client.getArticle(page.title, function(content) {
				// dodano już szablon
				if (content.indexOf(templateName) > -1) {
					return;
				}

				// dodaj szablon
				content += "\n\n{{" + templateName + "}}";

				console.log('Dodaję nawigację do ' + page.title + '...');

				//console.log('\n\n================================\n' + page.title + '\n================================');
				//console.log(content);

				// and save it
				client.edit(page.title, content, SUMMARY, function(data) {
					console.log(page.title + ' zapisany');
				});
			});
		});
	});
});
