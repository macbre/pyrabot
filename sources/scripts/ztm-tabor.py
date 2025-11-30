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
import logging
from collections import defaultdict
from dataclasses import dataclass

import requests
from google.transit import gtfs_realtime_pb2
from google.protobuf.message import Message


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


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger('ztm-tabor')

    vehicles = get_vehicles_on_routes()

    for route, vehicles_on_route in sorted(vehicles.items()):
        logging.info('Vehicles on route #%s: %r', route, vehicles_on_route)
