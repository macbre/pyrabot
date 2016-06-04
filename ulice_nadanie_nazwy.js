#!/usr/bin/env node
'use strict';

const ULICE=`
Stanisława Pawłowskiego 
Soni Górnej 
Maksymiliana Garsteckiego 
Onufrego Kopczyńskiego 
Stanisława Strugarka 
Emila Zegadłowicza 
Jerzego Suszko 
Henryka Śniegockiego. 
Władysława Syrokomli 
Pawła Gantkowskiego 
Franciszka Stróżyńskiego 
Teofila Mateckiego 
Stefana Poradowskiego 
Władysława Pniewskiego 
Rogera Sławskiego 
Władysława Biegańskiego 
Konstantego Troczyńskiego 
Gen. Taczaka 
Ludwika Braille'a 
Jerzego Szajowicza 
Adama Tomaszewskiego 
Tomasza Drobnika 
Zygmunta Wojciechowskiego 
Chróściejowskich 
Jana Szanieckiego 
Hulewiczów 
Mariana Jaroczyńskiego 
Bibianny Moraczewskiej 
Tomasza Zana 
Jana Rymarkiewicza 
Synów Pułku 
Straży Ludowej 
Anieli Tułodzieckiej 
Heleny Rzepeckiej 
Janiny Omańkowskiej 
Szarych Szeregów 
ZofIi Sokolnickiej 
Marii Wicherkiewicz 
Marii i Celestyny Rydlewskich 
Heleny Szafran 
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
		const ulica = `Ulica ${title}`;

		//client.log(`Dodaję informację o nadaniu patrona ulicy ${title}...`);

		client.getArticle(ulica, true /* redirect */, (err, content) => {
			if (err) return;

			if (!content || content.indexOf('==') > -1) {
				client.log(`${ulica} posiada treść`);
				return;
			}

			let newContent = content.trim() + "\n\n" + APPEND;
			newContent = newContent.
				replace('{{Szkic}}', '').
				replace('|rok=\n', `|rok=${YEAR}\n`);

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

