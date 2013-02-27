/**
 * Skrypt generujący dane o przystankach końcowych oraz trasach linii tramwajowych i autobusowych
 */
var fs = require('fs'),
	bot = require('../lib/bot').bot,
	client = new bot('config.js');

function parseTimetable(page, line) {
	var matches = page.match(routeRegExp);

	if (matches) {
		// parsuj trasę + usuń przystanki końcowe
		var streets = matches[1].split(/-|–/).
			slice(1, -1).
			map(function(item) {
				return item.trim();
			});

		console.log('#' + line + ': ' + streets.join(', '));

		streets.forEach(function(street) {
			// ignoruj ronda
			if (street.indexOf('Rondo') > -1) {
				return;
			}

			// rozwiń skróty + małe poprawki
			street = street.
			replace("Al.", 'Aleja').
				replace(/[śŚ]w\./, 'Święty').
				replace('ŚwiętyMarcin', 'Święty Marcin').
				replace('Świety', 'Święty').
				replace('Piasnicka', 'Piaśnicka').
				replace('Os. ', 'Osiedle ');
		
			if (street.indexOf('28 Czerwca') === 0) {
				street = '28 Czerwca 1956 r.';
			}

			if (street === '') {
				return;
			}

			ulice[street] = ulice[street] || [];

			if (ulice[street].indexOf(line) === -1) {
				ulice[street].push(line);

				// sortuj nr linii jako wartości liczbowe
				ulice[street].sort(function(a,b) {
					return (typeof a == "number") ? a - b : 1;
				});
			}
		});

		// aktualizuj "bazę"
		fs.writeFileSync('db/ztm-ulice.json', JSON.stringify(ulice));
	}

	// TODO: przystanki na trasie

	// czas przejazdu
	matches = page.match(czasPrzejazduRegExp);

	if (matches) {
		var czas = matches.pop().substr(4);
		czas = parseInt(czas, 10);

		if (czas > 0) {
			linie[line].czas = czas;
			console.log('#' + line + ': ' + czas + ' min');
		}
	}

	// aktualizuj "bazę"
	fs.writeFileSync('db/ztm-linie.json', JSON.stringify(linie));
}

var linie = {},
 	ulice = {},
	timetableRegExp = /<a href='(timetable.html[^']+)'>/,
	timetableLastRegExp = /\<a href='(timetable.html.php[^']+)'>[^>]+<\/a><\/li><\/ul><\/div>/,
	routeRegExp = /<div id='descriptions'><p>([^<]+)/,
	petleRegExp = />([^<]+)<\/a><\/li><\/ul>/g,
	czasPrzejazduRegExp = /><b>\d+<\/b>/g;

var l, lines = [];

// linie tramwajowe
for (l=1; l<30; l++) {
	lines.push(l);
}
lines.push('N21');

// linie autobusowe (dzienne)
for (l=40; l<=100; l++) {
	lines.push(l);
}

// linie autobusowe (nocne)
for (l=231; l<255; l++) {
	lines.push(l);
}

// dodatkowe linie
lines.push('L');

lines.forEach(function(line) {
	var url ='http://193.218.154.93/dbServices/gtfs-ztm/route_directions.html.php?route_name=' + line + '&agency_name=ZTM_MPK';

	// nowe wersje rozkładu (przed zmianami tras)
	url += '&dbname=gtfs';

	client.fetchUrl(url).then(function(page) {
		// pobierz rozkład jazdy -> trasa w obie strony
		var timetableUrl = page.match(timetableRegExp),
			timetableLastUrl = page.match(timetableLastRegExp);
		
		// przygotuj dane linii
		linie[line] = {
			petle: [],
			przystanki: [],
			czas: false
		};

		if (timetableUrl) {
			client.fetchUrl('http://193.218.154.93/dbServices/gtfs-ztm/' + timetableUrl[1]).then(function(page) {
				parseTimetable(page, line);
			});
		}

		if (timetableLastUrl) {
			client.fetchUrl('http://193.218.154.93/dbServices/gtfs-ztm/' + timetableLastUrl[1]).then(function(page) {
				parseTimetable(page, line);
			});
		}

		// parsuj pętle
		var matches = page.match(petleRegExp) || []

		matches.forEach(function(match) {
			var stop = match.substr(1, match.length - 15).trim();

			// strefy taryfowe
			stop = stop.replace('(B)', '');

			// ucfirst()
			stop = stop[0] + stop.substring(1).toLowerCase();

			// porządki
			stop = stop.
				trim().
				replace("Os. sobieskiego", "Osiedle Jana III Sobieskiego").
				replace(/pl\. /i, "Plac ").
				replace(/os\. /i, "Osiedle ").
				replace('Os.wichrowe', 'Osiedle Wichrowe').
				replace("os.", "Osiedle ").
				// os. batorego ii -> os. batorego II
				replace(/\si+$/g, function(match) {
					return match.toUpperCase();
				});

			// ucfirst()
			stop = stop.replace(/[\s|\/][\w\W]/g, function(match) {
				return match.toUpperCase()
			});

			// końcówki
			linie[line].petle.push(stop);

			console.log('#' + line + ': ' + stop);
		});
		
		// aktualizuj "bazę"
		fs.writeFileSync('db/ztm-linie.json', JSON.stringify(linie));
	});
});
