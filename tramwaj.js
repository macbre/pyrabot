var fs = require('fs'),
	bot = require('nodemw'),
	client = new bot('config.js');

var lines = [];

client.getPagesInCategory('Linie tramwajowe', function(pages) {
	pages.forEach(function(page) {
		if (page.ns !== 0) {
			return;
		}

		client.getArticle(page.title, function(content) {
			client.expandTemplates(content, page.title, function(tmpl) {
				var from = client.getTemplateParamFromXml(tmpl, 'uruchomiona') || '',
					to = client.getTemplateParamFromXml(tmpl, 'zlikwidowana') || '',
					num = client.getTemplateParamFromXml(tmpl, 'numer') || '';
 
				from = parseInt(from.split(' ').pop().replace(/\[|\]/g, ''), 10) || false;
				to = parseInt(to.split(' ').pop().replace(/\[|\]/g, ''), 10) || 2012;

				if (from && num) {
					console.log('* [[' + page.title + ']] (' + from + '-' + to + ')');

					lines.push({
						name: num.trim(),
						from: from,
						to: to
					});

					lines.sort(function(a,b) {
						var lineA = parseInt(a.name, 10),
							lineB = parseInt(b.name, 10);

						if (!isNaN(lineA) && !isNaN(lineB)) {
							return lineA - lineB;
						}
						else {
							return !isNaN(lineA) ? -1 : 1;	
						}
					});

					fs.writeFileSync('db/tramwaj.json', JSON.stringify(lines, null, '  '));
				}
			});
		});
	});
});
