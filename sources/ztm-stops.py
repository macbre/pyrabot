#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Skrypt importujący dane o lokalizacji przystanków

@see http://www.rozkladzik.pl/poznan/data.txt
"""

import json
import sys

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
for idx, stop in enumerate(raw[2]):
    if stop == '':
        continue

    #print stop
    #print raw[5][idx]
    name_idx = int(raw[7][idx])

    stops.append({
        "id": stop,
        "name": raw[0][name_idx],
        "lat": raw[3][idx],
        "lng": raw[4][idx],
    })

sys.stderr.write("Znalezionych przystanków: %d\n" % (len(stops)))

print json.dumps(stops, indent=True)
