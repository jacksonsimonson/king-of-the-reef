"""Prepare and inspect the art-only Reef catalog with the existing sprite pipeline."""
from pathlib import Path
import math
import json
import re
import sys
from PIL import Image, ImageDraw
from prepare_generated_sprite import prepare

ROOT = Path(__file__).resolve().parents[1]
EYES = {
    'pom-pom-crab': [(25,21),(37,21)],
    'trumpetfish': [(44,31)],
    'brain-coral': [(26,36),(37,36)],
    'christmas-tree-worm': [(24,29),(43,31)],
    'epaulette-shark': [(15,39)],
    'remora': [(9,34)],
    'arrow-crab': [(29,29),(33,29)],
    'coral-banded-shrimp': [(22,34),(25,32)],
    'flying-gurnard': [(43,32)],
    'giant-clam': [(28,32),(35,32)],
    'goose-neck-barnacle': [(34,16),(38,18)],
    'moon-jellyfish': [(28,26),(34,26)],
    'barrel-sponge': [(27,24),(37,24)],
    'chiton': [(42,41),(46,39)],
    'crown-conch': [(22,46)],
    'feather-star': [(29,38),(34,38)],
    'sea-anemone': [(29,42),(34,42)],
    'spanish-dancer': [(53,40)],
    'staghorn-coral': [(31,48),(35,48)],
    'brittle-star': [(31,30),(34,30)],
    'comb-jelly': [(26,28),(34,28)],
    'cushion-star': [(28,32),(35,32)],
    'sand-dollar': [(24,22),(40,22)],
    'spiny-lobster': [(39,33),(41,34)],
    'tube-sponge': [(31,31),(35,31)],
    'conch-snail': [(51,38)],
    'cowrie-snail': [(12,38)],
    'porcupinefish': [(21,29)],
    'sea-hare': [(50,39)],
    'cleaner-wrasse': [(51,31)],
    'clown-triggerfish': [(48,30)],
    'horseshoe-crab': [(24,20),(38,20)],
    'moorish-idol': [(18,36)],
    'sea-cucumber': [(14,36),(17,34)],
    'blue-tang': [(49,31)],
    'bottlenose-dolphin': [(44,23)],
    'butterflyfish': [(43,34)],
    'clownfish': [(47,32)],
    'queen-angelfish': [(11,31)],
    'spotted-eagle-ray': [(39,35)],
    'yellow-tang': [(19,31)],
    'blacktip-reef-shark': [(41,34)],
    'green-sea-turtle': [(54,25)],
    'hawksbill-sea-turtle': [(50,16)],
    'nurse-shark': [(44,43)],
    'stingray': [(35,35)],
}
sources = sorted((ROOT / 'art/source-references/reef-foundations').glob('*-generated.png'))
for source in sources:
    target = ROOT / 'public/assets/fish' / source.name.replace('-generated', '')
    if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        continue
    with Image.open(source) as original:
        bounds = original.convert('RGBA').getchannel('A').point(lambda a: 255 if a >= 128 else 0).getbbox()
        cluster = max(22, math.ceil(max(bounds[2]-bounds[0], bounds[3]-bounds[1]) / 56))
    prepare(source, target, cluster)

sheet = Image.new('RGB', (1200, max(1, math.ceil(len(sources)/4)) * 240), '#00233a')
draw = ImageDraw.Draw(sheet)
for index, source in enumerate(sources):
    target = ROOT / 'public/assets/fish' / source.name.replace('-generated', '')
    sprite = Image.open(target).convert('RGBA')
    for eye in EYES.get(target.stem, []):
        sprite.putpixel(eye, (255,255,255,255))
    sprite.save(target)
    x, y = (index % 4)*300, (index // 4)*240
    sheet.paste(sprite.resize((192,192), Image.Resampling.NEAREST), (x,y), sprite.resize((192,192), Image.Resampling.NEAREST))
    sheet.paste(sprite, (x+200,y+64), sprite)
    draw.text((x+4,y+200), target.stem, fill='white')
    whites = sum(p == (255,255,255,255) for p in sprite.get_flattened_data())
    draw.text((x+4,y+218), f'White pixels: {whites}', fill='white' if whites else 'red')
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
        assert not card['edges'] and 'ability' not in card
        sprite = Image.open(ROOT / 'public/assets/fish' / f"{card['texture']}.png").convert('RGBA')
        assert card['id'] in EYES, f"Missing eye review: {card['id']}"
        for eye in EYES[card['id']]:
            assert sprite.getpixel(eye) == (255,255,255,255)
        whites = sum(p == (255,255,255,255) for p in sprite.get_flattened_data())
        large = sprite.resize((128,128), Image.Resampling.NEAREST)
        assert sum(p == (255,255,255,255) for p in large.get_flattened_data()) == whites*4
        assert len(sprite.getcolors(4096)) <= 9
    print('Verified 46 unique art cards, transparent 64px sprites, and white eyes at 64px/128px.')
