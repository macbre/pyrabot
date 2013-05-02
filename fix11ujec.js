/**
 * Skrypt poprawia zdjęcia wrzucone z bloga 11ujec
 **/
var bot = require('nodemw'),
	client = new bot('config.js');

// [[Plik:IMG_7111.jpg|thumb]][[Plik:IMG_7116.jpg|thumb]][[Plik:IMG_7118.jpg|thumb]]{{11_ujęć|http://11ujec.blogspot.com/2011/12/ulica-ks-ignacego-posadzego.html}}
var CATEGORY = '11 ujęć',
	REGEX = /(\[\[Plik:[^\|]+\|thumb\]\])+{{(Szablon:)?11[_ ]ujęć\|(.*)}}/,
	IMG = /\[\[Plik:([^\|]+)\|thumb\]\]/g,
	SUMMARY = 'Porządki w galeriach';

client.logIn(function() {
	var cnt = 0;

	client.getPagesInCategory(CATEGORY, function(pages) {
		pages.forEach(function(page, idx) {
			if (page.ns !== 0) return;

			client.getArticle(page.title, function(content) {
				if (content.indexOf('<gallery ') > -1) {
					//return;
				}

				var matches = content.match(REGEX),
					gallery,
					image;

				if (matches) {
					console.log('------------------------');
					console.log(page.title);
					console.log(content + "\n");

					console.log('----');
					console.log(JSON.stringify(matches));

					gallery = "{{11_ujęć|" + matches[3] + "}}\n";
					gallery += '<gallery captionalign="left" orientation="none" widths="200" columns="3" bordercolor="#ffffff" bordersize="large" spacing="small">\n';

					// zdjęcia do galerii
					var images = matches[0].match(IMG);
					console.log(JSON.stringify(images));

					images.forEach(function(img) {
						gallery += img.
							replace('|thumb]]', '').
							replace('[[Plik:', '');

						gallery += "\n";
					});

					gallery += '</gallery>\n';

					// zamień galerię
					content = content.replace(matches[0], "\n\n" + gallery).trim();

					console.log('>>>');
					console.log(content);

					client.edit(page.title, content, SUMMARY, function() {
						console.log(page.title + ' zmieniony!');
					});
				}
				else {
					console.log('> BRAK!');
				}
			});
		});
	});
});
