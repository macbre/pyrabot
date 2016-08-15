#!/bin/sh
./ztm-stops-search.sh $1 | awk '{print $1}' | tr "\n" ","
echo ''
