from app.rules import build_alert_payload
from common_py.schemas import AlertSeverity


def main() -> None:
    print(
        build_alert_payload(
            severity=AlertSeverity.HIGH,
            title="Riesgo hidrico elevado",
            latitude=-24.12,
            longitude=-65.48,
        )
    )


if __name__ == "__main__":
    main()

