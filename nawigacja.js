#!/usr/bin/env node
/**
 * Skrypt dodający szablon nawigacji po artykułach w danej kategorii
 */
var bot = require('nodemw'),
	client = new bot('config.js');

var SUMMARY = 'Dodałem nawigację',
	templateName = 'Nawigacja parki i skwery',
	category = 'Parki i skwery';

client.log('Dodaję nawigację "{{%s}}" do stron w kategorii "%s"...', templateName, category);

client.logIn(function(err, data) {
	client.getPagesInCategory(category, function(err, pages) {
		pages && pages.forEach(function(page) {
			// tylko NS_MAIN
			if (page.ns != 0) {
				return;
			}

			client.getArticle(page.title, function(err, content) {
				// dodano już szablon
				if (content.indexOf(templateName) > -1) {
					return;
				}

				var orig = content;

				// dodaj szablon
				content += "\n\n{{" + templateName + "}}";

				client.log('Dodaję nawigację do ' + page.title + '...');

				client.log(client.diff(orig, content));

				// and save it
				client.edit(page.title, content, SUMMARY, function(err, data) {
					if (!err) client.log(page.title + ' zapisany');
				});
			});
		});
	});
});
