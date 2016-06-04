#!/usr/bin/env node
'use strict';

const ULICE=`
Gertrudy Konatkowskiej 
Aleksandry Karpińskiej 
Jana Stachowiaka 
Józefa Łęgowskiego 
Edwarda Raczyńskiego 
Nikodema Pajzderskiego 
Zygmunta Zaleskiego 
Julii i Antoniego Wojkowskich 
Edwarda Dembowskiego 
Tadeusza Kutrzeby 
Cyryla Ratajskiego 
Anny Danysz 
Jarogniewa Drwęskiego 
Augusta Cieszkowskiego 
Marcina Rożka 
Orla 
Odrodzenia 
Piastowska 
Podolańska 
Szpakowa 
Skowrończa 
Sikorowa 
Słoneczna 
Skryta 
Tysiąclecia 
Wójtowska 
Zwycięstwa 
Żurawia 
25-lecia PRL 
Słowicza 
`.trim().split("\n").map((i) => i.trim());

const INFO = `Ulica otrzymała swojego obecnego patrona [[3 października]] [[1973]] r. decyzją [[Miejska Rada Narodowa|Miejskiej Rady Narodowej]]<ref>{{KMP|2/1974|strony=169}}</ref>.`;
const YEAR = `[[1973]] (nadanie patrona)`

const APPEND = `

== Historia ==
{{Rozwiń Sekcję}}

${INFO}

== Źródła ==
<references />
`.trim();

const SUMMARY = 'Informacja o nadaniu patrona na podstawie Kroniki Miasta Poznania';


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

