import logging; logging.basicConfig(level=logging.INFO)

from mediawiki_dump.dumps import WikiaDump
from mediawiki_dump.reader import DumpReader

dump = WikiaDump('plpoznan')
pages = DumpReader().read(dump)

with_places_tag = [
    page.title
    for page in pages
    if '<place ' in page.content
]

logging.info('Pages found: %d', len(with_places_tag))

with open("pages.txt", mode="wt", encoding="utf-8") as fp:
    for entry in with_places_tag:
        fp.write(entry + "\n")

logging.info("pages.txt file created")
