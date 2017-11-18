#!/usr/bin/env node
/**
 * Skrypt tworzący szkice stron o parkach i skwerach
 */
var fs = require('fs'),
	bot = require('nodemw'),
	client = new bot('config.js'),
	utils = require('./utils');

var SUMMARY = 'Szkic strony',
	YEAR = '2017',
	SKWER_PARK = process.argv[2] || '';

if (SKWER_PARK === '') {
	console.log('Podaj nazwę parku lub skweru');
	process.exit(1);
}

client.logIn((err, data) => {

	client.getArticle(SKWER_PARK, (err, content) => {
		// strona istnieje
		if (typeof content !== 'undefined') {
			throw 'Artykuł juz istnieje';
		}

		// Geo data
		const query = `${SKWER_PARK}, Poznań`;

		utils.osmSearch(client, query, (err, data) => {
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

			var content = `{{Park infobox
|nazwa_parku=${SKWER_PARK}
|mapa_park=<place lat="${place.lat}" lon="${place.lon}" width="300" zoom=14 />
|patron=
|patron_wikipedia=
|dzielnica=${place.address.suburb}
|rok=
|powierzchnia=
|projektant=
}}
'''${SKWER_PARK}'''

== Historia ==
{{Rozwiń Sekcję}}

== Źródła ==
<references />

{{Nawigacja parki i skwery}}`;

			content = content.replace(/=\s?,\s?/g, '=');
			//content = content.replace(/, ?\n*/g, '\n');

			if (SKWER_PARK.match(/^Skwer/)) {
				content += "\n\n[[Kategoria:Skwery]]";
			}

			client.log(content);

			// edytuj
			client.edit(SKWER_PARK, content, SUMMARY, (err) => {
				if (err) {
					throw err;
				}

				console.log(SKWER_PARK + ' założona');
			});
		});
	});
});
