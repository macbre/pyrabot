#!/usr/bin/env node
/**
 * Skrypt importujący wybrane zdjęcie z Flickra
 *
 * ./flickr_import.js 20469728769 "Tórshavn - nabrzeże.jpg"
 */
var bot = require('nodemw'),
	client = new bot('config.js'),
	PHOTO_ID = process.argv[2],
	DEST = process.argv[3];

if (!PHOTO_ID || !DEST) {
	console.log('Podaj ID obrazka do importu i nazwę docelową');
	console.log(process.argv[1] + ' <ID obrazka> <nazwa docelowa>');
	process.exit(1);
}

var flickrApiKey = client.getConfig('flickrApiKey');

client.log('Flickr #' + PHOTO_ID);
client.log('Plik: ' + DEST);
//client.log('Flickr API key: ' + flickrApiKey);

function getFlickrInfo(photoId, callback) {
	var client = require('flickr-client')({key: flickrApiKey}),
		photoInfo = require('flickr-photo-info')(client);

	photoInfo(photoId, callback);
}

client.logIn(function() {
	getFlickrInfo(PHOTO_ID, function(err, photo) {
		if (err) {
			throw err;
		}

		const imageUrl = photo.urls.original,
			authorName = photo.owner.name,
			tags = photo.tags.map(function(tag) {
				if (!authorName) {
					authorName = tag.authorname;
				}

				return tag._content;
			});

		// @see https://github.com/npm-flickr/flickr-photo-info#usage
		client.log('Info:');
		client.log(photo);
		client.log('Image:  ' + imageUrl);
		client.log('Author: ' + authorName);
		client.log('Tags:   ' + tags);

		// szablon Flickr
		var text = '{{MediaWiki:Flickr5|1=$1|2=$2|3=$3|4=$4}}'.replace('$1', photo.id).replace('$2', photo.owner.id).replace('$3', authorName).replace('$4', photo.owner.id);

		// dodaj kategorie
		text += tags.map(function(tag) {
				return '\n[[Category:' + tag + ']]';
			}).join('');

		// szablon autorstwa (Macbre)
		// "username":"macbre"
		if (photo.owner.username === 'macbre') {
			client.log('Found macbre\'s photo');
			text += "\n{{Fotografie użytkownika Macbre}}";
		}

		// upload
		var params = {
			comment: 'Import z Flickra',
			text: text
		};

		client.log('Wrzucam plik <' + imageUrl + '> jako <' + DEST + '>...');
		client.log(params);

		// dodaj zdjęcie
		client.uploadByUrl(DEST, imageUrl, params, function(err, res) {
			if (err) throw err;
			console.log('Import zakończony', res.filename);
		});
	});
});
