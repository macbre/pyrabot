/**
 * Skrypt generujący dane o przystankach końcowych linii tramwajowych
 */
var http = require('http'),
	fs = require('fs');

var routes = {},
    re = />([^<]+)<\/a><\/li><\/ul>/g;

for (var l=1; l < 30; l++) {
	(function(line) {
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
					var stop = match.substr(1, match.length - 15);

					// ucfirst()
					stop = stop[0] + stop.substring(1).toLowerCase();

					// porządki
					stop = stop.
						replace("Os. sobieskiego", "Osiedle Jana III Sobieskiego").
						replace("Zajezdnia głogowska", "Zajezdnia Głogowska");

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

	})(l);
}
