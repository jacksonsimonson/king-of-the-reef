"""Build an integer-scale review sheet; never alters game assets."""
from pathlib import Path
from PIL import Image, ImageDraw
ids = ["garden-eel", "hermit-crab", "flounder", "lionfish", "mantis-shrimp", "pufferfish", "boxfish", "needlefish", "seahorse", "electric-eel", "sea-urchin", "invisible-ink-squid", "moray-eel"]
ids += ["parrotfish", "pistol-shrimp", "frogfish", "stonefish", "titan-triggerfish", "crown-of-thorns", "decorator-crab", "coral-grouper"]
sheet = Image.new("RGB", (1120, ((len(ids) + 3) // 4) * 220), "#00233a")
draw = ImageDraw.Draw(sheet)
for i, name in enumerate(ids):
    sprite = Image.open(Path("public/assets/fish") / (name + ".png")).convert("RGBA")
    x, y = (i % 4) * 280, (i // 4) * 220
    sheet.paste(sprite, (x + 12, y + 35), sprite)
    large = sprite.resize((128, 128), Image.Resampling.NEAREST)
    sheet.paste(large, (x + 100, y + 24), large)
    draw.text((x + 12, y + 170), name, fill="white")
    whites = [(px, py) for py in range(64) for px in range(64) if sprite.getpixel((px, py)) == (255,255,255,255)]
    assert sprite.size == (64, 64), name
    assert set(sprite.getchannel("A").get_flattened_data()) <= {0, 255}, name
    expected = 0 if name in ["sea-urchin", "crown-of-thorns"] else (2 if name in ["hermit-crab", "flounder", "mantis-shrimp", "pistol-shrimp", "decorator-crab"] else 1)
    assert len(whites) == expected, name
    assert sum(pixel == (255, 255, 255, 255) for pixel in large.get_flattened_data()) == len(whites) * 4, name
    assert len(sprite.getcolors(4096)) <= 9, name
    print(name, sprite.getbbox(), "white pixels", whites)
Path(".cache").mkdir(exist_ok=True)
sheet.save(".cache/reef-art-review.png")
