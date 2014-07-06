#!/usr/bin/env python
# -*- coding: utf-8 -*-
import csv
import json
import logging
import re

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger()


class CsvReader:
    """ Klasa bazowa do czytania plików CSV """
    csv = None
    items = {}

    def __init__(self, file_name, delimiter='\t'):
        csvfile = open(file_name)
        self.csv = csv.reader(csvfile, delimiter=delimiter)

        logger.info("Reading %s file..." % file_name)

    def get_csv_line(self):
        """ Pobieraj kolejne linie z pliku CSV """
        for line in self.csv:
            yield line

    def set_items(self, items):
        self.items = items

    def push_item(self, key, value):
        self.items[key] = value

    def get_items(self):
        return self.items.keys()

    # spróbuj zmienić kolejność słów w pobieranym kluczu
    # Marcinkowskiego Karola Aleje -> Aleje Karola Marcinkowskiego
    def get_item(self, key):
        if ' ' in key and key not in self.items:
            words = key.split(' ')
            words.reverse()
            key = ' '.join(words)

            #logger.debug("Key fallback for %s..." % key)

        return self.items[key] if key in self.items else None


class DlugoscUlic(CsvReader):
    """ Dane o długości ulic """
    column = 0

    def __init__(self, file_name, column):
        CsvReader.__init__(self, file_name, delimiter=',')
        self.column = column

    def read(self):
        streets = {}

        for line in self.get_csv_line():
            if not re.match('^\d+$', line[0]):
                continue

            street = line[1]
            length = int(line[self.column])

            # "4","*** bez nazwy ***","PG","N","145","845","6989"
            if 'bez nazwy' in street:
                continue

            # sumuj dlugosc
            if street not in streets:
                streets[street] = 0

            streets[street] += length

        self.set_items(streets)


class Numeracja(CsvReader):
    """ Dane o numeracji ulic """
    def read(self):
        streets = {}

        for line in self.get_csv_line():
            # line = ['ul.', 'Jesienna', '11']
            # indeksuj tylko ulice i aleje
            if line[0] != 'ul.' and line[0] != 'al.':
                continue

            if line[1] not in streets:
                streets[line[1]] = set()

            # numeracja
            matches = re.findall('(\d+)', line[2])
            if matches is None:
                continue

            # 82/239 -> nr domu / nr lokalu -> tylko pierwsza wartość
            if '/' in line[2]:
                matches = matches[0:1]
            # 183-185 -> zakres
            elif '-' in line[2]:
                matches = range(int(matches[0]), int(matches[-1]) + 1)
            # 10b
            # 84paw5
            else:
                matches = matches[0:1]

            for match in matches:
                streets[line[1]].add(int(match))

        # sortuj numery + usuń duplikaty
        for k, v in streets.iteritems():
            numbers = list(v)
            numbers.sort()

            # prefixy
            if k in ['Niepodległości', 'Armii Poznań', 'Wielkopolska']:
                k = 'aleja ' + k

            self.push_item(k, ', '.join(self.get_ranges(numbers)))

    @staticmethod
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


if __name__ == "__main__":
    # dane do JSONa
    res = {}
    missing_length = 0

    # numeracja ulic
    numeracja = Numeracja("sources/ulice-numeracja.csv", "\t")
    numeracja.read()

    # dlugości ulic
    dlugosci_podstawowe = DlugoscUlic("sources/ulice-ztm-podstawowy.csv", column=5)
    dlugosci_podstawowe.read()

    dlugosci_uzupelniajace = DlugoscUlic("sources/ulice-ztm-uzupelniajacy.csv", column=4)
    dlugosci_uzupelniajace.read()

    dlugosci_wewnetrzne = DlugoscUlic("sources/ulice-ztm-wewnetrzne.csv", column=5)
    dlugosci_wewnetrzne.read()

    # lista ulic
    items = numeracja.get_items()
    items.sort()

    # generuj dane do kolejnych ulic
    for street in items:
        numbers = numeracja.get_item(street)
        length = dlugosci_podstawowe.get_item(street)\
            or dlugosci_uzupelniajace.get_item(street)\
            or dlugosci_wewnetrzne.get_item(street)

        if length is None:
            logger.warning("Brak informacji o długości dla %s" % street)
            missing_length += 1

        res[street] = {
            'numeracja': numbers,
            'dlugosc': length
        }

    # zapisz do pliku
    f = open("db/ulice.json", 'w')
    json.dump(res, f, indent=True, sort_keys=True)
    f.close()

    logger.info("Zapisano dane o %d ulicach" % len(items))
    logger.info("Brakująca informacja o długości dla %d ulic" % missing_length)
