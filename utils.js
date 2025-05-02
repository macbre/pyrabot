/**
 * Performs the OSM geo search
 * 
 * @see https://nominatim.org/release-docs/develop/api/Search/
 * @see https://nominatim.org/release-docs/develop/api/Search/#examples
 *
 * @typedef { import('nodemw') } nodemw
 * 
 * @param {nodemw} client 
 * @param {string} query 
 * @param {function} callback 
 * @return {object}
 */
function osmSearch(client, query, callback) {
	query = query.replace(/^Ulica\s/, '');

	// e.g. https://nominatim.openstreetmap.org/search.php?q=Tony+Halika%2C+Pozna%C5%84&format=json&addressdetails=1
	const email = `${client.getConfig('username')}@nodemw.local`;
	const url = 'https://nominatim.openstreetmap.org' +
		'/search.php?addressdetails=1&namedetails=1&format=jsonv2' +
		`&email=${email}` +
		`&q=${encodeURIComponent(query)}`;

	client.log(`osmSeach: "${query}" <${url}> ...`);


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
