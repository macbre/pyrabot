#!/usr/bin/env node
/**
 * Skrypt porządkujący wikitekst ostatnio edytowanych artykułów
 *
 * - usuwanie tagów <strong> i </strong>
 */

var bot = require('nodemw'),
	client = new bot('config.js');

var REASON = 'Porządkuję wikitekst artykułu',
	REPLACE = /<strong>|<\/strong>/ig,
	pages = {};

client.logIn(function() {
	client.getRecentChanges(false, function(pages) {
		pages.forEach(function(page) {
			// tylko NS_MAIN
			if (page.ns !== 0) {
				return;
			}

			// nie sprawdzaj dwa razy tego samego artykułu
			if (pages[page.title] === true) {
				return;
			}
			pages[page.title] = true;

			console.log('> Sprawdzam ' + page.title + '...');

			client.getArticle(page.title, function(content) {
				// zmień treść
				var newContent = content.replace(REPLACE, '');

				// bez zmian?
				if (newContent === content) {
					return;
				}

				console.log('# Poprawiam ' + page.title + '...');

				console.log(newContent);

				// zapisz zmiany
				client.edit(page.title, newContent, REASON, function() {
					console.log('# Poprawiłem '+ page.title);
				});
			});
		});
	});
});
