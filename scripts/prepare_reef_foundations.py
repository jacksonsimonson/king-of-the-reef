"""Prepare and inspect the art-only Reef catalog with the existing sprite pipeline."""
from pathlib import Path
import math
import json
import re
import sys
from PIL import Image, ImageDraw, ImageOps
from prepare_generated_sprite import prepare

ROOT = Path(__file__).resolve().parents[1]
USER_SOURCES = {
    'arrow-crab': (ROOT / 'art/source-references/user-supplied/arrow-crab.png', False),
    'bottlenose-dolphin': (ROOT / 'art/source-references/user-supplied/bottlenose-dolphin.png', False),
    'butterflyfish': (ROOT / 'art/source-references/user-supplied/butterflyfish.png', False),
    'cleaner-wrasse': (ROOT / 'art/source-references/user-supplied/cleaner-wrasse.png', False),
    'clown-triggerfish': (ROOT / 'art/source-references/user-supplied/clown-triggerfish.png', False),
    'flying-gurnard': (ROOT / 'art/source-references/user-supplied/flying-gurnard.png', False),
    'green-sea-turtle': (ROOT / 'art/source-references/user-supplied/green-sea-turtle-left-facing.png', True),
    'hawksbill-sea-turtle': (ROOT / 'art/source-references/user-supplied/hawksbill-sea-turtle-right-facing.png', False),
    'moorish-idol': (ROOT / 'art/source-references/user-supplied/moorish-idol.png', False),
    'pom-pom-crab': (ROOT / 'art/source-references/user-supplied/pom-pom-crab.png', False),
    'remora': (ROOT / 'art/source-references/user-supplied/remora-left-facing.png', True),
    'spotted-eagle-ray': (ROOT / 'art/source-references/user-supplied/spotted-eagle-ray.png', False),
    'stingray': (ROOT / 'art/source-references/user-supplied/stingray.png', False),
    'trumpetfish': (ROOT / 'art/source-references/user-supplied/trumpetfish.png', False),
    'yellow-tang': (ROOT / 'art/source-references/user-supplied/yellow-tang.png', False),
}
MIRROR_GENERATED = {
    'cowrie-snail', 'crown-conch', 'epaulette-shark', 'porcupinefish',
    'queen-angelfish',
}
NO_FACE = {
    'brain-coral', 'christmas-tree-worm', 'giant-clam', 'goose-neck-barnacle',
    'moon-jellyfish', 'barrel-sponge', 'chiton', 'feather-star', 'sea-anemone',
    'spanish-dancer', 'staghorn-coral', 'brittle-star', 'comb-jelly',
    'cushion-star', 'sand-dollar', 'tube-sponge', 'sea-cucumber', 'sea-hare',
    'sea-star', 'crown-of-thorns', 'sea-urchin',
}
EYES = {
    'epaulette-shark': [(47,39)],
    'coral-banded-shrimp': [(22,34),(25,32)],
    'crown-conch': [(41,46)],
    'spiny-lobster': [(39,33),(41,34)],
    'conch-snail': [(47,38),(51,40)],
    'cowrie-snail': [(51,38)],
    'porcupinefish': [(42,29)],
    'horseshoe-crab': [(24,20),(38,20)],
    'blue-tang': [(49,31)],
    'clownfish': [(47,32)],
    'queen-angelfish': [(52,31)],
    'blacktip-reef-shark': [(41,34)],
    'nurse-shark': [(44,43)],
}
sources = sorted((ROOT / 'art/source-references/reef-foundations').glob('*-generated.png'))
legacy = [ROOT / 'art/source-references/reef-cleanup' / f'{name}-generated.png' for name in ('sea-star','crown-of-thorns','sea-urchin')]
review_sources = sources + [source for source in legacy if source.exists()]
for source in review_sources:
    target = ROOT / 'public/assets/fish' / source.name.replace('-generated', '')
    direct = USER_SOURCES.get(target.stem)
    direct_source = direct[0] if direct else None
    revised = ROOT / 'art/source-references/reef-cleanup' / source.name
    if direct_source:
        source = direct_source
    elif revised.exists():
        source = revised
    if '--rebuild' not in sys.argv and target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        continue
    if direct_source:
        original = Image.open(source).convert('RGBA')
        if direct[1]:
            original = ImageOps.mirror(original)
        alpha = original.getchannel('A').point(lambda value: 255 if value >= 128 else 0)
        original.putalpha(alpha)
        original.save(target, optimize=True)
        continue
    with Image.open(source) as original:
        bounds = original.convert('RGBA').getchannel('A').point(lambda a: 255 if a >= 128 else 0).getbbox()
        cluster = max(22, math.ceil(max(bounds[2]-bounds[0], bounds[3]-bounds[1]) / 56))
    prepare(source, target, cluster)
    if target.stem in MIRROR_GENERATED:
        mirrored = ImageOps.mirror(Image.open(target).convert('RGBA'))
        mirrored.save(target, optimize=True)

