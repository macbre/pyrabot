/**
 * Skrypt dokonujący zamiany tekstu w artykułach podanej kategorii
 */
var bot = require('nodemw'),
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
**
var CATEGORY = 'Inicjatywy obywatelskie',
	REGEXP = /<(span|p)[^>]+>|<\/span>|<\/p>/g,
	REPLACEMENT = '',
	SUMMARY = 'Oczyszczanie wikitekstu';
/**
var CATEGORY = 'Kalendarium',
	REGEXP = /(''')?W roku [^\n]+ w Poznaniu:(''')?/g,
	REPLACEMENT = '{{Kalendarium}}',
	REMOVE = '[[Kategoria:Kalendarium]]',
	SUMMARY = 'Dodaję nagłówek stron kalendarium';
/**
var CATEGORY = 'Kalendarium',
	REGEXP = '[[Kategoria:Wydarzenia]]',
	REPLACEMENT = '',
	SUMMARY = 'Kalendarium - porządki w kategoriach';
/**
// [http://pl.wikipedia.org/wiki/Genesis_(grupa_muzyczna) Genesis] -> [[wikipedia:pl:Genesis_(grupa_muzyczna)|Genesis]]
var CATEGORY = 'Kalendarium',
	REGEXP = /\[http:\/\/pl.wikipedia.org\/wiki\/([^\s]+) ([^\]]+)\]/g,
	REPLACEMENT = '[[wikipedia:pl:$1|$2]]',
	SUMMARY = 'Interwiki do Wikipedii';
**
var CATEGORY = 'Ul. Wroniecka',
    	REGEXP = '[[Kategoria:' + CATEGORY + ']]',
	REPLACEMENT = '[[Ulica Wroniecka]]',
	SUMMARY = 'Unifikacja nazewnictwa kategorii';
**
var CATEGORY = 'Linie autobusowe',
    	REGEXP = /$/,
	REPLACEMENT = '\n\n{{Nawigacja Linie autobusowe}}',
	SUMMARY = 'Dodaję nawigację po liniach autobusowych';
**/
var CATEGORY = 'Dzień po dniu',
    	REGEXP = /'''W dniu [^']+'''/,
	REPLACEMENT = function(page, content) { //console.log(arguments);
		var months = {
				'stycznia': 1,
				'lutego': 2,
				'marca': 3,
				'kwietnia': 4,
				'maja': 5,
				'czerwca': 6,
				'lipca': 7,
				'sierpnia': 8,
				'września': 9,
				'października': 10,
				'listopada': 11,
				'grudnia': 12
			},
			header = '{{Dzień po dniu|$1}}';

		// wytnij nagłówek i kategorie
		content = content.
			replace(REGEXP, '').
			replace(/\[\[Kategoria:Dzień po d[^\]]+\]\]/, '').
			trim();

		var month, day,
			titleParts = page.title.split(' ');

		// parsuj datę
		day = parseInt(titleParts[0], 10);
		month = months[ titleParts[1] ];

		if (typeof month === 'undefined') {
			process.exit(1);
		}

		// dodaj nagłówek z datą
		content = header.replace('$1', (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day)) +
			"\n\n" + content;

		return content;
	},
	SUMMARY = 'Dodaję nawigację po kalendarium';

// konfiguracja - koniec

client.logIn(function() {
	var cnt = 0;

	client.getPagesInCategory(CATEGORY, function(pages) {
		pages.forEach(function(page) {
			cnt++;
			console.log(cnt + ') sprawdzam ' + page.title + '...');

			client.getArticle(page.title, function(content) {
				if (typeof REGEXP === 'string') {
					// docelowy tekst znajduje się już w artykule
					if (typeof REPLACEMENT === 'string' &&  REPLACEMENT !== '' && content.indexOf(REPLACEMENT) > -1) {
						console.log(page.title + ' - pomijam');
						return;
					}
				}
				else {
					// regexp nie "matchuje" artykułu lub docelowy tekst znajduje się już w artykule
					if (!REGEXP.test(content) || (typeof REPLACEMENT === 'string' && content.indexOf(REPLACEMENT) > -1)) {
						console.log(page.title + ' - pomijam');
						return;
					}
				}

				console.log("\n\n");
				console.log(page.title + ':');
				console.log(content.substr(0,750) + '...');
				console.log('---');

				// dokonaj zmiany
				if (typeof REPLACEMENT === 'function') {
					content = REPLACEMENT(page, content);
				}
				else {
					content = content.replace(REGEXP, REPLACEMENT);
				}

				// usuń string
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
