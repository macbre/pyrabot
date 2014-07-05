#!/usr/bin/env python
# -*- coding: utf-8 -*-
import csv
import json
import re


def get_ranges(numbers):
    """ Generuje zakresy numerów """
    ranges = []
    curr = []

    for num in numbers + [100000]:
        # początek nowego zakresu
        if len(curr) is 0:
            curr = [num, num]
        # koniec zakresu?
        elif num - curr[1] > 1:
            if curr[0] is curr[1]:
                curr_range = "%d" % curr[0]
            else:
                curr_range = "%d-%d" % (curr[0], curr[1])

            ranges.append(curr_range)
            curr = [num, num]
        # kontynuuj zakres
        else:
            curr[1] = num

    return ranges

def read_data(file_name):
    """ Czytaj dane o ulicach z podanego pliku """
    csvfile = open(file_name)
    reader = csv.reader(csvfile, delimiter='\t')

    streets = {}

    for line in reader:
        # line = ['ul.', 'Jesienna', '11']
        # indeksuj tylko ulice
        if line[0] != 'ul.':
            continue

        if line[1] not in streets:
            streets[line[1]] = set()

        # numeracja
        # 10b
        matches = re.findall('(\d+)', line[2])
        if matches is None:
            continue

        # 82/239 -> nr domu / nr lokalu -> tylko pierwsza wartość
        if '/' in line[2]:
            matches = matches[0:1]

        # 183-185 -> zakres
        if '-' in line[2]:
            matches = range(int(matches[0]), int(matches[-1]) + 1)

        for match in matches:
            streets[line[1]].add(int(match))

    # sortuj numery + usuń duplikaty
    for k, v in streets.iteritems():
        numbers = list(v)
        numbers.sort()

        streets[k] = numbers
    return streets

if __name__ == "__main__":
    data = read_data("db/ulice-numeracja.csv")
    res = []

    for street, numbers in data.iteritems():
        res.append({
            'name': street,
            'nunbers': numbers,
            'ranges': get_ranges(numbers)
        })

    # zapisz do pliku
    f = open("db/ulice-numeracja.json", 'w')
    json.dump(res, f, indent=True)
    f.close()

    print "Zapisano dane o %d ulicach" % len(data)
