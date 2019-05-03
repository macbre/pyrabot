#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Skrypt importujący dane z bazy Geopozu dot. ulic, mostów, wiaduktów, osiedle, parków i skwerów

Dane o ulicach uzupełniane są przez kody pocztowe oraz informację o długości ulicy (źródło: ZDM)
"""

import csv
import json
import logging
import re

from collections import defaultdict

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger()


def get_ranges(numbers):
    """
    Generuje zakresy numerów

    :type numbers list[int]
    """
    ranges = []
    curr = []

    for num in numbers + [100000]:
        # początek nowego zakresu
        if len(curr) is 0:
            curr = [num, num]
        # koniec zakresu?
        elif num - curr[1] > 1:
            if curr[0] is curr[1]:
                curr_range = "%d" % curr[0]
            else:
                curr_range = "%d-%d" % (curr[0], curr[1])

            ranges.append(curr_range)
            curr = [num, num]
        # kontynuuj zakres
        else:
            curr[1] = num

    return ranges


if __name__ == "__main__":
    # dane do JSONa
    ulice = {}
    osiedla = {}

    data = defaultdict(lambda: dict(
        dzielnica='',
        numery=list(),
        kody=set()
    ))

    with open('sources/geopoz.csv') as csvfile:
        rows = csv.reader(csvfile, delimiter=';', quotechar='"')

        # przeskocz dwa pierwsze wiersze
        next(rows)
        next(rows)

        for row in rows:
            # "Rodzaj";"Nazwa";"Nazwa";"TERYT";"Nazwa";"TERYT";"Numer porządkowy";"Kod pocztowy";"X";"Y";
            # print(row)
            (_, dzielnica, _, _, name, _, numer, kod_pocztowy, geo_x, geo_y) = row

            # print(nazwa, numer, kod_pocztowy)
            numer = re.sub(r'paw\d+', '', numer)  # 39paw1
            numer = re.sub(r'(/|-)[0-9a-z]+$', '', numer)  # 29/33a -> 29
            numer = re.sub(r'[^0-9]', '', numer)

            data[name]['dzielnica'] = dzielnica
            data[name]['numery'].append(int(numer))
            data[name]['kody'].add(kod_pocztowy)

    #
    # generuj dane dla plików JSON
    #
    for name, item in data.items():
        numbers = sorted(item['numery'])
        zip_codes = sorted(list(item['kody']))
        dzielnica = item['dzielnica']

        # tylko ulice i aleje
        if str(name).startswith('al.') or str(name).startswith('ul.'):
            name = re.sub(r'^(al|ul)\.\s', '', name)

            ulice[name] = {
                'numeracja': ', '.join(get_ranges(numbers)) if numbers is not None else False,
                'kody_pocztowe': ','.join(zip_codes) if zip_codes is not None else None,
                'dzielnica': dzielnica if dzielnica is not None else False,
                # 'dlugosc': length,
            }

        # osiedla
        elif str(name).startswith('os.'):
            name = re.sub(r'^(os)\.\s', '', name)

            osiedla['Osiedle {}'.format(name)] = {
                'numeracja': ', '.join(get_ranges(numbers)) if numbers is not None else False,
                'kody_pocztowe': ','.join(zip_codes) if zip_codes is not None else None,
                'dzielnica': dzielnica if dzielnica is not None else False,
                # 'dlugosc': length,
            }

    #
    # zapisz do pliku
    #

    # ulice
    with open("db/ulice.json", 'w') as f:
        json.dump(ulice, f, indent=True, sort_keys=True)

    logger.info("Zapisano dane o %d ulicach" % len(ulice.keys()))

    # osiedla
    with open("db/osiedla.json", 'w') as f:
        json.dump(osiedla, f, indent=True, sort_keys=True)

    logger.info("Zapisano dane o %d osiedlach" % len(osiedla.keys()))
