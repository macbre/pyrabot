#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Skrypt generujący wikitekst z listą ulic, placów, skwerów, mostów, ...
"""

import csv

points = {}

# czytaj z pliku CSV
with open("../geopoz.csv", "rt") as f:
    rows = csv.reader(f, delimiter="\t")

    for row in rows:
        # ul.     23 Lutego
        (category, name) = row

        name = name.\
            replace('abpa', 'Arcybiskupa').\
            replace('św.', 'Świętego').\
            replace('ks.', 'Księdza')

        if category == 'ul.':
            prefix = 'Ulica'
        elif category == 'al.':
            prefix = 'Aleja'
        elif category == 'os.':
            prefix = 'Osiedle'
        elif category == 'pl.':
            prefix = 'Plac'
        else:
            prefix = category.title()  # wiadukt -> Wiadukt

        if prefix not in points:
            points[prefix] = []

        points[prefix].append(prefix + ' ' + name)

# zapis do wikitekstu
with open("../../db/geopoz.wikitext", "w") as wikitext_output:
    for category, items in points.iteritems():
        wikitext_output.write("== {0} ==\n".format(category))

        for item in sorted(items):
            wikitext_output.write('* [[{0}]]\n'.format(item))

        wikitext_output.write("\n")
