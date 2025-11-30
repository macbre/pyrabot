#!/usr/bin/env python3
"""
Skrypt generujący dane o taborze obsługującym linie ZTM

https://gtfs.org/documentation/realtime/language-bindings/python/

https://www.ztm.poznan.pl/otwarte-dane/dla-deweloperow/
https://www.ztm.poznan.pl/pl/dla-deweloperow/getGtfsRtFile/?file=feeds.pb
https://www.ztm.poznan.pl/pl/dla-deweloperow/getGtfsRtFile/?file=vehicle_positions.pb

https://gtfs.org/documentation/realtime/feed-entities/trip-updates/
https://gtfs.org/documentation/realtime/feed-entities/vehicle-positions/
"""
import json
import logging
from collections import defaultdict
from dataclasses import dataclass
from os import path

import requests
from google.transit import gtfs_realtime_pb2
from google.protobuf.message import Message

from utils import HttpClient


@dataclass
class VehicleOnRoute:
    trip_id: str
    vehicle_id: str


def get_vehicles_on_routes():
    logger = logging.getLogger('get_vehicles_on_routes-tabor')
    feed = gtfs_realtime_pb2.FeedMessage()

    # response = requests.get('https://www.ztm.poznan.pl/pl/dla-deweloperow/getGtfsRtFile/?file=feeds.pb')
    response = requests.get('https://www.ztm.poznan.pl/pl/dla-deweloperow/getGtfsRtFile/?file=vehicle_positions.pb')
    response.raise_for_status()

    logger.info('Response HTTP %d (headers: %r)', response.status_code, response.headers)

    feed.ParseFromString(response.content)

    # with open('../../feeds.pb', 'rb') as f:
    #     feed.ParseFromString(f.read())

    vehicles_on_routes: dict[str, list[str]] = defaultdict(list)

    for entity in feed.entity:  # type: Message
        if entity.HasField('vehicle'):
            #   trip {
            #     trip_id: "7_5968537^+"
            #     schedule_relationship: SCHEDULED
            #     route_id: "158"
            #   }
            #   vehicle {
            #     id: "1762"
            #     label: "158/4"
            #   }
            #
            # https://github.com/google/transit/blob/master/gtfs-realtime/proto/gtfs-realtime.proto#L163-L164
            vehicle_on_route: Message = entity.vehicle
            vehicle = VehicleOnRoute(
                trip_id=vehicle_on_route.trip.route_id,
                vehicle_id=vehicle_on_route.vehicle.id
            )

            # for now - only tram lines (0-99)
            if len(vehicle.trip_id) > 2: continue

            # INFO:root:VehicleOnRoute(trip_id='13', vehicle_id='298')
            # https://czynaczas.pl/api/poznan/vehicle?id=0%2F298
            # brandModel	"105Na"
            # if vehicle.trip_id == '17':
            #     logging.debug('entity: %r', entity.ListFields())

            vehicles_on_routes[vehicle.trip_id].append(vehicle.vehicle_id)
            logger.debug(vehicle)

    # order by vehicle ID
    for route_id, vehicles_on_route in vehicles_on_routes.items():
        vehicles_on_routes[route_id] = sorted(vehicles_on_route)

    return vehicles_on_routes


class CzyNaCzasApiClient(HttpClient):
    """
    INFO:root:VehicleOnRoute(trip_id='13', vehicle_id='298')
    https://czynaczas.pl/api/poznan/vehicle?id=0%2F298
    brandModel	"105Na"
    """
    def __init__(self):
        super().__init__(user_agent='mozilla/pyrabot')
        self._logger = logging.getLogger('czy-na-czas-api')

    def get_vehicle_info(self, vehicle_id: str) -> dict:
        r = self._session.get(f'https://czynaczas.pl/api/poznan/vehicle?id=0%2F{vehicle_id}')
        r.raise_for_status()

        # "brand":"Konstal","brandModel":"105Na","productionYear":"1989",
        return r.json()[0]


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger('ztm-tabor')

    vehicles = []

    # 1, 2, ..., 9, 10, ..., 18
    for route, vehicles_on_route in sorted(get_vehicles_on_routes().items(), key=lambda item: int(item[0])):
        logging.info('Vehicles on route #%s: %r', route, vehicles_on_route)

        vehicles_brands: set[str] = set()

        for vehicle_id in vehicles_on_route:
            vehicle_info = CzyNaCzasApiClient().get_vehicle_info(vehicle_id)

            # "brand":"Konstal","brandModel":"105Na","productionYear":"1989",
            # Konstal 105Na
            vehicles_brands.add(f'{vehicle_info["brand"]} {vehicle_info["brandModel"]}')

        vehicles.append({
            'route_id': route,
            'vehicles': vehicles_on_route,
            'vehicles_brands': sorted(vehicles_brands)
        })

    # save to a file
    json_path = path.dirname(__file__) + '/../ztm-tabor.json'
    logger.info('Saving to vehicles data to %s ...', json_path)

    with open(json_path, 'wt') as f:
        json.dump(vehicles, fp=f, indent=2)

    logger.info('Done')
