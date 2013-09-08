/**
 * Skrypt poprawiający ostatnio edytowane artykuły
 */
var bot = require('nodemw'),
	client = new bot('config.js'),
	SUMMARY = 'Oczyszczanie wikitekstu',
	REPLACEMENTS = [
		// spany
		{
			regexp: /<(span|p) [^>]+>|<\/span>|<\/p>/g,
			repl: ''
		},
		// unifikacja szerokości obrazków - 300px
		{
			regexp: /\|\d+px/g,
			repl: '|300px'
		}
	];

client.logIn(function() {
	// @see http://poznan.wikia.com/api.php?action=query&list=recentchanges&rclimit=500&rctoponly=1&rcnamespace=0
	var params = {
		action: 'query',
		list: 'recentchanges',
		rclimit: 5000,
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
				console.log(origContent.substr(0,750) + '...');
				console.log(content.substr(0,750) + '...');
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
