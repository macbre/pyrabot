#!/usr/bin/env node
/**
 * Skrypt portujący strony w podanej kategorii do infoboksów
 */
var bot = require('nodemw'),
	client = new bot('config.js');

var CATEGORY = 'Pomniki',
	TEMPLATE_REGEX = /{{Pomnik|Kategoria:Listy/,
	SUMMARY = 'Dodaję infobox do stron w kategorii ' + CATEGORY;

function extractFromWikitext(arg, regexp) {
	var match = arg.wikitext.match(regexp);

	if (match) {
		arg.wikitext = arg.wikitext.replace(match[0], '');
		return match.pop();
	}
	else {
		return false;
	}
}

client.logIn(function() {
	client.getPagesInCategory(CATEGORY, function(err, pages) {
		pages.forEach(function(page) {
			if (page.ns !== 0) return; // tylko NS_MAIN

			client.getArticle(page.title, function(err, content) {
				var orig = content,
					infobox = [],
					params = {};

				// infobox już użyty na tej stronie
				if (TEMPLATE_REGEX.test(content)) {
					return;
				}

				client.log('> %s', page.title);

				// pobierz parametry infoboxa
				var arg = {wikitext: content};

				var mapa = extractFromWikitext(arg, /<place.*>/),
					foto = extractFromWikitext(arg, /\[\[\Plik:([^\]\|]+)[^\n]+/);

				// usuń kategorie
				content = arg.wikitext;
				content = content.replace('[[Kategoria:' + CATEGORY + ']]', '');

				// zbuduj wikitekst
				params = {
					mapa: mapa,
					foto: foto,
					patron: false,
					'odsłonięcie': false,
					'projektant': false,
					'zniszczenie': false
				};

				infobox.push('{{Pomnik infobox');

				Object.keys(params).forEach(function(key) {
					infobox.push('|' + key + ' = ' + (params[key] || ''));
				});

				infobox.push('}}');

				// dodaj infobox
				content = infobox.join("\n") + "\n" + content.trim();

				// zapisz zmianę
				console.log(client.diff(orig, content));

				client.edit(page.title, content, SUMMARY, function(err) {
					if (err) return;
					client.log(page.title + ' zmieniony!');
				});
			});
		});
	});
});
