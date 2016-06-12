#!/usr/bin/env node
'use strict';

const ULICE=`
Sławomira
Dobrochny
Świętochny
Kamienna
Przełom
Korzenna
Błotna
Franciszka Witaszka
Błońska
Władysława Orkana
Xawerego Dunikowskiego
Roberta Kocha
Lubońska
Jacka Malczewskiego
Poroninska
Rzeszowska
Żnińska
Łódzka
Jarocińska
Jasielska
Oksywska
Sztumska
Jastarnicka
Raciborska
Tyska
Szaflarska
Białczańska
Limanowska
Rewekólska
Architektów
Geodetów
Drogowców
Meliorantów
Zimowa
Szafirowa
Zbigniewa Burzyńskiego
Ikara
Dedala
Latawcowa
Balonowa
Moryńska
Wilhelma Grimma
Jana Maklakiewicza
Złotej Kaczki
Jana Brzechwy
Lisa Witalisa
Pana Kleksa
Juliana Tuwima
Boruty
Janosika
Ezopa
Fedrusa
Iwana Kryłowa
Pana Twardowskiego
Smoka Wawelskiego
`.trim().split("\n").map((i) => i.trim());

const INFO = `Ulica otrzymała swoją nazwę decyzją [[Miejska Rada Narodowa|Miejskiej Rady Narodowej]] [[6 grudnia]] [[1974]] r.<ref>{{KMP|3/1975|strony=149-151}}</ref>`;
const YEAR = `[[1974]]`

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

