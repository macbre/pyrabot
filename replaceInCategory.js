/**
 * Skrypt dokonujący zamiany tekstu w artykułach podanej kategorii
 */
var fs = require('fs'),
	bot = require('../lib/bot').bot,
	client = new bot('config.js');

// konfiguracja
/**/
var CATEGORY = 'Linie tramwajowe',
    	REGEXP = /(foto=\[\[Plik:[^\|]+)\|thumb/,
	REPLACEMENT = '$1',
	SUMMARY = 'Korekta stylu zdjęć w infoboxach';
/**
var CATEGORY = 'Linie tramwajowe',
    	REGEXP = /29\dpx\]\]/,
	REPLACEMENT = '300px]]',
	SUMMARY = 'Korekta rozmiaru zdjęć w infoboxach';

var wiek = 'XIV';

var CATEGORY = 'Wiek ' + wiek,
    	REGEXP = '[[Kategoria:Wiek ' + wiek +']]',
	REPLACEMENT = '[[Kategoria:' + wiek + ' wiek]]',
	SUMMARY = 'Unifikacja nazewnictwa kategorii ze stuleciami (' + wiek + ' wiek)';
**/
/**
var CATEGORY = 'Poznańskie Autobusy',
	REGEXP = '[[Kategoria:Poznańskie Autobusy]]',
	REPLACEMENT = '[[Kategoria:Transport publiczny]]\n[[Kategoria:Autobus]]\n[[Kategoria:Tabor]]',
	SUMMARY = 'Unifikacja nazewnictwa kategorii';
/**
var CATEGORY = 'Osoby',
	REGEXP = / \(ur\.[^\)]+zm\.[^\)]+\) /,
	REPLACEMENT = ' ',
	SUMMARY = 'Przeniesienie danych biograficznych do infoboxa';
*/
var CATEGORY = 'Kalendarium',
	REGEXP = /<(span|p)[^>]+>|<\/span>|<\/p>/g,
	REPLACEMENT = '',
	SUMMARY = 'Oczyszczanie wikitekstu';
// konfiguracja - koniec

client.logIn(function() {
	client.getPagesInCategory(CATEGORY, function(pages) {
		pages.forEach(function(page) {
			console.log('Sprawdzam ' + page.title + '...');

			client.getArticle(page.title, function(content) {
				if (typeof REGEXP === 'string') {
					if (content.indexOf(REPLACEMENT) > -1) {
						console.log(page.title + ' - pomijam');
						return;
					}
				}
				else {
					if (!REGEXP.test(content)) {
						console.log(page.title + ' - pomijam');
						return;
					}
				}

				console.log("\n\n");
				console.log(page.title + ':');
				console.log(content.substr(0,750) + '...');
				console.log('---');

				// dokonaj zmiany
				content = content.replace(REGEXP, REPLACEMENT);

				console.log(content.substr(0,750) + '...');

				//return; // !!!!!!!!

				// zapisz zmianę
				client.edit(page.title, content, SUMMARY, function() {
					console.log(page.title + ' zmieniony!');
				});
			});
		});
	});
});
