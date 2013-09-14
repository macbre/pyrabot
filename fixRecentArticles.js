/**
 * Skrypt poprawiający ostatnio edytowane artykuły
 */
var bot = require('nodemw'),
	client = new bot('config.js'),
	SUMMARY = 'Oczyszczanie wikitekstu',
	REPLACEMENTS = [
		// spany, paragrafy, podkreślenia
		{
			regexp: /<(span|p) [^>]+>|<\/span>|<\/p>|<u>|<\/u>/g,
			repl: ''
		},
		// unifikacja szerokości obrazków - 300px
		{
			regexp: /\|thumb\|\d+px/g,
			repl: '|thumb|300px'
		},
		// linki do wikipedii -> interwiki
		// [http://pl.wikipedia.org/wiki/Czes%C5%82aw_Mi%C5%82osz Czesławem Miłoszem]
		{
			regexp: /\[http:\/\/pl.wikipedia.org\/wiki[^\]]+\]/g,
			repl: function(link) {
				var re = /\/wiki\/([^\s]+) (.*)$/,
					matches,
					isDigit;

				link = link.substring(1, link.length - 1);
				matches = link.match(re);

				//console.log(link); console.log(matches);

				// fallback
				if (!matches) return link;

				// 23 stycznia / 1910
				isDigit = /^\d/.test(matches[1]);

				return isDigit ? ('[[' + decodeURIComponent(matches[1]) + '|' + matches[2] + ']]')
					: ('[[wikipedia:pl:' + decodeURIComponent(matches[1]) + '|' + matches[2] + ']]');
			}
		}
	];

client.logIn(function() {
	// @see http://poznan.wikia.com/api.php?action=query&list=recentchanges&rclimit=500&rctoponly=1&rcnamespace=0
	var params = {
		action: 'query',
		list: 'recentchanges',
		rclimit: 250,
		rctoponly: 1, // pokazuj tylko ostatnią edycję artykułu
		rcnamespace: 0
	},
	cnt = 0;

	client.api.call(params, function(data) {
		var pages = data.recentchanges;

		pages.forEach(function(page) {
			console.log((++cnt) + ') sprawdzam ' + page.title + ' (@' + page.timestamp + ')...');

			client.getArticle(page.title, function(content) {
				var origContent = content;

				REPLACEMENTS.forEach(function(item) {
					content = content.replace(item.regexp, item.repl);
				});

				if (origContent === content) return;

				console.log("\n\n");
				console.log(page.title + ':');
				console.log(origContent.substr(0,1500) + '...\n');
				console.log(content.substr(0,1500) + '...');
				console.log('---');

				//return; // !!!!!!!!

				// zapisz zmianę
				client.edit(page.title, content, SUMMARY, function() {
					console.log(page.title + ' zmieniony!');
				});
			});
		});
	});
});
