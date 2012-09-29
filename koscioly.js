/**
 * Skrypt generujący dane o poznańskich zabytkowych świątyniach
 */
var fs = require('fs'),
	bot = require('../lib/bot').bot;

var client = new bot({
	server: 'pl.wikipedia.org',
 	path: '/w'
});

var koscioly = [];

var century = {
	9: 'IX',
	10: 'X',
	11: 'XI',
	12: 'XII',
	13: 'XIII',
	14: 'XIV',
	15: 'XV',
	16: 'XVI',
	17: 'XVII',
	18: 'XVIII',
	19: 'XIX',
	20: 'XX'
};

client.getPagesInCategory('Zabytkowe kościoły Poznania', function(pages) {
	pages.forEach(function(page) {
		var name = page.title.replace(' w Poznaniu', '');

		// pobierz dane o kościele
		client.getArticle(page.title, function(content) {
			client.expandTemplates(content, page.title, function(tmpl) {
				var zbudowany = client.getTemplateParamFromXml(tmpl, 'data rozpoczęcia budowy') ||
						client.getTemplateParamFromXml(tmpl, 'data zakończenia budowy')  || '',
					konsekrowany = client.getTemplateParamFromXml(tmpl, 'data konsekracji') || '',
					foto = client.getTemplateParamFromXml(tmpl, 'grafika'),
					link = client.getTemplateParamFromXml(tmpl, 'www');

				// geo
				var lat = parseInt(client.getTemplateParamFromXml(tmpl, 'stopniN')) + 
					parseInt(client.getTemplateParamFromXml(tmpl, 'minutN')) / 60 +
					parseInt(client.getTemplateParamFromXml(tmpl, 'sekundN')) / 3600;

				var lon = parseInt(client.getTemplateParamFromXml(tmpl, 'stopniE')) +
					parseInt(client.getTemplateParamFromXml(tmpl, 'minutE')) / 60 +
					parseInt(client.getTemplateParamFromXml(tmpl, 'sekundE')) / 3600;

				// pobierz tylko rok + usuń brackety linków
				zbudowany = parseInt(zbudowany.split(' ').pop().replace(/\[|\]/g, ''), 10) || '';
				konsekrowany = parseInt(konsekrowany.split(' ').pop().replace(/\[|\]/g, ''), 10) || '';

				// zbierz dane
				var data = {
					nazwa: name
				};

				if (zbudowany)		{ data.zbudowany = zbudowany; data.wiek = century[Math.ceil(zbudowany / 100)]; }
				if (konsekrowany)	data.konsekrowany = konsekrowany;
				if (lat)		data.lat = lat.toFixed(6);
				if (lon)		data.lon = lon.toFixed(6);
				if (foto)		data.foto = foto;
				if (link)		data.link = link;

				console.log(data);

				koscioly.push(data);
				fs.writeFileSync('db/koscioly.json', JSON.stringify(koscioly));
			});
		});
	});
});
