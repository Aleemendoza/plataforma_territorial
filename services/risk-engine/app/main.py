from app.scoring import classify_risk, compute_risk_score


def main() -> None:
    score = compute_risk_score(
        rainfall=0.9,
        slope=0.7,
        soil_humidity=0.8,
        vegetation_loss=0.2,
    )
    print("risk_score", score, "level", classify_risk(score))


if __name__ == "__main__":
    main()

