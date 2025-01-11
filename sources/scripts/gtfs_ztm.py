#!/usr/bin/env python3
"""
Skrypt generujący plik JSON z listą linii tramwajowych i autobusowych na bazie danych GTFS

@see https://www.ztm.poznan.pl/pl/dla-deweloperow/gtfsFiles
"""
import json
import logging
import requests

from collections import OrderedDict

def download_file(url, local_filename):
    # NOTE the stream=True parameter below
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(local_filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192): 
                f.write(chunk)

        return r

# @see https://github.com/google/transitfeed/wiki/TransitFeed
import partridge

# logowanie
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('gfts-ztm')

# pobierz plik gtfs
url = 'https://www.ztm.poznan.pl/pl/dla-deweloperow/getGTFSFile'
path = '/tmp/gtfs_ztm.zip'

logging.info('Pobieram %s ...', url)
resp = download_file(url, local_filename=path)
logging.info('Response: %r', resp.headers)

logging.info('Odczyt pliku GTFS %s...', path)
feed = partridge.load_raw_feed(path)

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
    trasa = trasa.replace(' Pkm', ' PKM')

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

output = '/tmp/ztm-routes.json'
logging.info('Wyniki w %s', output)

with open(output, "wt") as f:
    json.dump({'lines': lines}, fp=f, indent=2)

logging.info('Gotowe')
