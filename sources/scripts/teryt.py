#!/usr/bin/env python3
"""
Skrypt generujący plik TSV z listą ulic, placów, rond na podstawie zrzutu danych z bazy TERYT

https://eteryt.stat.gov.pl/
"""

import csv
import logging
import os
from xml.etree import ElementTree

logging.basicConfig(level=logging.INFO)
my_dir = os.path.dirname(os.path.abspath(__file__))
logging.info(f"My directory is: {my_dir}")

def iterate_teryt_entries() -> iter[dict]:
    with (open(my_dir + "/../teryt-ulice.xml", "r") as input_file):
        logging.info(f"Parsing XML from {input_file.name} ...")
        tree = ElementTree.parse(input_file)

        # <!--Informacje podstawowe:
        #  Nazwa katalogu: ULIC,
        #  Zawartość: część,
        #  Czas utworzenia: 20.06.2026 20:55:15.
        # -->
        # <ULIC>
        #   <row>
        #     <WOJ>30</WOJ>
        #     <POW>64</POW>
        #     <GMI>01</GMI>
        #     <RODZ_GMI>1</RODZ_GMI>
        #     <SYM>0969400</SYM>
        #     <SYM_UL>51915</SYM_UL>
        #     <CECHA>al.</CECHA>
        #     <NAZWA_1>Pułku Ułanów Poznańskich</NAZWA_1>
        #     <NAZWA_2>15</NAZWA_2>
        #     <STAN_NA>2026-06-19</STAN_NA>
        #   </row>
        #
        #     <CECHA>inne</CECHA>
        #     <NAZWA_1>zaułek Stanisława Zierhoffera</NAZWA_1>
        #     <NAZWA_2 />
        for item in tree.getroot().findall('row'):
            # 'CECHA': 'ul.', 'NAZWA_1': 'Staszica', 'NAZWA_2': 'Stanisława'
            # 'CECHA': 'os.', 'NAZWA_1': 'Stefana Batorego', 'NAZWA_2': None
            item_data: dict[str, str] = {
                node.tag: node.text or ''
                for node in item.iter()
            }
            logging.debug(f"Found item: {item_data}")

            # https://github.com/macbre/pyrabot/commit/9e24b15396928304ad33a567c778b60dfc9539ba
            # ul. -> Ulica
            # os. -> Osiedle
            # al. -> Aleja
            # pl. -> Plac
            cecha = item_data['CECHA']

            if cecha == 'inne':
                cecha = ''
            elif cecha == 'ul.':
                cecha = 'Ulica'
            elif cecha == 'os.':
                cecha = 'Osiedle'
            elif cecha == 'al.':
                cecha = 'Aleja'
            elif cecha == 'pl.':
                cecha = 'Plac'

            yield ' '.join([
                cecha.capitalize().capitalize(),
                item_data['NAZWA_2'].title(),
                item_data['NAZWA_1'],
            ]).\
            replace('  ', ' ').\
            replace('zaułek ', 'Zaułek ').\
            replace('wiadukt ', 'Wiadukt ').\
            lstrip()


with open(my_dir + "/../../db/teryt.csv", "w") as csv_file:
    # @see https://docs.python.org/2.7/library/csv.html#csv.writer
    writer = csv.writer(csv_file)

    for idx, entry in enumerate(iterate_teryt_entries()):
        logging.info(f"#{idx} | Writing entry: {entry}")
        writer.writerow([entry])

logging.info("Done")
