#!/usr/bin/env node
'use strict';

const ULICE=`
Franciszka Włada
Władysława Bortnowskiego
Edmunda Knolla-Kownackiego
Romana Abrahama
Franciszka Altera
Stanisława Grzmota-Skotnickiego
`.trim().split("\n").map((i) => i.trim());

const INFO = `Ulica swojego patrona otrzymała decyzją [[Miejska Rada Narodowa|Miejskiej Rady Narodowej]] na sesji [[29 września]] [[1989]] r.<ref>{{KMP|2/1990|rozdział=IX Sesja Miejskiej Rady Narodowej}}</ref>`;
//const INFO = `Ulica została wytyczona i otrzymała swojego patrona w roku [[1936]]<ref>{{KMP|3-4/1984|strony=61|rozdział=Sprawozdania}}</ref>.`;
const YEAR = `[[1989]]`

const APPEND = `

== Historia ==
{{Rozwiń Sekcję}}

${INFO}

== Źródła ==
<references />
`.trim();

const SUMMARY = 'Informacja o nadaniu nazwy / patrona na podstawie Kroniki Miasta Poznania';


/***********************************************************************************************************/


const bot = require('nodemw'),
	client = new bot('config.js');

client.logIn((err) => {
	//const ULICE = ['Mariana Jaroczyńskiego']; // debug

	ULICE.forEach((title) => {
		let ulica = `Ulica ${title}`;

		//client.log(`Dodaję informację o nadaniu patrona ulicy ${title}...`);

		client.getArticle(ulica, true /* redirect */, (err, content, redirectInfo) => {
			if (err) return;

			if (!content) {
				client.error(`${ulica} nie istnieje!`);
				return;
			}

			if (content.indexOf('==') > -1) {
				client.log(`${ulica} posiada treść`);
				return;
			}

			let newContent = content.trim() + "\n\n" + APPEND;
			newContent = newContent.
				replace('{{Szkic}}', '').
				replace('|rok=\n', `|rok=${YEAR}\n`);

			if (redirectInfo) {
				ulica = redirectInfo.to;
			}

			client.log(ulica);
			client.log(client.diff(content, newContent));

			client.edit(ulica, newContent, SUMMARY, (err) => {
				if (err) {
					client.error(err.toString());
					return;
				}
			});
		});
	});
});

