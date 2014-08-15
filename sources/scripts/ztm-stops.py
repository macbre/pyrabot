#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Skrypt importujący dane o lokalizacji przystanków

@see http://www.rozkladzik.pl/poznan/data.txt
"""

import json
import logging

import requests
import unicodecsv
from geojson import FeatureCollection, Point, Feature

logging.basicConfig(level=logging.INFO)


class ReverseGeo(object):
    def __init__(self, base_url="http://nominatim.openstreetmap.org/reverse"):
        self.base_url = base_url
        self.logger = logging.getLogger('ReverseGeo')

    def query(self, lat, lon):
        """
        Zwraca informacje o mieście i ulicy dla podanej lokalizacji
        """
        r = requests.get(self.base_url, params={
            "lat": lat,
            "lon": lon,
            "format": "json"
        })

        data = r.json()

        if 'address' in data:
            details = data['address']
            self.logger.info('[%s] %s', data['osm_type'], json.dumps(details))

            # Folwarczna
            if 'road' in details:
                place = details['road']
            # M1 Centrum Handlowe
            elif 'address26' in details:
                place = details['address26']
            # Park Handlowy Franowo
            elif 'retail' in details:
                place = details['retail']
            else:
                return None

            self.logger.info('Place: %s (%s)', place, data['address']['county'])

            return {
                "city": data['address']['county'],
                "place": place,
            }

        return None

stops = []

# czytaj plik z rozkladzik.pl
with open('rozkladzik.txt') as f:
    content = f.readline()

# rozdziel po #SEP# a następnie po średniku
parts = content.split("#SEP#")
raw = []

for part in parts:
    raw.append(part.split(';'))

# indeksy w raw
# 0 - nazwy przystanków
# 1 - wartości "8" lub puste (?)
# 2 - kody przystanków
# 3 - szerokość geograficzna (latitude)
# 4 - długość geograficzna (longitude)
# 5 - ID (?)
# 6 - ID (?)
# 7 - ID wpisu w indeksie 0 (nazwa przystanku)
geo = ReverseGeo(base_url="http://open.mapquestapi.com/nominatim/v1/reverse.php")

for idx, stop in enumerate(raw[2]):
    if stop == '':
        continue

    name_idx = int(raw[7][idx])

    entry = {
        "id": stop,
        "name": raw[0][name_idx],
        "lat": float(raw[3][idx]),
        "lon": float(raw[4][idx]),
        "city": '',
        "place": '',
    }

    # geolokalizacja
    ret = geo.query(entry['lat'], entry['lon'])
    if ret is not None:
        entry['city'] = ret['city']
        entry['place'] = ret['place']

    stops.append(entry)

print("Znalezionych przystanków: %d" % (len(stops)))

# print json.dumps(stops, indent=True)

# zapisz jak TSV
with open('ztm-stops.tsv', 'wb') as out:
    writer = unicodecsv.writer(out, delimiter='\t')

    for stop in stops:
        writer.writerow([
            stop['id'],
            stop['name'],
            round(stop['lat'], 6),
            round(stop['lon'], 6),
            stop['city'],
            stop['place'],
        ])

# konwersja na GeoJSON
points = []

for stop in stops:
    # longitude and latitude
    feature = Feature(
        geometry=Point((stop['lon'], stop['lat'])),
        id=stop['id'],
        properties={
            'name': stop['name'],
            'city': stop['city'],
            'place': stop['place'],
        }
    )

    points.append(feature)

with open("../db/ztm-stops.geojson", "w") as out:
    json.dump(FeatureCollection(points), out, indent=True, separators=(',', ':'))
