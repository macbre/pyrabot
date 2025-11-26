#!/usr/bin/env python3
"""
Skrypt generujący dane o taborze obsługującym linie ZTM

https://gtfs.org/documentation/realtime/language-bindings/python/
https://www.ztm.poznan.pl/pl/dla-deweloperow/getGtfsRtFile/?file=feeds.pb
"""
import logging
from collections import defaultdict
from dataclasses import dataclass

from google.transit import gtfs_realtime_pb2
from google.protobuf.message import Message


@dataclass
class VehicleOnRoute:
    trip_id: str
    vehicle_id: str


def main():
    feed = gtfs_realtime_pb2.FeedMessage()
    # response = requests.get('URL OF YOUR GTFS-REALTIME SOURCE GOES HERE')

    with open('../../feeds.pb', 'rb') as f:
        feed.ParseFromString(f.read())

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

            vehicles_on_routes[vehicle.trip_id].append(vehicle.vehicle_id)
            logging.debug(vehicle)

    for route_id in sorted(vehicles_on_routes.keys()):
        logging.info('Vehicles on route #%s: %r', route_id, vehicles_on_routes[route_id])


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger('ztm-tabor')

    main()
