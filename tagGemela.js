#!/usr/bin/env node
/**
 * Skrypt oznaczający długie artykuły bez podziału na sekcje
 */

var bot = require('nodemw'),
	client = new bot('config.js');

var MIN_LENGTH = 2500,
	CHECK = /\n\=\=/,
	MARKER = '{{Gemela}}',
	REASON = 'Oznaczam artykuły do uporządkowania';

client.logIn(function() {
	client.getQueryPage('Longpages', function(pages) {
		pages.forEach(function(page) {
			// pomijaj krótsze strony i spoza NS_MAIN
			if ((page.value < MIN_LENGTH) || (page.ns !== 0)) {
				return;
			}

			console.log('> Sprawdzam ' + page.title + '...');

			client.getArticle(page.title, function(content) {
				// artykuł posiada sekcje lub został już oznaczony
				if (CHECK.test(content)) {
					return;
				}

				if (content.toLowerCase().indexOf(MARKER.toLowerCase()) > -1) {
					console.log('# ' + page.title + ' został już oznaczony!');
					return;
				}

				console.log('# Oznaczam ' + page.title + '...');
				console.log(content.substr(0, 1500));

				content = MARKER + "\n\n" + content;

				client.edit(page.title, content, REASON, function() {
					console.log('# Oznaczyłem '+ page.title);
				});
			});
		});
	});
});
