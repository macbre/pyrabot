#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Skrypt generujący dane dla skryptów aktualizujących
dane o liniach tramwajowych i autobusowych

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

"""

import json

# czytaj ze źródeł
with open("sources/ztm-routes.json") as f:
    routes = json.load(f)

with open("sources/ztm-operators.json") as f:
    operators = json.load(f)

# generuj dane
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
