---
title:  "Groove: A Radio Station as a Pure Function"
date:   2026-11-24 07:51:00
categories: music appstore
draft: false
summary: "How Kapell's Groove stations were made fast and private."
---

[Kapell](https://kapell.fm), my Apple Music player, recently got a new feature called a Groove. You hand it a song, an album, an artist, a producer, a studio, a label (whatever!) and it tries to play — it's still in beta, lol — an endless station that walks out from there through the people who _made_ the music. Not "people who liked this also liked that." Who mixed it, who produced it, who played bass on it, where it was recorded. Every track comes with the path that got there, so you can see _why_ it's playing. It's a souped-up, modern version of how I found and enjoyed music in my early life.

I want to yap about the backend, because I made a selfish choice early on: I wanted a Groove to work without having to store any state about the user. No favorites, no recent listens, etc. I think it's novel, as the Groove has ended up being a (kinda) pure function.

## The Function

Here's the whole engine's front door, more or less verbatim. It gives one page of a "station":

```go
func Next(g Graph, def Definition, st State,
    randSeed uint64, first int) (*Page, error)
```

Three inputs (and the graph):

- **Definition** is the "station": the seeds, plus the knobs. How far from the seed's era it may wander, how strict about genre, how familiar vs. obscure, how much it drifts, whether it's clean-only. Nothing about _you_.
- **State** is your session: what you've heard recently, what you skipped (and how far in!), what you favorited, the evolved seed set from the last page. **The client holds this, not the server.** It sends it up every time.
- **randSeed** is randomness, but not the kind you'd expect. More on this in a sec.
- **Graph** is the catalog, a snapshot of the credit graph. It's an interface with one method per read the engine makes.

And one thing comes out: a **Page** of tracks, each with its "why" path, plus the evolved seeds the client sends back next time.

## Where the Randomness Comes From

A radio station that plays the same thing every time is… a CD. A Groove needs randomness, but I didn't want _hidden_ randomness. So the API hashes the request itself:

```go
randSeed := fnv64a(json(station, seeds, recent, feedback, color, first, shuffleSeed))
page := Next(graph, def, state, randSeed, first)
```

That's the random seed. It sounds backwards, but it gives exactly the behavior I want:

- **A retry is safe.** Flaky cell connection? The client asks again, it gets the same page. No double-advancing.
- **Every page is different anyway**, because `recent` grows each time you listen. The request changes, so the hash changes, so the walk changes.
- **A new station is one integer away.** `shuffleSeed` is part of the hash. Bump it, new station, same everything else.
- **A bug report is replayable.** If something weird plays, I can rerun that exact request and watch it pick the same weird song, then step through why.

## The Walk

So what does the function actually _do_? It runs a bunch of short random walks over the credit graph and keeps the best places they land.

A page asks for some number of tracks (this is largely a tuning area of the client, which tends to only expose the "next" 3 tracks). It runs 30 walks per track, with a floor of 150 and a ceiling of 900. Each walk picks a seed weighted by importance, steps out through a connector (a person, studio, label, series or scene), and lands on a record. Then it flips a coin weighted by the station's _tether_ to decide whether to go home or take one more hop. Max two landings, because past that the "why" stops being something a human can follow. A real one looks like:

```
Midnight Marauders —mixer→ Bob Power —mixer→ Illadelph Halflife
```

Every landing passes through gates (era, genre, storefront availability, content rating, recently played, no compilations), and every rejection is recorded so a page that comes up short can say _which_ gate booted it out. The survivors get scored on familiarity, variety, your feedback, an artist cooldown, and so on, and the top ones become the page.

The walks run concurrently on six workers. That's the first place determinism gets tested, because goroutines finish in whatever order they please. The trick is that **each walk gets its own random stream**, derived from the page seed and the walk's index:

```go
walk[i].rng = PCG(pageSeed, i+1)
```

Results merge in walk order, not finish order. Walk #47 makes the same choices whether it ran first or last.

That _almost_ worked. The walks share a memo of loaded records, and one gate peeked at that memo to skip records cheaply. If walk #12 had already loaded a record, walk #47 could reject it early. If not, it got judged later, a different way. Same inputs, different page, depending on scheduling! This was frustrating and took a while to sort out. The fix was boring: load the record before gating. Dugh. It's a one-line comment in the code now, which belies the frustration it caused me.

## An Aside: The Station Definition

I've been saying "the knobs" like it's a couple of sliders. It isn't. A station Definition has sixteen fields, and one of them, the lens, holds nine more weights. That's about two dozen dials *before* your session adds its own steering (feedback, avoids, genre preferences). The defaults are a combination of gut feel, vibes, and listening. I wrote some CLI tooling to play with the output and see how it felt.

What makes this manageable is that every knob acts at exactly one stage of a page:

<svg viewBox="0 0 780 428" role="img" aria-labelledby="gv4t" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;margin:1.5em 0">
<title id="gv4t">Where each station knob acts. 1 start: seed weights, home share, color, grain pick where a walk begins. 2 step: the lens, tether and spread weight each edge; an edge's weight falls with how many credits the person has. 3 gate: era, genre, storefronts, content rating, avoids and record type pass or reject and never score. 4 score: path strength times a people bonus times a bell curve of popularity centered on familiarity, then likes, color and preferences. 5 pick: variety sets how often a weaker candidate gets picked, followed by the artist cooldown, spread cap and album runs; at variety 0 the top candidate wins 97% of the time, at variety 1 about half. 6 evolve: drift fades original seeds toward a 35% floor and evolved seeds until they drop out.</title>
<style>.gv4 text{font-family:var(--font-mono);font-size:10.5px;fill:var(--ink)}.gv4 .h{font-family:var(--font-head);font-size:13px}.gv4 .s{font-size:10px;fill:var(--ink-2)}.gv4 .t{font-size:9px;fill:var(--ink-2)}.gv4 .hd{fill:var(--accent);stroke:var(--ink);stroke-width:1.5}.gv4 .k{fill:var(--paper-2);stroke:var(--ink);stroke-width:1}.gv4 .st{fill:none;stroke:var(--ink-2);stroke-width:1;stroke-dasharray:3 3}.gv4 .p{fill:none;stroke:var(--rule);stroke-width:1}.gv4 .ax{stroke:var(--ink-2);stroke-width:1}.gv4 .c{fill:none;stroke:var(--ink);stroke-width:2}.gv4 .cd{fill:none;stroke:var(--ink-2);stroke-width:1.5;stroke-dasharray:4 3}.gv4 .bar{fill:var(--accent);stroke:var(--ink);stroke-width:1}</style>
<g class="gv4">
<rect class="hd" x="10" y="16" width="122" height="30" rx="6"/><text class="h" x="20" y="36">1 · start</text>
<rect class="hd" x="138" y="16" width="122" height="30" rx="6"/><text class="h" x="148" y="36">2 · step</text>
<rect class="hd" x="266" y="16" width="122" height="30" rx="6"/><text class="h" x="276" y="36">3 · gate</text>
<rect class="hd" x="394" y="16" width="122" height="30" rx="6"/><text class="h" x="404" y="36">4 · score</text>
<rect class="hd" x="522" y="16" width="122" height="30" rx="6"/><text class="h" x="532" y="36">5 · pick</text>
<rect class="hd" x="650" y="16" width="122" height="30" rx="6"/><text class="h" x="660" y="36">6 · evolve</text>
<rect class="k" x="14" y="58" width="114" height="20" rx="10"/><text x="24" y="72">seeds × weight</text>
<rect class="k" x="14" y="84" width="114" height="20" rx="10"/><text x="24" y="98">home</text>
<rect class="k" x="14" y="110" width="114" height="20" rx="10"/><text x="24" y="124">grain</text>
<rect class="st" x="14" y="136" width="114" height="20" rx="10"/><text x="24" y="150">color</text>
<rect class="k" x="142" y="58" width="114" height="20" rx="10"/><text x="152" y="72">lens (9)</text>
<rect class="k" x="142" y="84" width="114" height="20" rx="10"/><text x="152" y="98">tether .35</text>
<rect class="k" x="142" y="110" width="114" height="20" rx="10"/><text x="152" y="124">spread .5</text>
<rect class="st" x="142" y="136" width="114" height="20" rx="10"/><text x="152" y="150">recent</text>
<rect class="k" x="270" y="58" width="114" height="20" rx="10"/><text x="280" y="72">era ±3 years</text>
<rect class="k" x="270" y="84" width="114" height="20" rx="10"/><text x="280" y="98">genre: strict</text>
<rect class="k" x="270" y="110" width="114" height="20" rx="10"/><text x="280" y="124">storefronts</text>
<rect class="k" x="270" y="136" width="114" height="20" rx="10"/><text x="280" y="150">content rating</text>
<rect class="k" x="270" y="162" width="114" height="20" rx="10"/><text x="280" y="176">record type</text>
<rect class="st" x="270" y="188" width="114" height="20" rx="10"/><text x="280" y="202">avoid · genres</text>
<rect class="k" x="398" y="58" width="114" height="20" rx="10"/><text x="408" y="72">familiarity .5</text>
<rect class="k" x="398" y="84" width="114" height="20" rx="10"/><text x="408" y="98">subgenre</text>
<rect class="st" x="398" y="110" width="114" height="20" rx="10"/><text x="408" y="124">feedback</text>
<rect class="st" x="398" y="136" width="114" height="20" rx="10"/><text x="408" y="150">prefer ×2</text>
<rect class="k" x="526" y="58" width="114" height="20" rx="10"/><text x="536" y="72">variety .5</text>
<rect class="k" x="526" y="84" width="114" height="20" rx="10"/><text x="536" y="98">cooldown 8</text>
<rect class="k" x="526" y="110" width="114" height="20" rx="10"/><text x="536" y="124">spread cap</text>
<rect class="k" x="526" y="136" width="114" height="20" rx="10"/><text x="536" y="150">album run</text>
<rect class="k" x="654" y="58" width="114" height="20" rx="10"/><text x="664" y="72">drift .3</text>
<rect class="st" x="654" y="84" width="114" height="20" rx="10"/><text x="664" y="98">likes → seeds</text>
<text class="s" x="14" y="252">a walk picks a</text><text class="s" x="14" y="266">seed by weight;</text><text class="s" x="14" y="280">"home" is the share</text><text class="s" x="14" y="294">of walks that stay</text><text class="s" x="14" y="308">on seed artists</text>
<rect class="p" x="142" y="222" width="114" height="102"/>
<g transform="translate(0,-14)"><line class="ax" x1="146" y1="318" x2="252" y2="318"/><polyline class="c" points="146,258 158.6,277 172.5,291.5 185.1,299 199,303.7 225.5,308.5 252,310.9"/><text class="t" x="160" y="262">1.0</text><text class="t" x="214" y="300">.12</text><text class="t" x="146" y="331">credits, 1 → 10k</text></g>
<rect class="p" x="398" y="222" width="114" height="102"/>
<g transform="translate(0,-14)"><line class="ax" x1="402" y1="318" x2="508" y2="318"/><polyline class="c" points="402,310.8 412.6,304.2 423.2,292.6 433.8,277.3 444.4,263.6 455,258 465.6,263.6 476.2,277.3 486.8,292.6 497.4,304.2 508,310.8"/><polyline class="cd" points="402,277.3 412.6,263.6 423.2,258 433.8,263.6 444.4,277.3 455,292.6 465.6,304.2 476.2,310.8 486.8,313.8 497.4,314.8 508,315.1"/><text class="t" x="402" y="331">popularity 0 → 1</text></g><text class="t" x="402" y="234">fam .5 · - - .2</text>
<rect class="p" x="526" y="222" width="114" height="102"/>
<g transform="translate(0,-14)"><line class="ax" x1="530" y1="318" x2="636" y2="318"/><rect class="bar" x="534" y="259.8" width="12" height="58.2"/><rect class="bar" x="549" y="316.2" width="12" height="1.8"/><rect class="bar" x="564" y="317.6" width="12" height="0.4"/><rect class="bar" x="590" y="286.4" width="12" height="31.6"/><rect class="bar" x="605" y="299" width="12" height="19"/><rect class="bar" x="620" y="308.5" width="12" height="9.5"/><text class="t" x="534" y="254">97%</text><text class="t" x="590" y="281">53%</text><text class="t" x="530" y="331">var 0</text><text class="t" x="590" y="331">var 1</text></g>
<rect class="p" x="654" y="222" width="114" height="102"/>
<g transform="translate(0,-14)"><line class="ax" x1="658" y1="318" x2="764" y2="318"/><polyline class="c" points="658,258 684.5,277.4 711,290.5 729.6,297 764,297"/><polyline class="cd" points="658,258 684.5,291.4 711,306.2 732.2,311.8"/><text class="t" x="736" y="314">×</text><text class="t" x="728" y="291">35%</text><text class="t" x="658" y="331">pages →</text></g><text class="t" x="700" y="234">- - evolved</text>
<text class="s" x="142" y="346">edge ∝ lens</text><text class="s" x="142" y="360">  × specificity</text><text class="s" x="142" y="374">  × fatigue</text><text class="s" x="142" y="388">tether: P(stop)</text>
<text class="s" x="270" y="240">pass or reject.</text><text class="s" x="270" y="254">never a score.</text><text class="s" x="270" y="276">era and genre are</text><text class="s" x="270" y="290">measured from the</text><text class="s" x="270" y="304">original seed,</text><text class="s" x="270" y="318">so drift can't</text><text class="s" x="270" y="332">wander out of it</text>
<text class="s" x="398" y="346">Σ path strength</text><text class="s" x="398" y="360">  × people (≤3)</text><text class="s" x="398" y="374">  × bell(pop)</text><text class="s" x="398" y="388">  × likes, color</text>
<text class="s" x="526" y="346">variety = how</text><text class="s" x="526" y="360">often a weaker</text><text class="s" x="526" y="374">pick gets a shot;</text><text class="s" x="526" y="388">then the caps</text>
<text class="s" x="654" y="346">seeds ×(1−d/4)ⁿ</text><text class="s" x="654" y="360">new ×(1−d/2)ⁿ</text><text class="s" x="654" y="374">new seeds from</text><text class="s" x="654" y="388">your favorites</text>
<rect class="k" x="14" y="404" width="26" height="12" rx="6"/><text class="s" x="46" y="414">Definition</text><rect class="st" x="130" y="404" width="26" height="12" rx="6"/><text class="s" x="162" y="414">your session (State)</text>
</g>
</svg>

A few of these are more interesting than their names suggest. Speaking of names, having an LLM help with this was really great, as we all know naming is really hard. I was able to add capabilities and let the LLM generate fitting names and explanations for each as I honed in on the feel. Anyway, the knobs of note:

- **The lens** is nine weights, one per family of credit:

  | hands | players | samples | circle | writing | rooms | scene | labels | sleeve |
  |---|---|---|---|---|---|---|---|---|
  | 1.0 | 0.8 | 0.7 | 0.7 | 0.6 | 0.4 | 0.25 | 0.15 | 0 |

  Hands are producers, mixers and engineers. Circle is the artist's own bands and collaborators. Scene connects records by Apple subgenre with no person between them, and it stays low on purpose, because a station that runs on scene is just genre radio.
- **Specificity** isn't a knob, but it has a big impact on feel. An edge through a person is discounted by how many credits that person has: `log₂3 / log₂(2 + credits)`. An engineer with three records is a strong link; a session player on ten thousand is a weak one (0.12). Before it, a few prolific engineers dominated the resulting tracks.
- **Familiarity** isn't "more popular." It's the center of a bell curve over popularity (width 0.22, never below 0.05). At 0.5 you get the middle of the catalog, at 0.2 the deep cuts, and hits get _penalized_.
- **Variety** is how much of a gamble each pick is. At 0 the station almost always plays its strongest candidate (97% of the time, in the chart above). At 1 the strongest gets about half the picks, and weaker connections get a real shot.
- **Drift** is how fast the station forgets where it started. Every ten tracks, original seeds fade by `(1 − drift/4)` but never below 35% of their weight. Evolved seeds (picked from your favorites) fade twice as fast and drop out under 0.1. All of the per-page rates scale with page size, so a station played three tracks at a time evolves like one played ten at a time.
- **Gates never score.** The era, genre gate, storefront and content rating are fences. Scoring only decides between what's inside them, so a fence can never be outvoted by a high score.

And because all of it lives in one value, a station is just data. I was a bit intimidated by trying to create a UI for this, so Kapell instead ships with a few presets.

| Preset | What it does | How |
|---|---|---|
| Close Orbit | Stays near the seed and its people | Short walks, slow drift, a share of the seed's own artists, same subgenre |
| Deep Cuts | Same circle, less-played records | Familiarity turned way down, era widened a little |
| Wander | Follows the credits outward | Long walks, fast drift, a decade either way, neighboring genres allowed |
| Surprise | Lets go of the seed | Longest walks, fastest drift, any genre, a 25-year window, less-played records |
| Default | Whatever the engine does unprompted | Everything in the middle |

## The Catalog: Pure, But Only for Today

Hrm. That whole "deterministic" thing has a problem. MusicBrainz replicates into Kapell hourly. Apple's catalog feed lands daily. People (me, for one. i've been buying used CDs) keep adding credits. A function of the graph is only as pure as the graph is fixed, and it isn't. 😂

