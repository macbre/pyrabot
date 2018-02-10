function osmSearch(client, query, callback) {
	client.log('osmSearch: query', query);
	query = query.replace(/^Ulica\s/, '');

	// @see http://wiki.openstreetmap.org/wiki/Nominatim#Alternatives_.2F_Third-party_providers
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

module.exports = {
	osmSearch: osmSearch
}