sheet = Image.new('RGB', (1200, max(1, math.ceil(len(review_sources)/4)) * 240), '#00233a')
draw = ImageDraw.Draw(sheet)
for index, source in enumerate(review_sources):
    target = ROOT / 'public/assets/fish' / source.name.replace('-generated', '')
    sprite = Image.open(target).convert('RGBA')
    darkest = min((p for p in sprite.get_flattened_data() if p[3]), key=lambda p: sum(p[:3]))
    for eye in EYES.get(target.stem, []):
        assert sprite.getpixel(eye)[3] and sprite.getpixel((eye[0], eye[1]+1))[3], f'Eye outside creature: {target.stem} {eye}'
        # Two white native pixels on a dark socket remain legible at both sizes.
        # Keep the silhouette intact: the socket only replaces opaque pixels.
        for dy in range(-1, 3):
            for dx in range(-1, 2):
                point = (eye[0]+dx, eye[1]+dy)
                if sprite.getpixel(point)[3]:
                    sprite.putpixel(point, darkest)
        sprite.putpixel(eye, (255,255,255,255))
        sprite.putpixel((eye[0],eye[1]+1), (255,255,255,255))
    if EYES.get(target.stem):
        sprite.save(target)
    x, y = (index % 4)*300, (index // 4)*240
    sheet.paste(sprite.resize((192,192), Image.Resampling.NEAREST), (x,y), sprite.resize((192,192), Image.Resampling.NEAREST))
    sheet.paste(sprite, (x+200,y+64), sprite)
    draw.text((x+4,y+200), target.stem, fill='white')
    whites = sum(p == (255,255,255,255) for p in sprite.get_flattened_data())
    draw.text((x+4,y+218), 'Natural anatomy / no face' if target.stem in NO_FACE else f'White pixels: {whites}', fill='white' if whites or target.stem in NO_FACE else 'red')
    assert sprite.size == (64,64)
    assert set(sprite.getchannel('A').get_flattened_data()) <= {0,255}
    print(target.stem, 'white:', whites)
(ROOT / '.cache').mkdir(exist_ok=True)
sheet.save(ROOT / '.cache/reef-foundations-review.png')
for page, top in enumerate(range(0, sheet.height, 720), 1):
    sheet.crop((0,top,1200,min(top+720,sheet.height))).save(ROOT / f'.cache/reef-foundations-{page}.png')

if '--check' in sys.argv:
    definitions = (ROOT / 'src/game/data/reefArtCards.ts').read_text()
    cards = json.loads(definitions.split(' = ',1)[1].rstrip().removesuffix(';'))
    ids = [card['id'] for card in cards]
    existing = set(re.findall(r'id: "([^"]+)"', (ROOT / 'src/game/data/starterFish.ts').read_text()))
    assert len(ids) == len(set(ids)) == 46
    assert not existing.intersection(ids), 'Duplicate existing creature'
    assert set(ids) == {source.stem.removesuffix('-generated') for source in sources}
    for card in cards:
        assert card['edges'] and 'ability' not in card
        sprite = Image.open(ROOT / 'public/assets/fish' / f"{card['texture']}.png").convert('RGBA')
        assert card['id'] in EYES or card['id'] in NO_FACE or card['id'] in USER_SOURCES, f"Missing eye review: {card['id']}"
        for eye in EYES.get(card['id'], []):
            assert sprite.getpixel(eye) == (255,255,255,255)
            assert sprite.getpixel((eye[0],eye[1]+1)) == (255,255,255,255)
        whites = sum(p == (255,255,255,255) for p in sprite.get_flattened_data())
        large = sprite.resize((128,128), Image.Resampling.NEAREST)
        assert sum(p == (255,255,255,255) for p in large.get_flattened_data()) == whites*4
        if card['id'] not in USER_SOURCES:
            assert len(sprite.getcolors(4096)) <= 9
    assert not NO_FACE.intersection(EYES), 'Do not inject facial eyes into these creatures'
    assert MIRROR_GENERATED <= set(ids), 'Mirrored creature missing from Reef art catalog'
    assert all(source.exists() for source in legacy), 'Missing existing-creature cleanup source'
    for source in legacy:
        sprite = Image.open(ROOT / 'public/assets/fish' / source.name.replace('-generated','')).convert('RGBA')
        assert sprite.size == (64,64)
        assert set(sprite.getchannel('A').get_flattened_data()) <= {0,255}
    print('Verified 46 unique art cards, transparent 64px sprites, and species-specific eye treatment at 64px/128px.')