To hold things still, I take daily snapshots. This is also an opportunity for speeeeeeeed. A job called `groove-export` opens **one** `REPEATABLE READ` transaction against Postgres and writes out every read the engine could possibly make, as flat little-endian files. No parsing on the way back in. The reader memory-maps them and reinterprets the bytes in place.

That index gets published as an OCI image, just data, no code, to the cluster's registry. A commit bumps its digest and `stationd`, a little daemon that runs one pod per node, re-mounts the image as a volume. Rolling back yesterday's catalog is a `git revert`.

## Inside the Index

The index is 161 files and about 8 GB. Every file is a flat array of one fixed-size type: a `[]uint32`, a `[]uint64`, a run of 16-byte UUIDs, or a blob of string bytes with a `[]uint64` of end offsets beside it. Opening a file means `mmap` and a cast. There's no header to parse, no decoding, and no allocation until a result is built.

Four shapes are built out of those arrays:

- A **uuid set**: every MusicBrainz id in the export, sorted. An MBID's integer id is just its position, so nobody needs a hash table.
- A **dictionary**: every repeated string (relationship names, genres, storefronts) stored once, with a sorted permutation for reverse lookup. Interning these, along with a shared pool for lists, took the index from 11.3 GB to 8.1 GB.
- A **table**: sorted keys, and for each key a `start` and a count `n` into a set of row columns. One key's rows sit next to each other, already in the order Postgres would have returned them.
- A **two-part key**: two `uint32` ids packed into one `uint64`, so "this artist, under this relationship" is a single sorted key.

