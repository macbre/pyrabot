var fs = require('fs');

var bot = require('../lib/bot').bot,
	client = new bot('config.js');

var db = JSON.parse(fs.readFileSync('db/ulice-ztm.json'));

client.logIn(function(data) {
	client.getPagesInCategory('Ulice', function(pages) {
		pages && pages.forEach(function(page) {
			// ignore pages outside main namespace
			if (page.ns != 0) {
				return;
			}

			// sprawdź bazę ulic
			var lines;
			for (var street in db) {
				if (page.title.indexOf(street) > 0) {
					lines = db[street];
				}
			}

			if (typeof lines !== 'undefined') {
				var tramLines = [],
		      			busLines = [];

				lines.forEach(function(line) {
					(line > 40 ? busLines : tramLines).push(line);
				});

				console.log(page.title + ': ' + JSON.stringify({tram: tramLines, bus: busLines}));
			}
		});
	});
});
