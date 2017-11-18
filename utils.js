function osmSearch(client, query, callback) {
	client.log('osmSearch: query', query);
	query = query.replace(/^Ulica\s/, '');

	// @see http://wiki.openstreetmap.org/wiki/Nominatim#Alternatives_.2F_Third-party_providers
	// e.g. https://nominatim.openstreetmap.org/search.php?q=Tony+Halika%2C+Pozna%C5%84&format=json&addressdetails=1
	//const url = 'https://nominatim.openstreetmap.org/search.php?format=json&q=' + encodeURIComponent(query);

	// e.g. http://locationiq.org/v1/search.php?q=Tony+Halika%2C+Pozna%C5%84&format=json&addressdetails=1&key=XXX
	const key = client.getConfig('locationiqKey'),
		url = 'https://locationiq.org/v1/search.php?format=json&addressdetails=1&q=' + encodeURIComponent(query) + '&key=' + key;

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
