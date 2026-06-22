#!/usr/bin/env python3
"""
Skrypt generujący plik TSV z listą uchwał Rady Miasta Poznania wraz z linkowaniem jako źródło
"""

import csv
import json
import logging
import os

import requests

logging.basicConfig(level=logging.INFO)


# pobierz wszystkie uchwały
def get_all_resolutions():
    page = 1
    url = "https://bip.poznan.pl/api-json/bip/uchwaly/{page}/"

    http = requests.session()

    while True:
        res = http.get(url.format(page=page)).json()

        try:
            items: list|None = res["bip.poznan.pl"]["data"][0]["uchwaly"]["items"][0]["uchwala"]
        except (TypeError, ValueError):
            items = None

        logging.info(
            "Page #{} has {} items".format(page, len(items) if items else "no")
        )

        if items is None:
            return

        for item in items:  # type: dict[str, str]
            try:
                yield [
                    str(item["id"]),
                    item["symbol"],
                    item["data_podjecia"],
                    # <p>w sprawie nadania nazw ulicom.</p>
                    item["tytul"].replace("<p>", "").replace("</p>", ""),
                    "<ref>{{{{Uchwała RMP|{id}|{symbol}}}}}</ref>".format(**item),
                ]
            except UnicodeEncodeError:
                logging.error(
                    "UTF encoding failed for " + json.dumps(item), exc_info=True
                )

        last_item = items[-1]
        logging.info(f"Last item on the page from {last_item['data_podjecia']}")

        # next page
        page += 1


my_dir = os.path.dirname(os.path.abspath(__file__))

with open(my_dir + "/../../db/uchwaly-rmp.tsv", "w") as tsv:
    # @see https://docs.python.org/2.7/library/csv.html#csv.writer
    writer = csv.writer(tsv, delimiter="\t")

    for resolution in get_all_resolutions():
        writer.writerow(resolution)

logging.info("Done")
