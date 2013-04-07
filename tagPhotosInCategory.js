/**
 * Skrypt kategoryzujący zdjęcia umieszczone w artykułach w podanej kategorii
 */

var bot = require('nodemw'),
	client = new bot('config.js');

var CATEGORY = 'Muzeum Uzbrojenia',
    	CATEGORIES = [
		'Muzeum Uzbrojenia',
		'Cytadela'
		//'%ARTICLENAME%'
	],
    	SUMMARY = 'Kategoryzowanie zdjęć umieszczonych w artykułach w kategorii ' + CATEGORY;

client.logIn(function() {
	client.getPagesInCategory(CATEGORY, function(pages) {
		pages.forEach(function(page) {
			if (page.ns !== 0) return;

			client.getImagesFromArticle(page.title, function(images) {
				images.forEach(function(image) {
					client.getArticle(image.title, function(content) {
						if (content !== '') return;

						content = '';

						// kategorie
						CATEGORIES.forEach(function(category) {
							category = category.
								replace('%ARTICLENAME%', page.title);

							content += '[[Kategoria:' + category + ']]\n';
						});

						console.log([page.title, image.title, content]);

						client.edit(image.title, content, SUMMARY, function() {
							console.log(image.title + ' otagowany!');
						});
					});
				});
			});
		});
	});
});
