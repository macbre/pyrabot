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
from math import ceil

logging.basicConfig(level=logging.INFO)


# czytaj ze źródeł
with open("sources/ztm-routes.json", 'rt') as f:
    routes: dict = json.load(f)

# generuj dane o liniach i przystankach
lines = defaultdict(dict)
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

    # rejestruj linię
    lines[str(line['name'])] = {
        "typ": line['typ'],
        "petle": line['petle'],
        "kolor1": '#' + line['color1'],
        "kolor2": '#' + line['color2'],
        # przystanki uwzględniają te końcowe + w obie strony, liczba przystanków (pętla liczona jako zero): ceil((len - 2) / 2)
        "przystanki": ceil( (len(line['przystankiSymbole'])-2) / 2),
        "przebieg": line.get('przebieg'),
    }


# czytaj dane o operatorachj
with open("sources/ztm-operators.json") as f:
    try:
        operators: dict = json.load(f)
        logger = logging.getLogger('operators')

        for line in operators['lines']:
            logger.info(f'Line #{line['name']}: ' + repr(line))

            if line['name'] in lines:
                # rozszerz dane
                if line['night'] is True:
                    lines[line['name']]['night'] = True
                
                # operator
                lines[line['name']]['agency'] = line['operator'].replace('ZTM_', '')

                # link do rozkładu jazdy
                lines[line['name']]['rozklad'] = \
                    f'http://ztm.poznan.pl/komunikacja/rozklad/#/kierunki/{line['operator']}/linia/{line['name']}'

    except ValueError:
        logging.error('Failed reading operators data', exc_info=True)


# generuj plik JSON z danymi o liniach ZTM
# plik wykorzystuje następnie skrypt "petle_linia_ztm" aktualizując artykuły na wiki
with open("db/ztm-linie.json", "w") as out:
    json.dump(lines, out, indent=2, separators=(',', ':'), sort_keys=False)


# generuj dane o przystankach (format dla skryptów LUA)
with open("db/ztm-stops.lua", "wt") as lua:
    lua.write('local database = {\n')

    first_row = True

    for stop in sorted(stops.keys()):
        try:
            lines = map(str, sorted(stops[stop]))
        except TypeError:  # '<' not supported between instances of 'str' and 'int'
            lines = map(str, stops[stop])

        lines_list = '{ "%s" }' % '", "'.join(lines)

        # add the previous row with comma
        if not first_row:
            lua.write(',\n')

        lua.write(f'    ["{stop}"] = {lines_list}')
        first_row = False

    lua.write('\n}\n\nreturn database\n')

logging.info(f"Gotowe")
