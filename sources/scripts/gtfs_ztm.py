#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Skrypt generujący plik JSON z listą linii tramwajowych i autobusowych na bazie danych GTFS

@see https://www.ztm.poznan.pl/pl/dla-deweloperow/gtfsFiles
"""
import json
import logging

from collections import OrderedDict

# @see https://github.com/google/transitfeed/wiki/TransitFeed
import partridge

# logowanie
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('gfts-ztm')

path = 'gtfs_ztm.zip'

logging.info('Odczyt pliku GTFS %s...', path)
feed = partridge.raw_feed(path)

logging.info('Pobieram dane o liniach...')

routes = feed.routes
agency = feed.agency

# @see https://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.html
agencies = {}

for _, agency in feed.agency.iterrows():
    agencies[agency['agency_id']] = agency['agency_name']

logging.info('Znalezionych linii: %d', len(routes))

lines = []
for i, route in routes.iterrows():
    # print(route)

    # Dopiewo Dworzec Kolejowy - Ogrody
    trasa = route['route_long_name'].split('|')[0].lower().title()

    trasa = trasa.replace('Os. ', 'Osiedle ')
    trasa = trasa.replace('Pl. ', 'Plac ')
    trasa = trasa.replace('Uam ', 'UAM ')

    petle = trasa.split(' - ')

    entry = OrderedDict()
    entry['name'] = route['route_id']
    entry['typ'] = 'tram' if route['route_type'] == '0' else 'bus'
    entry['agency'] = agencies.get(route['agency_id'], '')
    entry['petle'] = petle
    entry['color1'] = route['route_color']
    entry['color2'] = route['route_text_color']

    lines.append(entry)

    logger.info('%s: %s', route['route_id'], ' - '.join(entry['petle']))

# print(lines)

logging.info('Gotowe')

with open("ztm-routes.json", "wt") as f:
    json.dump({'lines': lines}, fp=f, indent=2)
