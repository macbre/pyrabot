#!/usr/bin/env nodejs
/**
 * Skrypt usuwający niepodlinkowane obrazy starsze niż X dni
 */
var bot = require('nodemw'),
	client = new bot('config.js');

var SRC = 'Unusedimages',
	DAYS = 30, // usuwaj pliki starsze niż 30 dni
	REASON = 'Usuwam nieużywane obrazy bez kategorii lub opisu';

var now = Date.now();

client.logIn(function(err) {

	client.getQueryPage(SRC, function(err, images) {
		client.log('%s obrazów do sprawdzenia...', images.length);

		images.forEach(function(image, idx) {
			var since = (now - Date.parse(image.timestamp)) / 1000,
				title = image.title;

			//if (idx > 25) return;

			if (since < DAYS * 86400) {
				client.log('%s nie pochodzi sprzed %d dni', title, DAYS);
				return;
			}

			// pobieraj treść stron opisu kolejnych obrazów
			client.getArticle(title, function(err, content) {
				if (!err && typeof content === 'string' && content.trim() === '') {
					client.log('%s nie posiada kategorii lub opisu (upload: %s)', title, image.timestamp);

					// usuń
					client.delete(title, REASON, function(err, res) {
						if (!err) {
							client.log('%s usunięty!', title);
						}
						else {
							client.log('%s nie został usunięty: %s', title, err);
						}
					});
				}
			});
		});
	});
});
