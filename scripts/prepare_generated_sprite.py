#!/usr/bin/env python3
"""Convert a generated pixel-art reference into a crisp 64x64 game sprite."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


CANVAS_SIZE = 64
VISIBLE_LIMIT = 58
OPAQUE_THRESHOLD = 128
PALETTE_COLORS = 7


def prepare(source_path: Path, output_path: Path) -> None:
    source = Image.open(source_path).convert("RGBA")
    alpha = source.getchannel("A").point(
        lambda value: 255 if value >= OPAQUE_THRESHOLD else 0,
    )
    source.putalpha(alpha)
    bounds = source.getbbox()
    if bounds is None:
        raise ValueError(f"{source_path} contains no visible pixels")

    creature = source.crop(bounds)
    scale = min(VISIBLE_LIMIT / creature.width, VISIBLE_LIMIT / creature.height)
    width = max(1, round(creature.width * scale))
    height = max(1, round(creature.height * scale))
    creature = creature.resize((width, height), Image.Resampling.NEAREST)

    rgb = Image.new("RGB", creature.size, (0, 0, 0))
    rgb.paste(creature.convert("RGB"), mask=creature.getchannel("A"))
    quantized = rgb.quantize(colors=PALETTE_COLORS, method=Image.Quantize.MEDIANCUT)
    colored = quantized.convert("RGBA")
    colored.putalpha(creature.getchannel("A"))

    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    x = (CANVAS_SIZE - width) // 2
    y = (CANVAS_SIZE - height) // 2
    canvas.alpha_composite(colored, (x, y))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    prepare(args.source, args.output)


if __name__ == "__main__":
    main()
