#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Skrypt generujący plik JSON z danymi z rejestru zabytków

@see http://poznan.wuoz.gov.pl/rejestr-zabytkow
"""

import csv
import datetime
import json

import locale
locale.setlocale(locale.LC_ALL, '')

zabytki = []

# czytaj z pliku CSV
with open("../zabytki.csv", "rt") as f:
    rows = csv.reader(f, delimiter=",")

    rows.next()

    for row in rows:
        if len(row) < 5 or row[1] == '':
            continue

        # ,"Gajowa ul. 1","Zespół zajezdni tramwajowej","A 467","2002.01.08"
        (_, address, name, entry, date) = row[:5]

        # A 467 -> A-467
        entry = entry.replace(' ', '-').upper()
        # Bydgoska ul. 4 a -> Bydgoska 4 a
        address = address.replace(' ul.', '')

        # 1990.10.19 -> [[19 października]] [[1990]] r.
        data = date.split('.')
        data = map(int, data)
        ts = datetime.date(year=data[0], month=data[1], day=data[2])

        template = "{{{{Zabytek|{}|[[{} {}]] [[{}]] r.}}}}".format(entry, data[2], ts.strftime('%B'), data[0])

        zabytki.append({
            "nazwa": name,
            "adres": address,
            "wpis": entry,
            "data": date,
            "szablon": template
        })

# JSON
with open("../../db/zabytki.json", "w") as f:
    json.dump(zabytki, f, indent=True, sort_keys=True)
