#!/bin/sh

echo "Aktualizuje dane"

# baza Geopozu
# https://www.geopoz.pl/bip/index.php?t=200&id=3366
echo "\n> Pobieram spis ulic w bazie Geopozu..."
curl -s "https://www.geopoz.pl/bip/index.php?t=210&id=3372&mode=a" | iconv -f windows-1250 -t utf-8 | dos2unix > geopoz.csv

# komunikacja miejska
echo "\n> Pobieram dane GTFS od ZTM..."
curl -s "https://www.ztm.poznan.pl/pl/dla-deweloperow/getGTFSFile" > gtfs_ztm.zip
./scripts/gtfs_ztm.py

# rejestr zabytków
# @see http://poznan.wuoz.gov.pl/rejestr-zabytkow
curl -s "http://poznan.wuoz.gov.pl/sites/default/files/obrazki/wykaz.xls" > tmp.xls && xls2csv tmp.xls > zabytki.csv

# uchwały Rada Miasta Poznania
./scripts/uchwaly-rmp.py

#
unlink tmp*
echo "\nGotowe"
