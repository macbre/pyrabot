#!/bin/sh
curl -s http://www.city.poznan.pl/mapa_geopoz/data/ulice_adresy/adresy_pobieranie_obowiazujace.php |  iconv -f windows-1250 -t utf8 \
	> db/ulice-numeracja.csv
