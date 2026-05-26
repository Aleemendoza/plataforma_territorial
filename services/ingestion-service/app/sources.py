SOURCES = [
    {
        "name": "open-meteo-forecast",
        "endpoint": "https://api.open-meteo.com/v1/forecast",
        "cadence": "1h",
    },
    {
        "name": "open-meteo-flood",
        "endpoint": "https://flood-api.open-meteo.com/v1/flood",
        "cadence": "6h",
    },
    {
        "name": "nasa-firms-area",
        "endpoint": "https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/{SOURCE}/{BBOX}/{DAY_RANGE}",
        "cadence": "30m",
    },
]
