/**
 * Skrypt kategoryzujący zdjęcia opublikowane przez poszczególnych użytkowników
 */
var bot = require('nodemw'),
	client = new bot('config.js'),
	images = [];

var PREFIX = 'Plik:IMG '; // 11 ujęć

function getBatch(start) {
	client.getImages(start, function(err, data, next) {
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
	client.logIn(function(err) {
		var total = images.length,
			item = 1;

		images.forEach(function(image) {
			if ((typeof PREFIX !== 'undefined') && image.title.indexOf(PREFIX) !== 0) {
				return;
			}

			client.getImageInfo(image.title, function(err, meta) {
				console.log((item++) + '/' + total + ': ' + image.title + '...');

				if (!meta || !meta.exif) {
					return;
				}

				var marker = false;

				// sprawdź autora zdjęcia
				switch(meta.user) {
					case 'Macbre':
						if (meta.exif.Model === 'Canon EOS 450D') {
							marker = 'Fotografie użytkownika Macbre';
						}
						break;

					case 'Porywacz zwlok':
						//if (meta.exif.Model === 'Canon EOS 600D') {
							marker = 'Fotografie 11 ujęć';
						//}
						break;
				}

				if (marker !== false) {
					console.log(image.title + ' sprawdzam (' + meta.user + ')...');

					client.getArticle(image.title, function(err, content) {
						// zdjęcie już oznaczone
						if (content.indexOf(marker) > -1) {
							return;
						}

						// dodaj szablon
						var template = '{{Szablon:' + marker + '}}';

						content = (template + "\n\n" + (content || '')).trim();

						console.log(image.title + ' oznaczam...');

						client.edit(image.title, content, 'Oznaczanie zdjęć', function(err, data) {
							console.log(image.title + ' oznaczony!');
						});
					});
				}
			});
		});
	});
}

getBatch(0);
