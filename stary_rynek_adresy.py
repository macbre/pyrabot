#!/usr/bin/env python3
#
# Skrypt generujący linki do opisów kamienic przy Starym Rynku
#
adresy = list(range(38, 68 + 1)) + list(range(70, 94 + 1)) + ['95-96']+ list(range(97, 100 + 1))

for nr in adresy:
    print('[[Stary Rynek {nr}|{nr}]] &bull;'.format(nr=nr))
