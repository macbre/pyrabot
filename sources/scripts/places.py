#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Skrypt importujący punkty (POI) z bazy serwisu www.poznan.pl/mim

@see http://www.poznan.pl/mim/inwestycje/biurowce,poi,4661/ [stary format]
@see http://www.poznan.pl/mim/osiedla/muzea-w-poznaniu,poi,202,12/ [nowy format]
"""

import json
import logging
import re
import requests

from lxml import html
from utils import Geo

logging.basicConfig(level=logging.INFO)


class POI(object):
    def __init__(self):
        self._logger = logging.getLogger('POI')
        self._session = requests.session()
        self._geo = Geo()

    def _fetch_and_parse(self, url):
        resp = self._session.get(url)

        if resp.status_code != 200:
            raise Exception("HTTP request <%s> returned status code %d", url, resp.status_code)

        return html.fromstring(resp.text.encode("utf8"))

    def get_points(self, url):
        tree = self._fetch_and_parse(url)

        names = tree.xpath('//div[@class="Paragraph"]//li/p//a')
        addresses = tree.xpath('//div[@class="Paragraph"]//li/p[2]')

        res = []

        for name, address in zip(names, addresses):
            name = name.text.strip()
            address = address.text.strip()

            street = re.split('[,\(-]', address)[0].strip()

            # brak adresu, miejsce poza Poznaniem
            if address == '' or ('Pozna' not in address and "\n" in address):
                # self._logger.debug("Skipping! - %s: %s", name, address)
                continue

            self._logger.debug('%s - %s', name, street)

            # pobierz współrzędne
            pos = self._geo.query(street + u', Poznań')

            res.append({
                "name": name,
                "address": street,
                "lat": pos['lat'] if pos is not None else False,
                "lon": pos['lon'] if pos is not None else False,
            })

        return res


# kategorie do iterowania
categories = {
    "Biurowce": "http://www.poznan.pl/mim/inwestycje/biurowce,poi,4661/",
    "Centra handlowe": "http://www.poznan.pl/mim/main/centra-handlowe,poi,670/",
    "Muzea": "http://www.poznan.pl/mim/osiedla/muzea-w-poznaniu,poi,202,12/",
    "Puby i kluby": "http://www.poznan.pl/mim/cim/en/-,poi,92,6117/",
    "Licea ogólnokształcące": "http://www.poznan.pl/mim/oswiata/liceum-ogolnoksztalcace,poi,2286,8884/",
    "Pomniki": "http://www.poznan.pl/mim/turystyka/pomniki,poi,2473/",
}

# translacja adres -> lat, lon
poi = POI()
points = []

for (category_name, index_url) in categories.iteritems():
    category_points = poi.get_points(index_url)

    points.append({
        "category": category_name,
        "source": index_url,
        "count": len(category_points),
        "points": category_points
    })

# eksport do JSONa
with open("../db/places.json", "w") as json_output:
    json.dump(points, json_output, indent=True, separators=(',', ':'))

# zapis do wikitekstu
with open("../db/places.wikitext", "w") as wikitext_output:
    for category in points:
        wikitext_output.write("=== [[:Category:%s]] ===\n[[" % category['category'])
        wikitext_output.write(']] &middot;\n[['.join([point['name'].encode('utf-8') for point in category['points']]))
        wikitext_output.write("]]\n\n")
