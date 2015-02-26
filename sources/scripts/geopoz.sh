#!/bin/bash

# http://www.city.poznan.pl/mapa_geopoz/data/ulice_adresy/geopoz-ulice.php?poczatek=50
rm -f geopoz.tmp

for p in {0..2362..25}
do
	echo "Strona od pozycji #$p..."
	curl -s "http://sip.geopoz.pl/data/ulice_adresy/geopoz-ulice.php?poczatek=$p" | iconv -f iso-8859-2 -t utf-8 | grep -E "\s<td id" | sed -E "s/.*>([^<]+)<.*/\\1/" >> geopoz.tmp
done

# @see http://stackoverflow.com/a/9605559
cat geopoz.tmp | sed 'N;s/\n/\t/' > geopoz.csv

rm -f geopoz.tmp
