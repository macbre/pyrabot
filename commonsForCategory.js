#!/usr/bin/env node
/**
 * Skrypt importujący obrazki z Commons dla podanej kategorii
 */

var bot = require('nodemw'),
	client = new bot('config.js'),
	commons = new bot({
		server: 'commons.wikimedia.org',
		path: '/w'
	});

var CATEGORY = process.argv[2] || 'Linie autobusowe',
	SUMMARY = 'Import pliku z Wikimedia Commons';

client.log('Wyszukiwanie plików z Wikimedia Commons do importu w kategorii "%s"', CATEGORY);

client.logIn(function() {
	client.getPagesInCategory(CATEGORY, function(pages) {
		pages.forEach(function(page) {
			if (page.ns !== 0) return;

			// @see http://poznan.wikia.com/api.php?action=query&generator=images&titles=Linia_autobusowa_nr_62%7CLinia_autobusowa_nr_237&prop=info
			client.api.call({
				action: 'query',
				generator: 'images',
				titles: page.title
			}, function(res) {
				var images = res && res.pages;

				if (!images || images.length === 0) return;

				Object.keys(images).forEach(function(id) {
					var image = images[id],
						imageTitle = '';

					if (typeof image.missing !== 'undefined') {
						imageTitle = image.title.split(':').slice(1).join(':'); // usun prefix z namespacem

						client.log('%s: "%s"', page.title, imageTitle);

						// pobierz URL do "pełnej" wersji obrazka
						commons.getImageInfo("File:" + imageTitle, function(res) {
							if (!res) return;

							var url = res.url,
								params;

							params = {
								comment: SUMMARY,
								text: '{{Wikimedia}}'
							};

							client.log('Import pliku <%s> z Wikimedia Commons...', imageTitle);

							// dodaj zdjęcia
							client.uploadByUrl(imageTitle, url, params, function(res) {
								client.log('Upload pliku <%s> zakończony', imageTitle);
							});
						});
					}
				});

			});
		});
	});
});
