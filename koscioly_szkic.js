/**
 * Skrypt tworzący szkice stron o poznańskich świątyniach
 */
var fs = require('fs'),
	bot = require('../lib/bot').bot,
	client = new bot('config.js');

var SUMMARY = 'Automatyczne tworzenie stron o poznańskich świątyniach';

var db = JSON.parse(fs.readFileSync('db/koscioly.json'));

client.logIn(function(data) {
	db.forEach(function(kosciol) {
		var title = kosciol.nazwa;

		client.getArticle(title, function(content) {
			// strona istnieje
			if (typeof content !== 'undefined') {
				return;
			}

			console.log('Tworzę stronę "' + title + '"...');
			console.log(JSON.stringify(kosciol));

			var content = "{{Kościół infobox\n",
			params = {
				kościół: title,
				foto: kosciol.foto ? ('Plik:' +  kosciol.foto) : undefined,
				zbudowany: kosciol.zbudowany,
				konsekrowany: kosciol.konsekrowany,
				zburzony: undefined,
				link: kosciol.link
			};

			for (var key in params) {
				content += '|' + key + ' = ' + (params[key] || '') + "\n";
			}

			content += "}}\n{{Szkic}}";

			// mapka
			if (kosciol.lat) {
				content += '\n<place lat="' + kosciol.lat + '" lon="' + kosciol.lon + '" width="300" zoom="15" />';
			}

			// nawigacja
			content += "\n{{Nawigacja Kościoły}}";

			// kategorie
			if (kosciol.wiek) {
				content += "\n[[Kategoria:" + kosciol.wiek + " wiek]]";
			}

			console.log(content);

			// edytuj
			client.edit(title, content, SUMMARY, function() {
				console.log(title + ' założona');
			});
		});
	});
});
