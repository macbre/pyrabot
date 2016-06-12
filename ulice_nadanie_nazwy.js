#!/usr/bin/env node
'use strict';

const ULICE=`
Stanisława Małachowskiego
Aleksandra Hercena
Kondratija Rylejewa
Benedykta Tadeusza Dybowskiego
Juliana Leńskiego
Aleja Pod Lipami
Do Alei
Estońska
Łotewska
Białoruska
Gruzińska
Armeńska
Gieorgija Dobrowolskiego
Władysława Wołkowa
Wiktora Pacajewa
`.trim().split("\n").map((i) => i.trim());

const INFO = `Ulica, istniejąca już wcześniej, otrzymała swoją nazwę w maju [[1977]] r.<ref>{{KMP|4/1977|strony=100}}</ref>`;
const YEAR = `[[1977]] (nadanie nazwy)`

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

