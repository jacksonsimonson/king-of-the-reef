#!/usr/bin/env python3
"""Collapse generated pixel clusters into a crisp 64x64 game sprite."""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

from PIL import Image


CANVAS_SIZE = 64
DEFAULT_CLUSTER_SIZE = 20
OPAQUE_THRESHOLD = 128
OPAQUE_COLORS = 7
CLUSTER_SIZE_OVERRIDES = {
    "garden-eel-generated": 22,
    "hermit-crab-generated": 22,
    "flounder-generated": 22,
    "lionfish-generated": 22,
    "mantis-shrimp-generated": 22,
    "pufferfish-generated": 22,
    "boxfish-generated": 22,
    "needlefish-generated": 22,
    "seahorse-generated": 22,
    "electric-eel-generated": 22,
    "sea-urchin-generated": 22,
    "invisible-ink-squid-generated": 22,
    "moray-eel-generated": 22,
    "barracuda-generated": 23,
}

# Small species-specific corrections are applied after mechanical cluster collapse.
# Coordinates refer to the final 64x64 canvas. Every side-profile creature must
# finish with exactly one isolated white eye pixel in its visible eye socket.
EYE_TOUCHUPS = {
    "garden-eel-generated": {"eyes": [(45, 9)], "remove": []},
    "hermit-crab-generated": {"eyes": [(44, 18), (52, 20)], "remove": []},
    "flounder-generated": {"eyes": [(56, 28), (56, 33)], "remove": []},
    "lionfish-generated": {"eyes": [(51, 35)], "remove": []},
    "mantis-shrimp-generated": {"eyes": [(46, 13), (53, 13)], "remove": []},
    "pufferfish-generated": {"eyes": [(50, 27)], "remove": []},
    "boxfish-generated": {"eyes": [(49, 29)], "remove": []},
    "needlefish-generated": {"eyes": [(44, 31)], "remove": []},
    "seahorse-generated": {"eyes": [(36, 17)], "remove": []},
    "electric-eel-generated": {"eyes": [(49, 21)], "remove": []},
    "sea-urchin-generated": {"eyes": [(24, 31), (37, 31)], "remove": []},
    "invisible-ink-squid-generated": {"eyes": [(35, 32)], "remove": []},
    "moray-eel-generated": {"eyes": [(47, 20)], "remove": []},
    "anchovy-generated": {"eyes": [(57, 32)], "remove": [(60, 33), (56, 34)]},
    "goby-generated": {"eyes": [(55, 31)], "remove": []},
    "crab-generated": {"eyes": [(33, 30), (41, 28)], "remove": []},
    "blenny-generated": {"eyes": [(53, 29)], "remove": []},
    "shrimp-generated": {"eyes": [(46, 28)], "remove": []},
    "swordfish-generated": {"eyes": [(41, 33)], "remove": []},
    "barracuda-generated": {"eyes": [(51, 32)], "remove": []},
    "hypno-squid-generated": {"eyes": [(36, 30)], "remove": []},
    "lure-generated": {"eyes": [(20, 16)], "remove": []},
    "ocean-sunfish-generated": {"eyes": [(47, 29)], "remove": []},
}


def build_palette(source: Image.Image) -> list[tuple[int, int, int]]:
    preview_width = 256
    preview_height = max(1, round(preview_width * source.height / source.width))
    preview = source.resize((preview_width, preview_height), Image.Resampling.NEAREST)
    opaque_pixels = [pixel[:3] for pixel in preview.getdata() if pixel[3] >= OPAQUE_THRESHOLD]
    if not opaque_pixels:
        raise ValueError("Source contains no opaque pixels")

    strip = Image.new("RGB", (len(opaque_pixels), 1))
    strip.putdata(opaque_pixels)
    indexed = strip.quantize(
        colors=OPAQUE_COLORS,
        method=Image.Quantize.MEDIANCUT,
        dither=Image.Dither.NONE,
    )
    raw_palette = indexed.getpalette()
    used_indices = sorted(set(indexed.getdata()))
    return [tuple(raw_palette[index * 3:index * 3 + 3]) for index in used_indices]


def prepare(source_path: Path, output_path: Path, cluster_size: int) -> None:
    source = Image.open(source_path).convert("RGBA")
    mask = source.getchannel("A").point(
        lambda value: 255 if value >= OPAQUE_THRESHOLD else 0,
    )
    bounds = mask.getbbox()
    if bounds is None:
        raise ValueError(f"{source_path} contains no visible pixels")

    source = source.crop(bounds)
    mask = mask.crop(bounds)
    palette = build_palette(source)
    logical_width = max(1, round(source.width / cluster_size))
    logical_height = max(1, round(source.height / cluster_size))
    if logical_width > CANVAS_SIZE or logical_height > CANVAS_SIZE:
        raise ValueError(
            f"Collapsed sprite is {logical_width}x{logical_height}; "
            f"increase --cluster-size so it fits a {CANVAS_SIZE}x{CANVAS_SIZE} canvas",
        )

    source_pixels = source.load()
    mask_pixels = mask.load()
    logical = Image.new("RGBA", (logical_width, logical_height), (0, 0, 0, 0))
    logical_pixels = logical.load()

    def nearest_palette_index(color: tuple[int, int, int]) -> int:
        return min(
            range(len(palette)),
            key=lambda index: sum(
                (color[channel] - palette[index][channel]) ** 2
                for channel in range(3)
            ),
        )

    for logical_y in range(logical_height):
        source_y0 = round(logical_y * source.height / logical_height)
        source_y1 = round((logical_y + 1) * source.height / logical_height)
        for logical_x in range(logical_width):
            source_x0 = round(logical_x * source.width / logical_width)
            source_x1 = round((logical_x + 1) * source.width / logical_width)
            source_area = (source_x1 - source_x0) * (source_y1 - source_y0)
            represented_colors: list[int] = []
            for source_y in range(source_y0, source_y1, 2):
                for source_x in range(source_x0, source_x1, 2):
                    if mask_pixels[source_x, source_y]:
                        represented_colors.append(
                            nearest_palette_index(source_pixels[source_x, source_y][:3]),
                        )

            if len(represented_colors) < max(1, source_area // 16):
                continue
            palette_index = Counter(represented_colors).most_common(1)[0][0]
            logical_pixels[logical_x, logical_y] = (*palette[palette_index], 255)

    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(
        logical,
        ((CANVAS_SIZE - logical_width) // 2, (CANVAS_SIZE - logical_height) // 2),
    )

    touchup = EYE_TOUCHUPS.get(source_path.stem)
    if touchup:
        darkest = (*min(palette, key=lambda color: sum(color)), 255)
        for coordinate in touchup["remove"]:
            canvas.putpixel(coordinate, darkest)
        for coordinate in touchup["eyes"]:
            canvas.putpixel(coordinate, (255, 255, 255, 255))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--cluster-size", type=int)
    args = parser.parse_args()
    cluster_size = args.cluster_size or CLUSTER_SIZE_OVERRIDES.get(
        args.source.stem,
        DEFAULT_CLUSTER_SIZE,
    )
    prepare(args.source, args.output, cluster_size)


if __name__ == "__main__":
    main()
