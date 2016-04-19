pyrabot
=======

Skrypty [bota](http://poznan.wikia.com/wiki/Użytkownik:Pyrabot) używanego na [Poznańskiej Wiki](http://poznan.wikia.com).

## Wymagania

* nodejs
* [nodemw](https://github.com/macbre/nodemw) - bot / klient API MediaWiki oparty o nodejs

## Instalacja

```bash
git clone https://github.com/macbre/pyrabot
npm install
```

## Skrypty

TODO

## Bazy

Repozytorium Pyrabota zawiera (w katalogu [/db](https://github.com/macbre/pyrabot/tree/master/db)) bazy danych w formacie JSON generowane na potrzeby Poznańskiej Wiki:

* [Rok urodzenia i śmierci osób opisanych na wiki](https://raw.github.com/macbre/pyrabot/master/db/osoby.json)
* [Przystanki końcowe oraz czas przejazdu linii ZTM](https://raw.github.com/macbre/pyrabot/master/db/ztm-linie.json)
* [Linie kursujące poszczególnymi ulicami](https://raw.github.com/macbre/pyrabot/master/db/ztm-ulice.json)
* [Baza długości i numeracji ulic w Poznaniu](https://raw.github.com/macbre/pyrabot/master/db/ulice.json)
* [Baza kodów pocztowy](https://raw.github.com/macbre/pyrabot/master/db/ulice_kody_pocztowe.json)

Do wygenerowania powyższych plików wymagane są dane wejściowe - patrz katalog ``sources``.

## Dane

* OpenStreetMap: [Overpass XML dla Poznania](http://overpass-api.de/api/map?bbox=16.4452,52.2181,17.3584,52.5818) (266,72M)
