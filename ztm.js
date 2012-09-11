/**
 * Skrypt generujący dane o przystankach końcowych oraz trasach linii tramwajowych i autobusowych
 */
var http = require('http'),
	fs = require('fs');

// TODO: przenieść do klasy bota
function getPage(url, callback) {
	var page = '';

	http.get(url, function(resp) {
		resp.on("data", function(chunk) {
			page += chunk;
		});

		resp.on('end', function() {
			if (typeof callback === 'function') {
				callback(page);
			}
		});
	}).on('error', function(e) {
		console.log(e);
	});
}

var petle = {},
 	ulice = {},
	timetableRegExp = /<a href='(timetable.html[^']+)'>/,
	routeRegExp = /<div id='descriptions'><p>([^<]+)/,
	petleRegExp = />([^<]+)<\/a><\/li><\/ul>/g;

var l, lines = [];

// linie tramwajowe
for (l=1; l<30; l++) {
	lines.push(l);
}
lines.push('N21');

// linie autobusowe (dzienne)
for (l=40; l<100; l++) {
	lines.push(l);
}

// linie autobusowe (nocne)
for (l=231; l<255; l++) {
	lines.push(l);
}

lines.forEach(function(line) {
	var url = {
		host: '193.218.154.93',
		path: '/dbServices/gtfs-ztm/route_directions.html.php?route_name=' + line + '&agency_name=ZTM_MPK'
	};

	getPage(url, function(page) {
		// pobierz rozkład jazdy -> trasa
		var timetableUrl = page.match(timetableRegExp);

		// TODO: parsowanie trasy w obie strony (np. linia 5)
		if (timetableUrl) {
			getPage({
				host: '193.218.154.93',
				path: '/dbServices/gtfs-ztm/' + timetableUrl[1]
			}, function(page) {
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
							replace(/Al\./, 'Aleja').
							replace(/[śŚ]w\./, 'Święty').
							replace('Piasnicka', 'Piaśnicka');

						ulice[street] = ulice[street] || [];
						ulice[street].push(line);
					});

					// katualizuj "bazę"
					fs.writeFileSync('db/ulice-ztm.json', JSON.stringify(ulice));
				}
			});
		}

		// parsuj pętle
		var matches = page.match(petleRegExp) || []

		matches.forEach(function(match) {
			var stop = match.substr(1, match.length - 15).trim();

			// ucfirst()
			stop = stop[0] + stop.substring(1).toLowerCase();

			// porządki
			stop = stop.
				trim().
				replace("Os. sobieskiego", "Osiedle Jana III Sobieskiego").
				replace(/pl\. /i, "Plac ").
				replace(/os\. /i, "Osiedle ").
				replace("os.", "Osiedle ").
				// os. batorego ii -> os. batorego II
				replace(/\si+$/g, function(match) {
					return match.toUpperCase();
				});

			// ucfirst()
			stop = stop.replace(/[\s|\/][\w\W]/g, function(match) {
				return match.toUpperCase()
			});

			// dodaj pętle do danych linii
			petle[line] = petle[line] || [];
			petle[line].push(stop);

			console.log('#' + line + ': ' + stop);
		});
		
		// katualizuj "bazę"
		fs.writeFileSync('db/petle.json', JSON.stringify(petle));
	});
});
