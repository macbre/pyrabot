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

db/ztm-stops.lua:

local database = {
    ["LUGA01"] = { "54" },
    ["LUGA02"] = { "54", "62", "244" },
    ["PILS01"] = { "52", "55", "62", "65" },
    ["OSWI01"] = { "52", "55", "62", "65" },
    ["SZII02"] = { "52", "74", "84" },
}

return database

"""

import csv
import json

# czytaj ze źródeł
with open("sources/ztm-routes.json") as f:
    routes = json.load(f)

with open("sources/ztm-operators.json") as f:
    try:
        operators = json.load(f)
    except ValueError:
        operators = {'lines': []}

# generuj dane o liniach i przystankach
lines = {}
stops = {}

for line in routes['lines']:
    try:
        line['name'] = int(line['name'])
    except:
        pass

    # rejestruj linię
    lines[line['name']] = {
        "typ": line['typ'],
        "petle": line['petle'],
        "przystanki": line['przystanki'],
    }

    # rejestruj linię zatrzymujące się na poszczególnych przystankach
    for stop in line['przystankiSymbole'].split(','):
        if stop not in stops:
            stops[stop] = []

	line_name = str(line['name'])

	if line_name not in stops[stop]:
	        stops[stop].append(line_name)

# generuj dane o przystankach (format dla skryptów LUA)
with open("db/ztm-stops.lua", "w") as lua:
    lua_lines = ['    ["%s"] = { "%s" }' % (stop, '", "'.join(stops[stop])) for stop in sorted(stops.keys())]

    lua.write('local database = {\n%s}\n\nreturn database\n' % ',\n'.join(lua_lines))

# typ / operator linii + rozkład jazdy
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
