#!/usr/bin/env python3
"""
Skrypt generujący plik JSON z listą linii tramwajowych i autobusowych na bazie danych GTFS

@see https://www.ztm.poznan.pl/pl/dla-deweloperow/gtfsFiles
"""
import json
import logging
import requests

from collections import defaultdict, OrderedDict
from os import getenv

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

# TODO: pobierz dane o długości linii
# https://czynaczas.pl/poznan/rozklad-jazdy-brygady
# $ chrome -H 'user-agent: mozilla' -s 'https://czynaczas.pl/api/poznan/brigades-timetable?date=2025-02-21' | jq . | less

# pobierz plik gtfs
# https://www.ztm.poznan.pl/wp-content/uploads/2024/07/Specyfikacja-GTFS-04.02.2022.pdf
url = 'https://www.ztm.poznan.pl/pl/dla-deweloperow/getGTFSFile'
path = '/tmp/gtfs_ztm.zip'

logging.info('Pobieram %s ...', url)
resp = download_file(url, local_filename=path)
logging.info('Response: %r', resp.headers)

logging.info('Odczyt pliku GTFS %s...', path)
feed = partridge.load_raw_feed(path)


# wyznacz przystanki na trasie per linia
logging.info('Pobieram dane o przystankach na trasach...')

# trasy w obie strony per linia
trips_per_line = defaultdict(dict)  # e.g. '5': {'here': '1_8739366', 'there': '1_8739365'}

# lista brygad na linii
brigades_per_line: dict[str, set[str]] = defaultdict(lambda: set())

#       route_id service_id       trip_id   trip_headsign direction_id shape_id wheelchair_accessible brigade
# 0            1          1  1_8737446^N+         Franowo            0  1188316                     1       1
for _, trip in feed.trips.iterrows():
    # 1_11376703^N,G:2:8+
    # + Oznaczenie kursu jako wariantu głównego
    is_main = str(trip['trip_id']).endswith('+')

    route_id: str = str(trip['route_id'])
    direction_name: str = 'there' if str(trip['direction_id']) == '1' else 'here'

    # if route_id not in ['1', '5', '7', '13']: continue  # DEBUG

    # ignorujemy wyjazdy i zjazdy do zajezdni
    if not is_main:
        continue

    # rejestruj wszystkie brygady na linii
    #
    # trips.txt
    # Zawiera opis kursów
    # direction_id 1 Kierunek 0-tam, 1-powrót
    # brigade 3 Numer brygady
    # if str(trip['direction_id']) == '0':
    brigades_per_line[route_id].add(trip['brigade'])
    # logger.info([route_id, brigades_per_line[route_id]])

    # 1_11376703^N,G:2:8+
    trip_id: str = str(trip['trip_id']).split('^')[0]

    if direction_name not in trips_per_line[route_id]:
        #               trip_id arrival_time departure_time stop_id stop_sequence stop_headsign pickup_type drop_off_type
        # 0        1_8737445^N+     05:36:00       05:36:00     221             0      JUNIKOWO           0             1
        # 1        1_8737445^N+     05:37:00       05:37:00     219             1      JUNIKOWO           0             0
        # 1127150   7_8737159^+     20:43:00       20:43:00    1143            28  RONDO ŚRÓDKA           1             0

        # find trips stop_id from the stop_times
        matching_stops = feed.stop_times[feed.stop_times['trip_id'] == trip['trip_id']]
        stop_ids = matching_stops['stop_id'].tolist() # e.g. ['1706', '1703', '1705', ...

        # now map them to stop codes
        stop_codes = [
            feed.stops[feed.stops['stop_id'] == stop_id]['stop_code'].tolist()[0]
            for stop_id in stop_ids
        ]
        # print(stop_ids, stop_codes); exit(1)

        logger.info(f"Linia {route_id} stops {direction_name}: {', '.join(stop_codes)}")
        trips_per_line[route_id][direction_name] = stop_codes


logging.info('Pobieram dane o liniach...')

# https://partridge.readthedocs.io/en/stable/
# https://github.com/remix/partridge/blob/master/partridge/gtfs.py#L61-L73
routes = feed.routes
agency = feed.agency

# @see https://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.html
agencies = {}

for _, agency in feed.agency.iterrows():
    agencies[agency['agency_id']] = agency['agency_name']

logging.info('Znalezionych linii: %d', len(routes))

lines = []
for i, route in routes.iterrows():
    # Dopiewo Dworzec Kolejowy - Ogrody
    trasa = route['route_long_name'].split('|')[0].lower().title()

    trasa = trasa.replace('Os. ', 'Osiedle ')
    trasa = trasa.replace('OS. ', 'OSIEDLE ')  # OSIEDLE SOBIESKIEGO
    trasa = trasa.replace('Pl. ', 'Plac ')
    trasa = trasa.replace('Uam ', 'UAM ')
    trasa = trasa.replace(' Pkm', ' PKM')

    petle = trasa.split(' - ')

    # Linia 12: STAROŁĘKA PKM - Starołęcka - Zamenhofa - Krzywoustego - Królowej Jadwigi - Matyi - Głogowska - Trasa PST - OSIEDLE SOBIESKIEGO
    przebieg = str(route['route_desc']).split('|')[0].split('^')[0]

    entry = OrderedDict()
    entry['name'] = route['route_id']
    entry['typ'] = 'tram' if route['route_type'] == '0' else 'bus'
    entry['agency'] = agencies.get(route['agency_id'], '')
    entry['petle'] = petle
    entry['przebieg'] = przebieg
    entry['color1'] = route['route_color']
    entry['color2'] = route['route_text_color']
    entry['przystankiSymbole'] = sorted(set(
        trips_per_line[route['route_id']].get('here', []) +
        trips_per_line[route['route_id']].get('there', [])
    ))
    entry['brygady'] = len(brigades_per_line[route['route_id']])  # liczba brygad na linii

    lines.append(entry)

    logger.info(f"Linia {route['route_id']}: {' - '.join(entry['petle'])} / {entry['przebieg']}")

# print(lines)

output = getenv('ROUTES_PATH', '../ztm-routes.json')
logging.info('Wyniki w %s', output)

with open(output, "wt") as f:
    json.dump({'lines': lines}, fp=f, indent=2)

logging.info('Gotowe')
