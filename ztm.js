/**
 * Skrypt generujący dane o przystankach końcowych oraz trasach linii tramwajowych i autobusowych
 */
var fs = require('fs'),
	bot = require('nodemw'),
	client = new bot('config.js');

function sortObject(obj) {
	var sorted = {},
		keys = Object.keys(obj);

	keys.sort();

	for (var i=0, len = keys.length; i<len; i++) {
		sorted[keys[i]] = obj[keys[i]];
	}

	return sorted;
}

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
		fs.writeFileSync('db/ztm-ulice.json', JSON.stringify(sortObject(ulice)));
	}

	// przystanki na trasie
	var stops = page.match(czasPrzejazduRegExp);

	if (stops) {
		// liczba przystanków
		linie[line].przystanki = stops.length + 1 /* przystanek początkowy */;

		// czas przejazdu
		var czas = stops.pop().substr(4);
		czas = parseInt(czas, 10);

		if (czas > 0) {
			linie[line].czas = czas;
			console.log('#' + line + ': ' + czas + ' min / ' + (stops.length + 1) + ' przystanków');
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
	czasPrzejazduRegExp = /><b>\d+<\/b>/g,
	strefyRegExp = /<li class=\Szone(\S)/g;

var l, lines = [];

client.fetchUrl('http://www.ztm.poznan.pl/gtfs-ztm/routes_by_name.html.php?dbname=gtfs').then(function(page) {
	var links = page.match(/<a class='[^']+' href='[^']+'/g) || [],
		lines = [];

	links.forEach(function(link) {
		lines.push({
			no: link.match(/route_name=([^&]+)/)[1],
			agency: link.match(/agency_name=([^']+)/)[1]
		});
	});

	//console.log(links); console.log(lines); process.exit(1);

lines.forEach(function(lineData) {
	var line = lineData.no;

	line = parseInt(line, 10) || line;

	// autobusy za tramwaj / linia turystyczna
	if (line[0] == 'T' || line === '0') {
		return;
	}

	var url ='http://www.ztm.poznan.pl/gtfs-ztm/route_directions.html.php?route_name=' + line + '&agency_name=' + lineData.agency;

	// nowe wersje rozkładu (przed zmianami tras)
	url += '&dbname=gtfs';

	console.log("Linia " + line + " (" + lineData.agency + ")");

	client.fetchUrl(url).then(function(page) {
		// pobierz rozkład jazdy -> trasa w obie strony
		var timetableUrl = page.match(timetableRegExp),
			timetableLastUrl = page.match(timetableLastRegExp);
		
		// przygotuj dane linii
		linie[line] = {
			petle: [],
			strefy: [],
			przystanki: false,
			czas: false,
			agency: lineData.agency.replace(/_/g, ' ')
		};

		if (timetableUrl) {
			client.fetchUrl('http://www.ztm.poznan.pl/gtfs-ztm/' + timetableUrl[1] + '&dbname=gtfs').then(function(page) {
				parseTimetable(page, line);
			});
		}

		if (timetableLastUrl) {
			client.fetchUrl('http://www.ztm.poznan.pl/gtfs-ztm/' + timetableLastUrl[1] + '&dbname=gtfs').then(function(page) {
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
		});

		// parsuj strefy taryfowe
		matches = page.match(strefyRegExp) || [];

		matches.forEach(function(match) {
			var strefa = match.substr(-1).toUpperCase();

			if (linie[line].strefy.indexOf(strefa) === -1) {
				linie[line].strefy.push(strefa);
				linie[line].strefy = linie[line].strefy.sort();
			}
		});

		console.log('#' + line + ': ' + JSON.stringify(linie[line]));
		
		// aktualizuj "bazę"
		fs.writeFileSync('db/ztm-linie.json', JSON.stringify(linie));
	});
});
});
