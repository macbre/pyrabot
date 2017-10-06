#!/usr/bin/env node
/**
 * Skrypt tworzący szkice stron o ulicach
 */
var fs = require('fs'),
	bot = require('nodemw'),
	client = new bot('config.js');

var SUMMARY = 'Szkic strony',
	YEAR = '2017',
	ULICA = process.argv[2] || '';

if (ULICA === '') {
	console.log('Podaj nazwę ulicy');
	process.exit(1);
}

function osmSearch(query, callback) {
	client.log('osmSearch: query', query);

	// e.g. https://nominatim.openstreetmap.org/search.php?q=Tony+Halika%2C+Pozna%C5%84&format=json&addressdetails=1
	const url = 'https://nominatim.openstreetmap.org/search.php?format=json&q=' + encodeURIComponent(query);

	client.fetchUrl(url, (err, res) => {
		if (err) {
			callback(err, res);
		}

		try {
			const data = JSON.parse(res);
			callback(null, data);
		} catch (e) {
			callback(e, null);
		}
	});
}

client.logIn((err, data) => {

	client.getArticle(ULICA, (err, content) => {
		// strona istnieje
		if (typeof content !== 'undefined') {
			throw 'Artykuł juz istnieje';
		}

		// Geo data
		const query = `${ULICA}, Poznań`;

		osmSearch(query, (err, data) => {
			if (err) {
				console.log(data);
				throw err;
			}

			if (!data || !data[0]) {
				throw 'Address not found';
			}

			var place = data[0];
			client.log(place);

			place.address.postcode = place.address.postcode || '';
			place.address.suburb = place.address.suburb || '';
			place.address.neighbourhood = place.address.neighbourhood || '';

			/**
			{ place_id: '196302900',
			  licence: 'Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
			  osm_type: 'way',
			  osm_id: '441844276',
			  boundingbox: [ '52.3933304', '52.3936783', '16.9577746', '16.9580225' ],
			  lat: '52.3934741',
			  lon: '16.9578421',
			  display_name: 'Anny Jantar, Łacina, Rataje, Poznań, wielkopolskie, 61-206, Polska',
			  class: 'highway',
			  type: 'residential',
			  importance: 0.41,
			  address:
			   { road: 'Anny Jantar',
			     neighbourhood: 'Łacina',
			     suburb: 'Rataje',
			     city: 'Poznań',
			     county: 'Poznań',
			     state: 'wielkopolskie',
			     postcode: '61-206',
			     country: 'Polska',
			     country_code: 'pl' } }
			**/

			var content = `{{Ulica infobox
|nazwa_ulicy=${ULICA}
|mapa_ulica=<place lat="${place.lat}" lon="${place.lon}" width="300" zoom=14 />
|patron=
|patron_wikipedia=
|długość=
|dzielnice=${place.address.neighbourhood}, ${place.address.suburb}
|rok=[[${YEAR}]]
|numery=
|najwyższy_budynek=
|kody=${place.address.postcode}
|przystanki_autobusowe=
|przystanki_tramwajowe=
}}
'''${ULICA}'''

== Historia ==
{{Rozwiń Sekcję}}

{{Przy ulicy}}

== Źródła ==
<references />`;

			content = content.replace(/=\s?,\s?/g, '=');
			//content = content.replace(/, ?\n*/g, '\n');

			client.log(content);

			// edytuj
			client.edit(ULICA, content, SUMMARY, (err) => {
				if (err) {
					throw err;
				}

				console.log(ULICA + ' założona');
			});
		});
	});
});