Here's how one read the engine makes all the time, "which records did Bob Power mix?", goes through those files:

<svg viewBox="0 0 780 510" role="img" aria-labelledby="gv3t" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;margin:1.5em 0">
<title id="gv3t">One read in the Groove index: which records did Bob Power mix? 1: binary-search his MBID in the sorted mbid file; his position, 48213, is his id. 2: look up "mixer" in the string dictionary: id 7. 3: pack the two ids into one 64-bit key. 4: binary-search the sorted out.key file; the same position in out.start and out.n says his rows start at 9120 and there are 16. 5: rows 9120 to 9135 of out.to and out.pop are his records, most popular first, so a limit is a slice. 6: each out.to value is a position in the mbid file, which gives the record's MBID. The ids are illustrative.</title>
<style>.gv3 text{font-family:var(--font-mono);font-size:11px;fill:var(--ink)}.gv3 .h{font-family:var(--font-head);font-size:14px}.gv3 .s{font-size:10.5px;fill:var(--ink-2)}.gv3 .t{font-size:9.5px;fill:var(--ink-2)}.gv3 .r{font-size:10.5px;fill:var(--ink)}.gv3 .c{fill:var(--paper-2);stroke:var(--ink);stroke-width:1}.gv3 .hl{fill:var(--accent);stroke:var(--ink);stroke-width:1.5}.gv3 .w{fill:var(--link-wash);stroke:var(--ink);stroke-width:1}.gv3 .div{stroke:var(--ink);stroke-width:1.5;stroke-dasharray:3 2}.gv3 .rail{stroke:var(--rule);stroke-width:2}.gv3 .num{fill:var(--ink)}.gv3 .nt{fill:var(--paper);font-size:11px;text-anchor:middle}</style>
<g class="gv3">
<line class="rail" x1="34" y1="30" x2="34" y2="470"/>
<circle class="num" cx="34" cy="30" r="11"/><text class="nt" x="34" y="34">1</text>
<text class="h" x="56" y="35">Find Bob Power</text>
<text class="s" x="56" y="53">every MBID, sorted. A binary</text>
<text class="s" x="56" y="67">search finds his; his position</text>
<text class="s" x="56" y="81">is his id.</text>
<rect class="c" x="330" y="30" width="84" height="24"/>
<text x="340" y="46">…</text>
<rect class="c" x="414" y="30" width="84" height="24"/>
<text x="424" y="46">4b2e9a…</text>
<text class="t" x="424" y="25">48212</text>
<rect class="hl" x="498" y="30" width="84" height="24"/>
<text x="508" y="46">51c0d3…</text>
<text class="t" x="508" y="25">48213</text>
<rect class="c" x="582" y="30" width="84" height="24"/>
<text x="592" y="46">5e88f1…</text>
<text class="t" x="592" y="25">48214</text>
<rect class="c" x="666" y="30" width="84" height="24"/>
<text x="676" y="46">…</text>
<text class="s" x="322" y="46" text-anchor="end">mbid</text>
<text class="r" x="508" y="70">→ id 48213</text>
<circle class="num" cx="34" cy="104" r="11"/><text class="nt" x="34" y="108">2</text>
<text class="h" x="56" y="109">Find "mixer"</text>
<text class="s" x="56" y="127">every repeated string is</text>
<text class="s" x="56" y="141">stored once and numbered.</text>
<rect class="c" x="330" y="104" width="84" height="24"/>
<text x="340" y="120">producer</text>
<text class="t" x="340" y="99">5</text>
<rect class="c" x="414" y="104" width="84" height="24"/>
<text x="424" y="120">engineer</text>
<text class="t" x="424" y="99">6</text>
<rect class="hl" x="498" y="104" width="84" height="24"/>
<text x="508" y="120">mixer</text>
<text class="t" x="508" y="99">7</text>
<rect class="c" x="582" y="104" width="84" height="24"/>
<text x="592" y="120">mastering</text>
<text class="t" x="592" y="99">8</text>
<rect class="c" x="666" y="104" width="84" height="24"/>
<text x="676" y="120">…</text>
<text class="s" x="322" y="120" text-anchor="end">dict</text>
<text class="r" x="508" y="144">→ id 7</text>
<circle class="num" cx="34" cy="178" r="11"/><text class="nt" x="34" y="182">3</text>
<text class="h" x="56" y="183">Pack one key</text>
<text class="s" x="56" y="201">two 32-bit ids side by side</text>
<text class="s" x="56" y="215">make one 64-bit number.</text>
<rect class="hl" x="414" y="178" width="168" height="24"/><line class="div" x1="498" y1="178" x2="498" y2="202"/>
<text x="424" y="194">48213</text><text x="508" y="194">7</text>
<text class="t" x="424" y="173">high 32 bits</text><text class="t" x="508" y="173">low 32 bits</text>
<text class="r" x="592" y="194">= key 48213·7</text>
<circle class="num" cx="34" cy="252" r="11"/><text class="nt" x="34" y="256">4</text>
<text class="h" x="56" y="257">Look the key up in out</text>
<text class="s" x="56" y="275">the keys are sorted, so it is</text>
<text class="s" x="56" y="289">another binary search. The same</text>
<text class="s" x="56" y="303">spot in start and n says where</text>
<text class="s" x="56" y="317">his rows are, and how many.</text>
<rect class="c" x="330" y="252" width="84" height="24"/>
<text x="340" y="268">48213·2</text>
<rect class="c" x="414" y="252" width="84" height="24"/>
<text x="424" y="268">48213·5</text>
<rect class="hl" x="498" y="252" width="84" height="24"/>
<text x="508" y="268">48213·7</text>
<rect class="c" x="582" y="252" width="84" height="24"/>
<text x="592" y="268">48213·9</text>
<rect class="c" x="666" y="252" width="84" height="24"/>
<text x="676" y="268">48214·2</text>
<text class="s" x="322" y="268" text-anchor="end">key</text>
<rect class="c" x="330" y="276" width="84" height="24"/>
<text x="340" y="292">8960</text>
<rect class="c" x="414" y="276" width="84" height="24"/>
<text x="424" y="292">9071</text>
<rect class="hl" x="498" y="276" width="84" height="24"/>
<text x="508" y="292">9120</text>
<rect class="c" x="582" y="276" width="84" height="24"/>
<text x="592" y="292">9136</text>
<rect class="c" x="666" y="276" width="84" height="24"/>
<text x="676" y="292">9150</text>
<text class="s" x="322" y="292" text-anchor="end">start</text>
<rect class="c" x="330" y="300" width="84" height="24"/>
<text x="340" y="316">111</text>
<rect class="c" x="414" y="300" width="84" height="24"/>
<text x="424" y="316">49</text>
<rect class="hl" x="498" y="300" width="84" height="24"/>
<text x="508" y="316">16</text>
<rect class="c" x="582" y="300" width="84" height="24"/>
<text x="592" y="316">14</text>
<rect class="c" x="666" y="300" width="84" height="24"/>
<text x="676" y="316">3</text>
<text class="s" x="322" y="316" text-anchor="end">n</text>
<text class="r" x="508" y="340">→ 16 rows from row 9120</text>
<circle class="num" cx="34" cy="374" r="11"/><text class="nt" x="34" y="378">5</text>
<text class="h" x="56" y="379">Read his rows</text>
<text class="s" x="56" y="397">his 16 mixes, already sorted</text>
<text class="s" x="56" y="411">most popular first, so a</text>
<text class="s" x="56" y="425">limit is just a slice.</text>
<rect class="hl" x="330" y="374" width="84" height="24"/>
<text x="340" y="390">7731052</text>
<text class="t" x="340" y="369">9120</text>
<rect class="w" x="414" y="374" width="84" height="24"/>
<text x="424" y="390">2204417</text>
<text class="t" x="424" y="369">9121</text>
<rect class="w" x="498" y="374" width="84" height="24"/>
<text x="508" y="390">6510943</text>
<text class="t" x="508" y="369">9122</text>
<rect class="w" x="582" y="374" width="84" height="24"/>
<text x="592" y="390">⋮</text>
<rect class="w" x="666" y="374" width="84" height="24"/>
<text x="676" y="390">3391820</text>
<text class="t" x="676" y="369">9135</text>
<text class="s" x="322" y="390" text-anchor="end">to</text>
<rect class="w" x="330" y="398" width="84" height="24"/>
<text x="340" y="414">.91</text>
<rect class="w" x="414" y="398" width="84" height="24"/>
<text x="424" y="414">.88</text>
<rect class="w" x="498" y="398" width="84" height="24"/>
<text x="508" y="414">.85</text>
<rect class="w" x="582" y="398" width="84" height="24"/>
<text x="592" y="414">⋮</text>
<rect class="w" x="666" y="398" width="84" height="24"/>
<text x="676" y="414">.12</text>
<text class="s" x="322" y="414" text-anchor="end">pop</text>
<circle class="num" cx="34" cy="456" r="11"/><text class="nt" x="34" y="460">6</text>
<text class="h" x="56" y="461">Back to an MBID</text>
<text class="s" x="56" y="479">each "to" is a position in</text>
<text class="s" x="56" y="493">mbid, the file from step 1.</text>
<rect class="c" x="330" y="456" width="84" height="24"/>
<text x="340" y="472">…</text>
<rect class="c" x="414" y="456" width="84" height="24"/>
<text x="424" y="472">9a01c2…</text>
<text class="t" x="424" y="451">7731051</text>
<rect class="hl" x="498" y="456" width="84" height="24"/>
<text x="508" y="472">b47e10…</text>
<text class="t" x="508" y="451">7731052</text>
<rect class="c" x="582" y="456" width="84" height="24"/>
<text x="592" y="472">c3f9d8…</text>
<text class="t" x="592" y="451">7731053</text>
<rect class="c" x="666" y="456" width="84" height="24"/>
<text x="676" y="472">…</text>
<text class="s" x="322" y="472" text-anchor="end">mbid</text>
<text class="r" x="508" y="496">→ the record Bob Power mixed</text>
</g>
</svg>

