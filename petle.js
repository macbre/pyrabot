/**
 * Skrypt generujący dane o przystankach końcowych linii tramwajowych i autobusowych
 */
var http = require('http'),
	fs = require('fs');

var routes = {},
    re = />([^<]+)<\/a><\/li><\/ul>/g;

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
	},
	page = '';
	
	http.get(url, function(res) {
		res.on("data", function(chunk) {
			page += chunk;
		});

		res.on('end', function() {
			var matches = page.match(re) || []

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
				routes[line] = routes[line] || [];
				routes[line].push(stop);

				console.log('#' + line + ': ' + stop);

				// katualizuj "bazę"
				fs.writeFileSync('db/petle.json', JSON.stringify(routes));
			});
		});
	}).on('error', function(e) {
		console.log(e);
	});

});
