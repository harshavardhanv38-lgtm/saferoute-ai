# data/ — Dataset Directory

This directory contains only datasets that are explicitly licensed for redistribution.

## Current Contents

**Empty.** Infrastructure data is retrieved live from the OpenStreetMap Overpass API and is not cached to disk.

## Why No Data Files

- **OSM data:** Fetched on demand via Overpass API. Caching bulk OSM data locally would require careful compliance with the ODbL licence attribution requirements and would make the repository very large. See [DATA_SOURCES.md](../DATA_SOURCES.md) for attribution requirements.
- **ML training data:** No suitable real-world labelled dataset was found. See [DATA_SOURCES.md](../DATA_SOURCES.md) §2.

## If You Add Data

Any dataset added here must:
1. Have a documented source URL
2. Have a licence that permits redistribution
3. Be added to `DATA_SOURCES.md` with full provenance information
4. Not be synthetic or fabricated in any way

Do **not** add raw Overpass API JSON responses — they are large and change frequently.