No query planner, no row decoding, no network. I considered using Parquet or Arrow for this, but with LLM help the creation of this index was pretty simple. We didn't really *need* them with this format, since we're not going to be scanning.

The hot parts of those 8 GB sit in the page cache, and the kernel handles the rest. And because every list is stored complete, the engine's knobs ("look at the top 40 records per hop") are slices taken when the page is served. I can retune the engine without rebuilding the index.

## What It Bought

Speed, mostly. My initial tests with Groove pages made around 2,900 Postgres queries and ate 83% of GraphQL server time. Same function, different `Graph`:

| | p50 | p95 |
|---|---|---|
| Postgres graph | 299 ms | 755 ms |
| Mapped index | 44 ms | 105 ms |

Under load on the cluster, a served station page runs about 24 ms p50 and 64 ms p95. Postgres doesn't hear about Groove at all anymore.

But the bits I'm happier about aren't the numbers:

- **The server keeps nothing about you.** Your session lives on your client and comes up with each request. Nothing in a station request is logged. There's no table of your listening to leak, because there's no table. Station responses are `no-store` too: deterministic doesn't mean shareable.
- **Testing is calm.** A fixture graph, a definition, a seed, assert the page. No mocks of time, no flaky ordering.
- **Reverts or adjustment are easy.** I can fall back to Postgres if I must, but it's also trivial to build new images and roll out changes to `stationd`.

## Go Groove

I was really excited when I started on this idea, but the impact on my backend was pretty frustrating. Making a "station" that felt good to me was really rewarding, so I was bummed it was slow. But, in 2026, we have LLMs and can turn around proofs of concept really fast. It cost me a daily export job, an 8 GB data image, that little `stationd` guy. But it turned the most complicated (server-side) feature in Kapell into the one I'm least worried about bringing things down.

If you've got Kapell, start a Groove from a record you love and tap the "why" on each track. Every path is a real credit somebody entered into [MusicBrainz](https://musicbrainz.org). Maybe go add a few. They'll show up tomorrow. :)
