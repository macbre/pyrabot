var fs = require('fs'),
	bot = require('nodemw'),
	client = new bot('config.js');

var items = [];

client.getPagesInCategory('Infrastruktura', function(pages) {
	pages.forEach(function(page) {
		if (page.title.indexOf('Pętla') === -1) {
			return;
		}

		client.getArticle(page.title, function(content) {
			client.expandTemplates(content, page.title, function(tmpl) {
				var from = client.getTemplateParamFromXml(tmpl, 'uruchomiona') || '',
					to = client.getTemplateParamFromXml(tmpl, 'zlikwidowana') || '';

				from = parseInt(from.split(' ').pop().replace(/\[|\]/g, ''), 10) || false;
				to = parseInt(to.split(' ').pop().replace(/\[|\]/g, ''), 10) || false;

				//console.log('Ur: ' + from);
				//console.log('Sm: ' + to);

				if (from) {
					console.log('* [[' + page.title + ']] (' + from + '-' + to + ')');
				}

				items.push({
					name: page.title.replace('tramwajowa ', ''),
					from: from,
					to: to
				});

				items = items.sort(function(a, b) {
					return a.from - b.from;
				});

				fs.writeFileSync('db/petle.json', JSON.stringify(items, null, '  '));
			});
		});
	});
});
