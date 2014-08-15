#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Skrypt generujący dane dla skryptów aktualizujących
dane o liniach tramwajowych i autobusowych

db/ztm-linie.json:

  "1": {
    "petle": [
      "Junikowo",
      "Franowo"
    ],
    "strefy": [
      "A"
    ],
    "przystanki": 31,
    "czas": 41,
    "agency": "ZTM MPK"
  }

db/ztm-ulice.json:

    "Żegrze": [
        1,
        4,
        5,
        13,
        17,
        55,
        66,
        201,
        245
    ]

"""

import csv
import json

# czytaj ze źródeł
with open("sources/ztm-routes.json") as f:
    routes = json.load(f)

with open("sources/ztm-operators.json") as f:
    operators = json.load(f)

# generuj dane o liniach
lines = {}

for line in routes['lines']:
    try:
        line['name'] = int(line['name'])
    except:
        pass

    lines[line['name']] = {
        "typ": line['typ'],
        "petle": line['petle'],
        "przystanki": line['przystanki'],
    }

for line in operators['lines']:
    try:
        line['name'] = int(line['name'])
    except:
        pass

    if line['name'] in lines:
        if line['night'] is True:
            lines[line['name']]['night'] = True

        # operator
        lines[line['name']]['agency'] = line['operator'].replace('ZTM_', '')

        # link do rozkładu jazdy
        lines[line['name']]['rozklad'] = \
            'http://ztm.poznan.pl/komunikacja/rozklad/#/kierunki/%s/linia/%s' % (line['operator'], line['name'])

# TODO: inni operatorzy
# * Kombus - http://www.kombus.pl/komunikacja

# generuj plik JSON
with open("db/ztm-linie.json", "w") as out:
    json.dump(lines, out, indent=2, separators=(',', ':'), sort_keys=True)

# generuj dane o ulicach
stops_to_street = {}
streets = {}

with open("sources/ztm-stops.tsv", "r") as f:
    stops = csv.reader(f, delimiter="\t")

    for stop in stops:
        # tylko przystanki w Poznaniu
        if stop[4] != 'Poznań':
            continue

        # ID przystanku -> ulica / lokalizacja
        stops_to_street[stop[0]] = stop[5]

for line in routes['lines']:
    entry = []
    stops = line['przystankiSymbole'].split(',')

    for stop in stops:
        if stop in stops_to_street:
            street = stops_to_street[stop]

            if street not in streets:
                streets[street] = set()

            streets[street].add(line['name'])

for street in streets:
    streets[street] = sorted(list(streets[street]))

with open("db/ztm-ulice.json", "w") as out:
    json.dump(streets, out, indent=2, separators=(',', ': '), sort_keys=True)