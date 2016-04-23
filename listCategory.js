#!/usr/bin/env node
/**
 * Skrypt generujący listę artykułów w kategorii
 */
'use strict';

var bot = require('nodemw'),
	client = new bot('config.js'),
	CATEGORY = process.argv[2];

client.getPagesInCategory(CATEGORY, (err, pages) => {
	const wikitext = pages.
		// tylko strony w NS_MAIN
		filter((page) => page.ns === 0).
		// linkuj
		map((page) => `[[${page.title}]]`).
		// sortuj
		sort().
		join(" &bull;\n");

	console.log(wikitext);
});
