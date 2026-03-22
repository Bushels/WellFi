import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a dark-background hero asset from the validated WellFi side-clamp render.",
    )
    parser.add_argument("--source", required=True, help="Source transparent PNG path.")
    parser.add_argument("--output", required=True, help="Output transparent PNG path.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source = Path(args.source)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    image = Image.open(source).convert("RGBA")
    rgba = np.array(image).astype(np.float32)
    rgb = rgba[..., :3]
    alpha = rgba[..., 3]

    # Bleed nearby opaque colors into translucent edge pixels so the asset
    # does not carry a white studio matte when composited on black.
    opaque_seed = alpha >= 220
    nearest = ndimage.distance_transform_edt(
        ~opaque_seed,
        return_distances=False,
        return_indices=True,
    )
    bled_rgb = rgb[nearest[0], nearest[1]]
    rgb = np.where(alpha[..., None] < 255, bled_rgb, rgb)

    luminance = rgb.mean(axis=2, keepdims=True)
    chroma = np.max(np.abs(rgb - luminance), axis=2, keepdims=True)

    steel_mask = (
        (luminance > 118)
        & (chroma < 22)
        & (alpha[..., None] > 0)
    ).astype(np.float32)
    pipe_mask = (
        (luminance > 16)
        & (luminance < 92)
        & (chroma < 18)
        & (alpha[..., None] > 0)
    ).astype(np.float32)

    steel_rgb = (rgb - 128.0) * 1.14 + 128.0
    steel_rgb[..., 1] *= 1.01
    steel_rgb[..., 2] *= 1.03

    pipe_rgb = rgb * 0.82
    pipe_rgb[..., 2] *= 0.95

    graded = rgb * (1.0 - steel_mask) + steel_rgb * steel_mask
    graded = graded * (1.0 - pipe_mask) + pipe_rgb * pipe_mask
    graded = np.clip(graded, 0, 255)

    result = Image.fromarray(
        np.dstack([graded, alpha]).astype(np.uint8),
        "RGBA",
    ).filter(ImageFilter.UnsharpMask(radius=1.4, percent=110, threshold=3))

    result.save(output)


if __name__ == "__main__":
    main()
