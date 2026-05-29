// Generates a 3000+ word Nya dictionary: starts from the curated core, then
// fills with a broad spread of English words mapped to collision-free Nya words
// via the language's own phonetic derivation. Output: nya/lexicon.json (and a
// copy for the website at ../Personal websites/public/nya-lexicon.json).
//
// Run: node nya/build-lexicon.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { LEXICON, fallbackWord } from './nya.mjs';

const TARGET = 3200;
const NUC = ['a', 'i', 'u', 'e', 'o'];

// source of English words: the system word list, else a small built-in seed
let raw = [];
const dictPath = '/usr/share/dict/words';
if (existsSync(dictPath)) raw = readFileSync(dictPath, 'utf8').split('\n');
raw = raw.map((w) => w.trim().toLowerCase()).filter((w) => /^[a-z]{3,9}$/.test(w));
raw = [...new Set(raw)].sort();

// spread the sample across the whole alphabet (not just the a-words)
let words = raw;
if (raw.length > TARGET * 1.4) {
  const step = Math.floor(raw.length / (TARGET * 1.3));
  words = raw.filter((_, i) => i % step === 0);
}

const lex = { ...LEXICON };
const used = new Set(Object.values(lex).filter(Boolean));

function uniqueNya(word) {
  let w = fallbackWord(word);
  let n = 0;
  while ((used.has(w) || !w) && n < 12) {
    w += NUC[(word.charCodeAt(n % word.length) + n) % 5];
    n++;
  }
  return w;
}

// everyday vocabulary first, so the dictionary covers common words; then fill
// breadth from the spread sample.
const COMMON = ('time year people way day man thing woman life child world school state family student group country problem hand part place case week company system program work government number night point home water room mother area money story fact month lot right study book eye job word business issue side kind head house service friend father power hour game line end member law car city community name president team minute idea body back parent face level office door health person art war history party result change morning reason research girl guy moment air teacher force education foot boy age policy music market sense nation plan college interest death experience effect use class control care field development role effort rule heart sun light star moon sky cloud rain snow wind sea ocean river lake mountain hill tree flower grass forest leaf root fruit seed fish bird dog cat horse cow animal food bread milk egg meat rice tea coffee sugar salt color red blue green yellow black white good bad big small long short high low new old young hot cold fast slow happy sad easy hard early late strong weak rich poor clean dark deep wide warm cool fresh love hope dream truth peace mind soul voice sound dance song future past present evening winter summer spring autumn north south east west left walk run jump swim fly read write speak listen learn teach think know feel see hear give take make build grow move stop start play help eat drink sleep wake live die come go stay leave find lose win buy sell ask answer call meet like want need try keep hold turn show tell sing draw paint cook wash send carry follow lead create question beautiful science culture nature').split(' ');

for (const en of COMMON.concat(words)) {
  if (Object.keys(lex).length >= TARGET) break;
  if (!en || lex[en] !== undefined) continue;
  const nya = uniqueNya(en);
  used.add(nya);
  lex[en] = nya;
}

const sorted = Object.fromEntries(Object.keys(lex).sort().map((k) => [k, lex[k]]));
const json = JSON.stringify(sorted);
writeFileSync(new URL('./lexicon.json', import.meta.url), json);

// also ship a copy to the website (lazy-loaded only in 猫语 mode)
const sitePath = new URL('../../Personal websites/public/nya-lexicon.json', import.meta.url);
try {
  writeFileSync(sitePath, json);
  console.log('copied to website public/');
} catch (e) {
  console.warn('site copy skipped:', e.message);
}

console.log('lexicon entries:', Object.keys(sorted).length);
