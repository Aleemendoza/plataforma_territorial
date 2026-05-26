from app.processing import compute_nbr, compute_ndvi, compute_ndwi


def main() -> None:
    nir = [0.62, 0.71, 0.81]
    red = [0.21, 0.32, 0.38]
    green = [0.28, 0.35, 0.4]
    swir = [0.42, 0.51, 0.64]
    print("ndvi", compute_ndvi(nir, red))
    print("ndwi", compute_ndwi(green, nir))
    print("nbr", compute_nbr(nir, swir))


if __name__ == "__main__":
    main()

