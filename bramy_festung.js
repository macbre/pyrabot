var fs = require('fs'),
    bot = require('nodemw'),
    client = new bot('config.js');

var fromRegExp = /<part><name>zbudowana\s*<\/name>=<value>([^>]+)<\/value>/,
    toRegExp = /<part><name>zburzona\s*<\/name>=<value>([^>]+)<\/value>/;

var items = [];

client.getPagesInCategory('Twierdza Poznań', function(pages) {
	var n = 0;

	pages.forEach(function(page) {
		if (!page.title.match(/^Brama|Furta/) || page.ns != 0) return;

		n++;

		client.getArticle(page.title, function(content) {
			client.expandTemplates(content, page.title, function(tmpl) {
				//console.log('\n\n==' + page.title + '==');
				//console.log(tmpl);

				var from = tmpl.match(fromRegExp),
					to = tmpl.match(toRegExp);

				from = from && from[1].trim() || '';
				to = to && to[1].trim() || '';

				// pobierz tylko rok + usuń brackety linków
				from = parseInt(from.split('-').shift().replace(/\[|\]|ok\./g, ''), 10) || '';
				to = parseInt(to.split('-').shift().replace(/\[|\]|ok\./g, ''), 10) || '';

				//console.log([from, to]);
	
				console.log('* [[' + page.title + ']] (' + from + '-' + to + ')');

				items.push({
					name: page.title,
					from: from,
					to: to
				});

				if (items.length === n) {
					fs.writeFileSync('db/bramy_festung.json', JSON.stringify(items));
				}
			});
		});
	});
});
