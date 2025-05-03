var fs = require('fs'),
	bot = require('nodemw'),
	client = new bot('config.js');

var items = [];

const CATEGORY = 'Infrastruktura';

client.getPagesInCategory(CATEGORY, (err, pages) => {
	pages.forEach(function(page) {
		if (page.title.indexOf('Pętla') === -1) {
			return;
		}

		client.getArticle(page.title, function(err, content) {
			client.expandTemplates(content, page.title, function(err, tmpl) { console.log(tmpl, err);
				// </value></part><part><name>uruchomiona</name><equals>=</equals><value>1925
				// </value></part><part><name>zlikwidowana</name><equals>=</equals><value>1959
				var from = client.getTemplateParamFromXml(tmpl, 'uruchomiona') || '',
					to = client.getTemplateParamFromXml(tmpl, 'zlikwidowana') || '';

				console.log(page.title, {from, to});

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
