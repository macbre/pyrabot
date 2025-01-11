#!/usr/bin/env python3
"""
Skrypt generujący dane dla skryptów aktualizujących
dane o liniach tramwajowych i autobusowych

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
import json
import logging

from collections import defaultdict

logging.basicConfig(level=logging.INFO)


# czytaj ze źródeł
with open("sources/ztm-routes.json", 'rt') as f:
    routes = json.load(f)

# generuj dane o liniach i przystankach
stops = defaultdict(set)

for line in routes['lines']:
    try:
        # wspieraj numery liczbowe i ze znakami, np.: T12 / 1
        line['name'] = int(line['name'])
    except:
        pass

    logging.info(f"Linia {line['name']} ...")

    # rejestruj linię zatrzymujące się na poszczególnych przystankach
    for stop in line['przystankiSymbole']:
        stops[stop].add(line['name'])


# generuj dane o przystankach (format dla skryptów LUA)
with open("db/ztm-stops.lua", "wt") as lua:
    lua.write('local database = {\n')

    first_row = True

    for stop in sorted(stops.keys()):
        lines = map(str, sorted(stops[stop]))
        lines_list = '{ "%s" }' % '", "'.join(lines)

        # add the previous row with comma
        if not first_row:
            lua.write(',\n')

        lua.write(f'    ["{stop}"] = {lines_list}')
        first_row = False

    lua.write('\n}\n\nreturn database\n')

logging.info(f"Gotowe")
