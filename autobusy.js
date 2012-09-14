/**
 * Skrypt tworzący szkice stron o liniach autobusowych na podstawie danych z ZTM
 */
var fs = require('fs'),
	bot = require('../lib/bot').bot,
	client = new bot('config.js');

var SUMMARY = 'Automatyczne tworzenie stron o liniach autobusowych';

var db = JSON.parse(fs.readFileSync('db/petle.json'));

client.logIn(function(data) {

	for (var line in db) {
		// tylko linie autobusowe
		if (line > 40 || line === 'L') {
			(function(line) {
				var petle = db[line],
					nocna = line > 230,
					title = 'Linia autobusowa nr ' + line;

				if (petle.length == 1) {
					petle[1] = petle[0];
				}

				console.log(title + ': ' + JSON.stringify(petle));

				client.getArticle(title, function(content) {
					// strona istnieje
					if (typeof content !== 'undefined') {
						return;
					}

					console.log('Tworzę stronę "' + title + '"...');

					var content = 
"{{Linia autobusowa infobox\n\
|numer=" + line + "\n\
|historyczna=\n\
|wahadłowa=\n\
|nocna=" + (nocna ? "tak" : "") + "\n\
|foto=\n\
|pętla1=" + petle[0] + "\n\
|pętla2=" + petle[1] + "\n\
|dlugosc=\n\
|uruchomiona=\n\
|zlikwidowana=\n\
|wydział=\n\
|historia=\n\
}}\n\
{{Szkic}}"

					//console.log(content);

					// edytuj
					client.edit(title, content, SUMMARY, function() {
						console.log(title + ' założona');
					});
				});
			})(line);
		}
	}
});
