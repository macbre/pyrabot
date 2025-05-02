#!/usr/bin/env python3
#
# Skrypt generujący szablon nawigacyjny po liniach autobusowych
#
# @see http://poznan.wikia.com/wiki/Szablon:Nawigacja_Linie_autobusowe

import json
from math import floor
from typing import Iterator

def format_header(name: str) -> str:
    return f"<td align=\"right\">'''{name}''':</td>"


def format_line(num: int) -> str:
    return f'[[Linia autobusowa nr {num}|{num}]]'


def prepare_navigation() -> Iterator[str]:
    with open('./db/ztm-linie.json') as fp:
        data: dict[str, dict] = json.load(fp)
        lines = [int(key) for key in data.keys() if key.isdigit()]
        # print(lines)
        
		# Minibusy - 121+

		# Linie dzienne - 140+
        
		# Linie podmiejskie - 300+
        links: list[str] = []
        last_line = 0
        for num in range(300, 999):
            if num in lines and num not in [400, 416]:
                sep = ''
                if floor(last_line / 100) < floor(num/100):
                    sep = f'<!-- {floor(num/100) * 100}+ -->'

                links.append(sep + format_line(num))
                last_line = num

        yield format_header('Linie podmiejskie')
        yield '<td>'
        yield ' &middot; '.join(links)
        yield '</td>'

		# Nocne - 200+


if __name__ == "__main__":
    for line in prepare_navigation():
        print(line)
