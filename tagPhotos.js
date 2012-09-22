/**
 * Skrypt kategoryzujący zdjęcia opublikowane przez poszczególnych użytkowników
 */
var bot = require('../lib/bot').bot,
	client = new bot('config.js'),
	images = [];

function getBatch(start) {
	client.getImages(start, function(data, next) {
		images = images.concat(data);
		if (next) {
			getBatch(next);
		}
		else {
			console.log('Images count: ' + images.length);
			processImages(images);
		}
	});
}

function processImages(images) {
	client.logIn(function() {
		var total = images.length,
			item = 1;

		images.forEach(function(image) {
			client.getImageInfo(image.title, function(meta) {
				console.log((item++) + '/' + total + ': ' + image.title + '...');

				if (!meta.exif) {
					return;
				}

				var marker = false;

				// sprawdź autora zdjęcia
				switch(meta.user) {
					case 'Macbre':
						if (meta.exif.Model === 'Canon EOS 450D') {
							marker = '{{Szablon:Fotografie użytkownika Macbre}}';
						}
						break;

					case 'Porywacz zwlok':
						//if (meta.exif.Model === 'Canon EOS 600D') {
							marker = '{{Szablon:Fotografie 11 ujęć}}';
						//}
						break;
				}

				if (marker !== false) {
					console.log(image.title + ' sprawdzam (' + meta.user + ')...');

					client.getArticle(image.title, function(content) {
						// zdjęcie już oznaczone
						if (content.indexOf(marker) > -1) {
							return;
						}

						// dodaj szablon
						content = (marker + "\n\n" + (content || '')).trim();

						console.log(image.title + ' oznaczam...');

						client.edit(image.title, content, 'Oznaczanie zdjęć', function(data) {
							console.log(image.title + ' oznaczony!');
						});
					});
				}
			});
		});
	});
}

getBatch(0);
