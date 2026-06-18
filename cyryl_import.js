#!/usr/bin/env node
/**
 * Skrypt importujący wybrane zdjęcie z portalu Cyryl
 *
 * @see https://cyryl.poznan.pl/items/search?key=CYRYL_19_1_19_0006
 * @see https://cyryl.poznan.pl/items/search?key=CYRYL_19_17_0_1_0015
 * @see https://cyryl.poznan.pl/items/search?key=CYRYL_195_0_0_2_0085
 */
var bot = require('nodemw'),
	client = new bot('config.js'),
	SIGN = process.argv[2],
	DEST = process.argv[3],
	URL;

if (!SIGN || !DEST) {
	console.log('Podaj sygnaturę obrazka do importu i nazwę docelową');
	console.log(process.argv[1] + ' <sygnatura> <nazwa docelowa>');
	process.exit(1);
}

URL = 'https://cyryl.poznan.pl/items/search?key=' + SIGN;

client.log('Sygnatura: ' + SIGN);
client.log('URL: ' + URL);
client.log('Plik: ' + DEST);
client.fetchUrl(URL, function(err, resp) {
   if (err) throw err;

    // <a href="https://cyryl.poznan.pl/content/uploads/2024/12/CYRYL_19_17_0_1_0015.jpg"
    const imageUrl = resp.match(/<a href="(https:\/\/cyryl.poznan.pl\/content\/.*?)"/)[1];

    // data-caption="Projekt trasy Poznańskiego Szybkiego Tramwaju (PST, Pestki) z uwzględnieniem przystanków"
    const imageDesc = resp.match(/data-caption="(.*?)"/)[1];

    client.log('Obrazek: ' + imageUrl);
    client.log('Opis:    ' + imageDesc);

    // upload
    const params = {
        comment: 'Import z Cyryla',
        text: ('{{Cyryl|' + SIGN + '}}\n\n' + imageDesc).trim()
    };

    client.log(params.text);

    client.log('Wrzucam plik <' + imageUrl + '> jako <' + DEST + '>...');
    client.log(JSON.stringify(params));

    // dodaj zdjęcie
    client.logIn(function() {
        client.uploadByUrl(DEST, imageUrl, params, function (err, res) {
            if (err) throw err;

            console.log('Import zakończony');
        });
    });
});
