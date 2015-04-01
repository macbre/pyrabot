#!/usr/bin/env node
/**
 * Skrypt porządkujący wikitekst artykułu
 */

var bot = require('nodemw'),
	jsdiff = require('diff'),
	client = new bot('config.js');

var REASON = 'Porządkuję wikitekst',
	PAGE = process.argv[2];

if (!PAGE) {
	console.log('Podaj tytuł artykułu');
	process.exit(1);
}

function diff(one, other) {
	var diff = jsdiff.diffChars(one, other),
		res = '';

	diff.forEach(function(part){
		// green for additions, red for deletions 
		// grey for common parts 
		var color = part.added ? 'green' :
		part.removed ? 'red' : 'grey';
		res += part.value[color];
	});

	return res;
}

client.log('Artykuł: ' + PAGE);

client.logIn(function() {
	client.getArticle(PAGE, function(err, content) {
		if (err) return;

		var orig = content;

		content = content.
			// pogrubienia -> nagłówki
			replace(/\n<strong>([^<]+)<\/strong>\n/g, "\n== $1 ==\n").
			replace(/\n'''([^<]+)'''\n/g, "\n== $1 ==\n").
			// usuń niepotrzebne tagi
			replace(/<\/?(em)>/g, '').
			replace(/<strong>([.,\s]+)<\/strong>/g, '$1').
			// znaki
			replace('…', '').
			// autolinkowanie lat
			replace(/(\d{3,4}) (r\.|rok)/g, '[[$1]] $2').
			// wielokrotne spacje
			replace(/[\x20]{2,}/g, ' ').
			// spacje na końcu wierszy
			replace(/ +\n/g, "\n").
			trim();

		console.log(diff(orig, content)); //return;

		// zapisz zmiany
		client.edit(PAGE, content, REASON, function() {
			console.log('# Poprawiłem '+ PAGE);
		});
	});
});
