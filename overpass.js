#!/usr/bin/env node
/**

[out:json]
[timeout:25]
;
area(3600165941)->.searchArea;
(
  node
    ["leisure"="park"]
    (area.searchArea);
  way
    ["leisure"="park"]
    (area.searchArea);
  relation
    ["leisure"="park"]
    (area.searchArea);
);
out body;
>;
out skel qt;

**/
'use strict';

var request = require('request'),
	tag = process.argv[2]; // e.g. leisure=park / historic=monument

console.log('Checking overpass API for "%s"', tag);

let query = `[out:json]
[timeout:25]
;
area(3600165941)->.searchArea;
(
  node
    [${tag}]
    (area.searchArea);
  way
    [${tag}]
    (area.searchArea);
  relation
    [${tag}]
    (area.searchArea);
);
out body;
>;
out skel qt;`

//console.log(query);

request.get({
	uri: "http://overpass.osm.rambler.ru/cgi/interpreter",
	qs: {
		data: query
	}
}, (err, resp, body) => {
	if (err) {
		throw err;
	}

	const data = JSON.parse(body),
		nodes = data.elements.
			// element z tagami
			filter((element) => typeof element.tags !== 'undefined').
			// tylko tagi
			map((element) => element.tags).
			// tylko tagi z nazwami
			filter((tag) => typeof tag.name !== 'undefined').
			map((tag) => tag.name).
			// sortuj
			sort();

	const wikitext = nodes.
		// linkuj
		map((node) => `* [[${node}]]`).
		join("\n");

	//console.log(data);
	console.log(wikitext);
});

