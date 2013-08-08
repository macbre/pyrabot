#!/usr/bin/env node
/**
 * Skrypt usuwający strony dyskusji anonów
 */
var bot = require('nodemw'),
	client = new bot('config.js'),
	NS_USER_TALK = 3,
	REASON = 'Usuwanie stron dyskusji anonów';

client.logIn(function() {
	client.api.call({
		action: 'query',
		list: 'allpages',
		aplimit: 750,
		apnamespace: NS_USER_TALK
	}, function(data) {
		var talkPages = data && data.allpages || [];

		talkPages.forEach(function(page) {
			// tylko anoni - Dyskusja użytkownika:79.184.162.254
			if (!/:\d+\./.test(page.title)) {
				return;
			}

			console.log('* ' + page.title);

			client.delete(page.title, REASON, function() {
				console.log('> Usunąłem ' + page.title);
			});
		});
	});
});
