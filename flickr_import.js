#!/usr/bin/env node
/**
 * Skrypt importujący wybrane zdjęcie z Flickra
 *
 * ./flickr_import.js 20469728769 "Tórshavn - nabrzeże.jpg"
 *
 * @see https://github.com/flickr/flickr-sdk
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

/** @type { string } */
const flickrApiKey = client.getConfig('flickrApiKey');

client.log('Flickr #' + PHOTO_ID);
client.log('Plik: ' + DEST);
//client.log('Flickr API key: ' + flickrApiKey);

function getFlickrInfo(photo_id, callback) {
    // https://github.com/flickr/flickr-sdk#make-a-flickr-api-call
    const { createFlickr } = require("flickr-sdk");
    const { flickr } = createFlickr( flickrApiKey );

    Promise.all([
        // https://www.flickr.com/services/api/flickr.photos.getInfo.htm
        flickr("flickr.photos.getInfo", { photo_id } ),
        // https://www.flickr.com/services/api/flickr.photos.getSizes.html
        flickr("flickr.photos.getSizes", { photo_id })
    ]).then(
        ( [infoRes, sizesRes ] ) => {
            const res = infoRes.photo;
            res.title = res.title._content;

            res['urls'] = {};
            for (const sizesEntry of sizesRes.sizes.size) {
                res['urls'][sizesEntry.label.toLowerCase()] = sizesEntry.source;
            }

            callback( null, res );
        }
    ).catch(
        err => callback( err )
    );
}

client.logIn(function() {
	getFlickrInfo(PHOTO_ID, function(err, photo) {
		if (err) {
			throw err;
		}

        // console.log( 'Flickr photo info', photo );
        // console.log( 'Tags', photo.tags.tag );

		const imageUrl = photo.urls.large;
        let authorName = photo.owner.name,
			tags = photo.tags.tag.map(function(tag) {
				if (!authorName) {
					authorName = tag.authorname;
				}

				return tag._content;
			});

        const authorId = photo.owner.nsid;

		// @see https://github.com/npm-flickr/flickr-photo-info#usage
		client.log('Info:');
		client.log(photo);
		client.log('Desc:   ' + photo.title);
		client.log('Image:  ' + imageUrl);
		client.log('Author: ' + authorName);
		client.log('ID:     ' + authorId);
		client.log('Tags:   ' + tags);

		// szablon Flickr
        // https://poznan.fandom.com/wiki/MediaWiki:Flickr5
		var text = photo.title + '\n\n{{MediaWiki:Flickr5|1=$1|2=$2|3=$3}}'
            .replace('$1', photo.id)
            .replace('$2', authorId)
            .replace('$3', authorName);

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
			text: text.trim(),
		};

		client.log('Wrzucam plik <' + imageUrl + '> jako <' + DEST + '>...');
        client.log('Text: ' + text);
		client.log(params);

		// dodaj zdjęcie
		client.uploadByUrl(DEST, imageUrl, params, function(err, res) {
			if (err) throw err;
			console.log('Import zakończony', res.filename);
		});
	});
});
