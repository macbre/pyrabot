#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Skrypt generujący plik CSV z kodami pocztowymi dla Poznania na podstawie bazy Geopozu

@see http://sip.geopoz.pl/data/ulice_adresy/geopoz-ulice.php?kody=t&poczatek=0
"""

import csv
import logging
import re

import requests

# logowanie
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('kody-pocztowe')

# pobieraj kolejne podstrony
URL = 'http://sip.geopoz.pl/data/ulice_adresy/geopoz-ulice.php?kody=t&poczatek={}'
PER_PAGE = 25

index = 0
http = requests.session()

kody = []
kod_re = re.compile('\d\d-\d\d\d')

while True:
    logger.info('Pozycja #{}'.format(index))

    r = http.get(URL.format(index))
    html = r.text

    # parsuj kolejne wiersze
    rows = html.split("<td id='righttop'>")

    for row in rows[1:]:
        # ul.</td>
        # >Admiralska</a>
        # >60-134</a>
        typ = re.search(r'^([^<]+)</td>', row)  # ul. / al.
        links = re.findall(r'>([^<]+)</a>', row)

        if typ is None or links is None:
            continue

        typ = typ.group(1).encode('utf-8')
        name = links.pop(0).encode('utf-8')

        # zostaw tylko kody pocztowe
        links = [kod for kod in links if kod_re.match(kod)]

        name = '{} {}'.format(typ, name)
        logger.debug('{}: {}'.format(name, ', '.join(links)))

        for kod in links:
            kody.append((kod, name))

    # brak kolejnej strony
    if u'>pokaż następne' not in html:
        break

    index += PER_PAGE

# sortuj wg kodów
kody = sorted(kody, key=lambda t: t[0])

# generuj plik CSV
with open("kody-pocztowe.csv", "wt") as f:
    writer = csv.writer(f, delimiter="\t", lineterminator="\n")

    for (kod, name) in kody:
        writer.writerow((kod, name))

logger.info('Gotowe')
