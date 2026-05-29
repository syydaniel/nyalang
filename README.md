# Nya · 猫猫语

A small **constructed cat language**: an invented lexicon, a light regular
grammar, and a hand-built **cat-glyph font** where every letter is drawn as a
cat. Type English, get Nya, render it as rows of kittens.

Built as the playful "猫猫语" mode for [syydaniel.github.io](https://syydaniel.github.io),
extracted here as a standalone language system.

```
Hello! I study water and plastic.
->  Nyao! Mi puwa miru pa puran nya.
```

## Phonology

- Consonants: `m n p r w y`, plus the clusters `ny mr pr`.
- Vowels: `a i u e o`.
- Optional codas: `n r`.
- Syllables are `(C)V(n/r)`; words are one to three syllables. So everything
  sounds like a content cat: *mi, nya, purwa, miapo, ranpa, mipuran*.

## Grammar

Nya is analytic and isolating (no conjugation). The rules are few and regular:

| Feature | Rule | Example |
| --- | --- | --- |
| Indefinite article | `a` / `an` are dropped | "a cat" -> "mau" |
| Definite article | `the` -> `na` | "the world" -> "na wora" |
| Plural | suffix `-mi` on the noun | "system" `pirun` -> "systems" `pirunmi` |
| Clause mood | a purr particle `nya` before a final `.` `!` `?` | "Mi puwa miru **nya**." |
| Word order | follows the source (analytic) | subject verb object |
| Unknown words | productive phonetic derivation (deterministic) | "retention" -> "nimromon" |

The fallback is deterministic: a given English word always derives the same Nya
word, so the language is internally consistent even beyond the core lexicon.

## Lexicon

~90 hand-made core words (pronouns, particles, common verbs, and the vocabulary
of the site: water, plastic, river, research, photography, university...). See
[`nya/nya.mjs`](nya/nya.mjs). A few:

```
i mi · we nau · you yu · the na · and pa · with wim · not nim · yes nya
water miru · river mirun · plastic puran · microplastic mipuran · world wora
research purwa · study puwa · photograph miapo · journey ranpa · cat mau · hello nyao
```

## Writing system

The **NyaGlyph** font ([`font/build-cat-font.py`](font/build-cat-font.py),
built with fontTools) maps each Latin letter, digit and common punctuation mark
to a little cat: cat faces (with eyes + whiskers), paws, sitting / stretching /
rolling cats, a paw-heart, fish, hearts and stars. Regenerate with:

```bash
python3 font/build-cat-font.py   # -> font/nyaglyph.woff
```

## Logographic writing (inspired by *Arrival*)

Nya can also be written **non-phonetically**, as circular logograms. There are
16 semantic **radicals** (atoms of meaning); every word is a transparent
composition of them arranged around one ring, so the writing is decipherable by
logic rather than by sound.

| radical | meaning | radical | meaning |
| --- | --- | --- | --- |
| self | self / I | place | place / ground |
| water | water | life | life / plant |
| flow | flow / move | change | change / time |
| big | big / great | many | many / plural |
| small | small | speak | speak / sound |
| see | see / know | feel | heart / feel |
| light | light | being | being / cat |
| made | made / artifact | not | not / negate |

Words are compositions:

```
water = water              river = water + flow        world = big + place
see   = see                research = see + many       study = see + self
made  = made               plastic = made + not + life
university = place + see    microplastic = small + made + not + life
journey = flow + self       hello = speak + feel
```

Grammar lives in the ring: a **plural** adds a dashed outer ring, **emphasis**
thickens the stroke, and unknown words fall back to hash-placed dots (distinct,
but non-semantic).

Crucially, a whole sentence is drawn as **one ring** (`renderSentence`), not a
row of separate glyphs: each word fuses onto the ring at its own sector, read
clockwise from a start dot, and a question opens a gap in the ring. This is the
holistic, non-linear mode (in the spirit of *Arrival*). See
[`nya/logogram.mjs`](nya/logogram.mjs) and the demo.

## Culture

Nya is cat-centred. Its radicals are the things that matter to a cat: *self,
beings, water, light, warmth (feel), place and territory, food and growth
(life), seeing, and change*. There is no indefinite article (a cat does not
count what it has not yet caught); plurals are a soft afterthought (`-mi`); and
every sincere utterance ends in a **purr** (`nya`). Speech radiates outward, the
way a purr fills a room.

## Usage

```js
import { translate } from 'nyalang'; // or './nya/nya.mjs'
translate('Research journey');       // "Purwa ranpa"
```

Pair it with the `@font-face` NyaGlyph font to display the result as cats.

## Demo

```bash
npm run demo   # python3 -m http.server 8080, then open /demo/
```

## Structure

```
nya/nya.mjs            # lexicon + grammar + translator (spoken Nya)
nya/logogram.mjs       # semantic radicals + compositional logogram renderer
font/build-cat-font.py # the cat-glyph font generator (fontTools)
font/nyaglyph.woff     # the built font
demo/index.html        # live translator + cat font + logograms + legend
```

## License

MIT. Have fun. 🐾
