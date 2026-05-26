from collections.abc import Sequence


def _safe_index(band_a: Sequence[float], band_b: Sequence[float]) -> list[float]:
    values: list[float] = []
    for a, b in zip(band_a, band_b, strict=True):
        denominator = a + b
        values.append(0.0 if denominator == 0 else round((a - b) / denominator, 4))
    return values


def compute_ndvi(nir: Sequence[float], red: Sequence[float]) -> list[float]:
    return _safe_index(nir, red)


def compute_ndwi(green: Sequence[float], nir: Sequence[float]) -> list[float]:
    return _safe_index(green, nir)


def compute_nbr(nir: Sequence[float], swir: Sequence[float]) -> list[float]:
    return _safe_index(nir, swir)

