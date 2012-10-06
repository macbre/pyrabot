var fs = require('fs'),
	bot = require('../lib/bot').bot,
	client = new bot('config.js');

var persons = [];

client.getPagesInCategory('Osoby', function(pages) {
	pages.forEach(function(page) {
		client.getArticle(page.title, function(content) {
			client.expandTemplates(content, page.title, function(tmpl) {
				var ur = client.getTemplateParamFromXml(tmpl, 'data_ur') || '',
					sm = client.getTemplateParamFromXml(tmpl, 'data_sm') || '';

				// pobierz tylko rok + usuń brackety linków
				ur = parseInt(ur.split(' ').pop().replace(/\[|\]/g, ''), 10) || '';
				sm = parseInt(sm.split(' ').pop().replace(/\[|\]/g, ''), 10) || '';

				//console.log('Ur: ' + ur);
				//console.log('Sm: ' + sm);
	
				if (ur) {
					console.log('* [[' + page.title + ']] (' + ur + '-' + sm + ')');
				}

				persons.push({
					name: page.title,
					ur: ur,
					sm: sm
				});

				if (persons.length === pages.length) {
					fs.writeFileSync('db/osoby.json', JSON.stringify(persons));
				}
			});
		});
	});
});
