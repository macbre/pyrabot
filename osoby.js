var fs = require('fs');
var bot = require('../lib/bot').bot;

var client = new bot('config.js');

var urRegExp = /<part><name>data_ur\s*<\/name>=<value>([^>]+)<\/value>/,
    smRegExp = /<part><name>data_sm\s*<\/name>=<value>([^>]+)<\/value>/;

var persons = [];

client.getPagesInCategory('Osoby', function(pages) {
	var n = 0;

	pages.forEach(function(page) {
		//if (n++ > 5) return;

		client.getArticle(page.title, function(content) {
			client.expandTemplates(content, page.title, function(tmpl) {
				//console.log('\n\n==' + page.title + '==');
				//console.log(tmpl);

				var ur = tmpl.match(urRegExp),
					sm = tmpl.match(smRegExp);

				ur = ur && ur[1].trim() || '';
				sm = sm && sm[1].trim() || '';

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
