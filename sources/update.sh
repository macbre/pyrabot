#!/bin/sh

echo "Aktualizuje dane"

# baza Geopozu
echo "\n> Pobieram spis obiektów w bazie Geopozu..."
./scripts/geopoz.sh

# numeracja ulic
echo "\n> Pobieram dane o numeracji ulic..."
curl -s "http://sip.geopoz.pl/data/ulice_adresy/adresy_pobieranie_obowiazujace.php" |  iconv -f windows-1250 -t utf8  | dos2unix \
	> ulice-numeracja.csv

# długości ulic
echo "\n> Pobieram dane o ulicach w układzie podstawowym..."
curl -s "http://www.zdm.poznan.pl/content/pliki/Uk%C5%82ad_podstawowy_wykaz_stan_na_I_2014.xls" > tmp.xls && xls2csv tmp.xls > ulice-ztm-podstawowy.csv

echo "\n> Pobieram dane o ulicach w układzie uzupełniającym..."
curl -s "http://www.zdm.poznan.pl/content/pliki/Ukl%20uzupelniajacy%20wg%20stanu%20na%20dzien%202_11_2012r.xls" > tmp.xls && xls2csv tmp.xls > ulice-ztm-uzupelniajacy.csv

echo "\n> Pobieram dane o ulicach wewnętrznych..."
curl -s "http://www.zdm.poznan.pl/content/pliki/Uk%C5%82ad_uzupe%C5%82niaj%C4%85cy_wykaz_stan_na_I_2014.xls" > tmp.xls && xls2csv tmp.xls > ulice-ztm-wewnetrzne.csv

# kody pocztowe
echo "\n> Pobieram dane o kodach pocztowych..."
curl -s "https://pl.wikisource.org/wiki/Lista_kod%C3%B3w_pocztowych_w_Polsce/Du%C5%BCe_miasta/Pozna%C5%84?action=raw" | grep "^*6" | \
	grep "; ul. " | awk -F " od " '{ print $1}' | awk -F "; " '{ print $1 "\t" $3 }' | sed 's/*//g' | sort | uniq \
	> kody-pocztowe.csv

# komunikacja miejska
echo "\n> Pobieram dane o liniach komunikacji miejskiej..."
./scripts/rozkladzik.js

echo "\n> Pobieram dane o operatorach linii komunikacji miejskiej..."
curl -s "http://ztm.poznan.pl/gtfs-ztm/routes_by_name.json.php?dbname=production_gtfs" | jsonlint > ztm-operators.json

echo "\n> Pobieram listę przystanków z rozkladzik.pl..."
curl -s "http://www.rozkladzik.pl/poznan/data.txt" > rozkladzik.txt

#
unlink tmp*
echo "\nGotowe"
