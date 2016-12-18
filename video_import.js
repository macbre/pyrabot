#!/usr/bin/env node
/**
 * @see https://www.youtube.com/watch?v=24X9FpeSASY
 * @see http://nordycka.wikia.com/wiki/Specjalna:Dodaj_film
 * @see /index.php?title=Special:WikiaVideoAdd&action=submit
 */
const bot = require('nodemw'),
	client = new bot('config.js');

const url = process.argv[2] || '',
	fileName = process.argv[3] || '';

if (url === '' || fileName === '') {
	console.log('Podaj URL do pliku video / docelową jego nazwę');
	process.exit(1);
}

client.logIn((err) => {
	client.log(`Uploading ${url}...`);

	client.uploadVideo(fileName, url, (err, res) => {
		if (err) {
			client.log(err);
			return;
		}

		client.log('Upload completed!');
		client.log(res);
	});
});
