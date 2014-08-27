# -*- coding: utf-8 -*-
"""
Współdzielone klasy
"""

import logging
import requests


class NominatimApi(object):
    def __init__(self, base_url):
        self._logger = logging.getLogger('NominatimApi')

        self._base_url = base_url
        self._session = requests.session()
        self._headers = {
            'User-Agent': 'NominatimApi (+https://github.com/macbre/pyrabot)',
        }

    def _query(self, params):
        """
        Wysyła zapytanie do API i zwraca JSONa
        """
        self._logger.debug("<%s> %s", self._base_url, params)

        r = self._session.get(self._base_url, headers=self._headers, params=params)
        return r.json()


class Geo(NominatimApi):
    """
    @see http://wiki.openstreetmap.org/wiki/Nominatim#Search
    """
    def __init__(self, base_url="http://nominatim.openstreetmap.org/search"):
        super(Geo, self).__init__(base_url)

    def query(self, address, limit=1, addressdetails=0):
        data = self._query({
            "format": "json",
            "q": address,
            "addressdetails": addressdetails,
            "limit": limit
        })

        if data is None or len(data) < 1:
            return None

        # pierwszy punkt
        point = data[0]
        self._logger.info("Geo point found (%s, %s): %s", point['lat'], point['lon'], point['display_name'])

        return {
            "lat": float(point['lat']),
            "lon": float(point['lon'])
        }


class ReverseGeo(NominatimApi):
    """
    Reverse geocoding
    """
    def __init__(self, base_url="http://nominatim.openstreetmap.org/reverse"):
        super(ReverseGeo, self).__init__(base_url)

    def query(self, lat, lon):
        """
        Zwraca informacje o mieście i ulicy dla podanej lokalizacji
        """
        data = self._query({
            "lat": lat,
            "lon": lon,
            "format": "json"
        })

        if 'address' in data:
            details = data['address']
            self._logger.info('[%s] %s', data['osm_type'], details)

            # Folwarczna
            if 'road' in details:
                place = details['road']
            # M1 Centrum Handlowe
            elif 'address26' in details:
                place = details['address26']
            # Park Handlowy Franowo
            elif 'retail' in details:
                place = details['retail']
            else:
                return None

            self._logger.info('Place: %s (%s)', place, data['address']['county'])

            return {
                "city": data['address']['county'],
                "place": place,
            }

        return None
