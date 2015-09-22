#!/usr/bin/env node
/**
 * Skrypt odświeżający strony w podanej kategorii
 */
var bot = require('nodemw'),
	client = new bot('config.js');

var CATEGORY = process.argv[2] || '';

if (CATEGORY === '') {
	console.log('Podaj nazwę kategorii');
	process.exit(1);
}

client.log('Purdżuję artykuły w kategorii "%s"...', CATEGORY);

client.getPagesInCategory(CATEGORY, function(err, pages) {
	if (err) return;

	var pageIds = pages.
		filter(function(page) {
			return page.ns === 0; // NS_MAIN
		}).
		map(function(page) {
			return page.pageid;
		});

	client.purge(pageIds, function(err, pages) {
		if (err) client.log(err);
		client.log('Pages purged: %d', pages.length);
	});
});

