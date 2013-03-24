/**
 * Skrypt dokonujący zamiany tekstu w artykułach podanej kategorii
 */
var bot = require('../lib/bot').bot,
	client = new bot('config.js');

// konfiguracja
/**
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
*
var CATEGORY = 'Kalendarium',
	REGEXP = /<(span|p)[^>]+>|<\/span>|<\/p>/g,
	REPLACEMENT = '',
	SUMMARY = 'Oczyszczanie wikitekstu';
**/
var CATEGORY = 'Kalendarium',
	REGEXP = /^(''')?W roku (.*) w Poznaniu:(''')?/g,
	REPLACEMENT = '{{Kalendarium}}',
	REMOVE = '[[Kategoria:Kalendarium]]',
	SUMMARY = 'Dodaję nagłówek stron kalendarium';
// konfiguracja - koniec

client.logIn(function() {
	var cnt = 0;

	client.getPagesInCategory(CATEGORY, function(pages) {
		pages.forEach(function(page) {
			cnt++;
			console.log(cnt + ') sprawdzam ' + page.title + '...');

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
				if (typeof REMOVE !== 'undefined') {
					content = content.replace(REMOVE, '').trim();
				}

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
