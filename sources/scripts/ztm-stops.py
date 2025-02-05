#!/usr/bin/env python3
"""
Skrypt importujący dane o lokalizacji przystanków

@see https://www.rozkladzik.pl/poznan/data.txt
"""

import json
import logging

import csv
import requests
from geojson import FeatureCollection, Point, Feature

logging.basicConfig(level=logging.INFO)

from utils import ReverseGeo

stops = []

# czytaj plik z rozkladzik.pl
resp = requests.get('https://www.rozkladzik.pl/poznan/data.txt', headers={'user-agent': 'pyrabot'})
resp.raise_for_status()
logging.info(f'HTTP: {resp.url} got {resp.status_code}')

content = resp.text

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
geo = ReverseGeo()

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
with open('ztm-stops.tsv', 'wt') as out:
    writer = csv.writer(out, delimiter='\t')

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
            'id': stop['id'],
            'name': stop['name'],
            'city': stop['city'],
            'place': stop['place'],
        }
    )

    points.append(feature)

with open("../db/ztm-stops.geojson", "w") as out:
    json.dump(FeatureCollection(points), out, indent=True, separators=(',', ':'))
