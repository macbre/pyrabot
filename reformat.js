#!/usr/bin/env node
/**
 * Skrypt porządkujący wikitekst artykułu
 */

var bot = require('nodemw'),
	jsdiff = require('diff'),
	querystring = require('querystring'),
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

		var orig = content,
			linksAdded = false;

		client.log('Cleaning up the wikitext...');

		// usuń twarde space UTF
		content = decodeURIComponent(
			encodeURIComponent(content).replace(/%C2%A0/g, ' ')
		);

		content = content.
			// pogrubienia -> nagłówki
			replace(/\n<strong>([^<]+)<\/strong>\n/g, "\n== $1 ==\n").
			replace(/\n'''([^<\n]+)'''\n/g, "\n== $1 ==\n").
			// usuń niepotrzebne tagi
			replace(/<\/?strong>/g, "'''").
			replace(/<strong>([.,\s]+)<\/strong>/g, '$1').
			replace(/(\'+)([\.\s]+)$1/g, '$2').
			replace(/<\/?(em|strong|p|span)( (class|style)="[^>]*)?>/g, '').
			// znaki
			replace('…', '').
			replace("''' '''", '').
			// autolinkowanie lat
			replace(/(\d{3,4}) (r\.|rok)/g, '[[$1]] $2').
			replace(/(roku) (\d{3,4})/g, '$1 [[$2]]').
			replace(/(latach) (\d{3,4})-(\d{3,4})/g, '$1 [[$2]]-[[$3]]').
			// linki wewnątrz wiki
			// [http://poznan.wikia.com/wiki/Ulica_Andrzeja_i_W%C5%82adys%C5%82awa_Niegolewskich ulicą Niegolewskich] 
			replace(/\[http:\/\/poznan.wikia.com\/wiki\/([^\s]+) ([^\]]+)\]/g, function(match, page, content) {
				page = querystring.unescape(page.replace(/_/g, ' '));
				page = page.split('?')[0]; // remove the query string
				content = content.trim();

				client.log('Adding an internal link to "' + page + '"');

				linksAdded = true;

				if (content != page) {
					// [[foo|bar]]
					return '[[' + page + '|' + content + ']]';
				}
				else {
					// [[foo]]
					return '[[' + page + ']]';
				}
			}).
			// miniaturki -> 300px
			// |thumb|220x220px|
			replace(/\|thumb\|[\dx]+px\|/g, '|thumb|300px|').
			// wielokrotne spacje
			replace(/([ ]+)/g, ' ').
			// spacje na końcu wierszy
			replace(/ +\n/g, "\n").
			// wielokrotne nowe linie
			replace(/\n\n\n+/g, "\n").
			trim();

		client.log('Generating the diff...'); //console.log(content); return;

		console.log(diff(orig, content)); //return;

		// zapisz zmiany
		if (linksAdded) {
			REASON += ' + linkowanie';
		}

		client.edit(PAGE, content, REASON, function(err) {
			if (err) {
				console.error(err);
			}
			else {
				console.log('# Poprawiłem '+ PAGE);
			}
		});
	});
});
