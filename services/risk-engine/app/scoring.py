from common_py.schemas import RiskLevel


def compute_risk_score(
    rainfall: float,
    slope: float,
    soil_humidity: float,
    vegetation_loss: float,
) -> float:
    raw_score = (
        rainfall * 0.4
        + slope * 0.3
        + soil_humidity * 0.2
        + vegetation_loss * 0.1
    )
    return round(max(0.0, min(raw_score, 1.0)), 4)


def classify_risk(score: float) -> RiskLevel:
    if score >= 0.85:
        return RiskLevel.CRITICAL
    if score >= 0.65:
        return RiskLevel.HIGH
    if score >= 0.4:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW

