#!/usr/bin/env node
/**
 * Skrypt porządkujący tagi <place> na szablony {{Place}}
 */
const bot = require('nodemw'),
        jsdiff = require('diff'),
	fs = require('fs').promises,
        client = new bot(__dirname + '/../config.js');

const REASON = 'Porządkuję tag <place>',
	INPUT = 'pages.txt',
	PLACE_REGEX = /<place ([^>]+)\/?>/;

async function processArticle(title) {
	return new Promise((resolve, reject) => {
		client.getArticle(title, (err, content) => {
			if (err) {
				reject();
				return;
			}

			const match = content.match(PLACE_REGEX);
			if (!match) {
				resolve(new Error("No <place> tag found"));
				return;
			}

			const args = match[1]
				.replace(/"/g, '')
				.replace(/ (\w+=)/g, "\n|$1") // " lat" => "\n|lat"
				.replace(/\/$/, '')
				.trim(" ");

			const replacement = "{{Place\n|" + args + "\n}}";
			const newContent = content.replace(match[0], replacement);

			client.log({title, match, replacement});
			console.log(client.diff(content, newContent));

			client.edit(title, newContent, REASON, err => {
				if (err) {
					reject(err);
				}
				else {
					console.log('# Poprawiłem '+ title);
					resolve();
				}
			});
		});
	});
}

client.logIn( async err => {
	if ( err ) {
		console.log( err );
		return;
	}

	const data = await fs.readFile(INPUT, "utf8");
	const lines = data.split("\n");

	for (const line of lines) {
	  client.log('Processing article - ' + line);

	  try {
	    await processArticle(line);
	  }
          catch(ex) {
	    console.error(line + " failed: " + ex.message);
	  }
	}
});
