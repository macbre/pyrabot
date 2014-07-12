#!/bin/sh

echo "Aktualizuje dane"

# baza Geopozu
echo "\n> Pobieram spis obiektów w bazie Geopozu..."
curl -s "http://www.city.poznan.pl/mapa_geopoz/data/ulice_adresy/ulice_pobieranie.php" |  iconv -f windows-1250 -t utf8 \
	> geopoz.csv

# numeracja ulic
echo "\n> Pobieram dane o numeracji ulic..."
curl -s "http://www.city.poznan.pl/mapa_geopoz/data/ulice_adresy/adresy_pobieranie_obowiazujace.php" |  iconv -f windows-1250 -t utf8 \
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
curl -s "http://pl.wikisource.org/wiki/Lista_kod%C3%B3w_pocztowych_w_Polsce/Du%C5%BCe_miasta/Pozna%C5%84?action=raw" | grep "^*6" | \
	grep "; ul. " | awk -F " od " '{ print $1}' | awk -F "; " '{ print $1 "\t" $3 }' | sed 's/*//g' | sort | uniq \
	> kody-pocztowe.csv

#
unlink tmp*
echo "\nGotowe"
