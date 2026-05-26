from datetime import datetime, timezone

from app.sources import SOURCES


def main() -> None:
    print("ingestion-service boot", datetime.now(timezone.utc).isoformat())
    for source in SOURCES:
        print(f"source={source['name']} cadence={source['cadence']} endpoint={source['endpoint']}")


if __name__ == "__main__":
    main()

