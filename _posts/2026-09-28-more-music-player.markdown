---
layout: post
title:  "Kapell improves"
date:   2026-09-28 07:51:00
categories: music appstore
draft: false
summary: "Kapell is a dope music player for Apple Music"
---

I wrote a couple months ago about [Kapell](https://kapell.fm), an Apple Music player that aims to create a more thoughtful experience around music. I'm happy to report it's still going strong and a couple people have bought it. Gasp!

## The Setup

I work on Kapell "full-time" — in quotes because it's not an 8-hour-a-day endeavor. I stepped aside from my traditional full-time job about a month ago, and Kapell has made a great transition project. It gives me something interesting and fulfilling to work on most days.

Development is heavily user-driven. A few early users drop me feedback through Apple's TestFlight or email. The most important user, however, is _me_. I'm building Kapell to fit the journeys _I_ have with music and for what I want to get from it. That said, my users — few as they are — have tons of great ideas!

## Hosting

Kapell is built using dedicated hardware via [Hetzner](https://www.hetzner.com). My particular machines live in Helsinki, and I'm willing to trade the latency for the cost and convenience. I snagged some nice chassis from [Hetzner's Server Auction](https://www.hetzner.com/sb/) tool. The offerings tend to be many generations old, but now and then something a bit more recent comes up.

I hope to eventually have the justification to rent some modern machines, specifically with current-generation CPUs. While I _could_ afford to do so, I'm holding myself to a pretty slim budget until Kapell's purchases can cover the fees.

Dedicated machines are wildly cheaper than, say, EC2 instances. That said, everything is expensive now, so I take what I can get.

## Stack

I cover most of the stack on Kapell's [colophon](https://kapell.fm/colophon/).

The API is entirely written in Go, and client<>server comms are mostly in GraphQL. Proof of purchase comes from in-app App Store "receipts", signed AppTransaction JWS tokens that I can verify. There's also a straight API key I can hand out if I need to.

Storage is almost entirely Postgres. Extensions [pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html) and [unaccent](https://www.postgresql.org/docs/current/unaccent.html) round things out.

[DuckDB](https://duckdb.org) came in because Apple's Music feed is Parquet, but I've since leaned on it to build my own catalogs on the filesystem and swap them in with a symlink for the API to read. This avoids some of the overhead/churn of Postgres for daily updates, recomputations, and rematerializations as I read in data from various sources.

I use [ClickHouse](https://clickhouse.com) for logging anonymized API requests so I can do analytics on popular or under-enriched sources and keep an eye on things.

## Tools

I'm really enjoying building on dedicated hardware with no abstractions. I use Ansible, and while I guess it was nice at past jobs to have some platform-engineered wrapper around k8s, here I get to tune to exactly my use case. I know systemd is probably better, but I still reach for init.d. Old habits!

As an observability snob, I love [AppSignal](https://www.appsignal.com), which reduces the surface area down to just what I need, and provides solid MCP tooling for agent investigation and automation of dashboards and alerts. Its [process monitoring](https://www.appsignal.com/tour/process-monitoring) diligently verifies everything is running and working.

I've built a few admin tools, a bug tracker (right?), and an MCP server and keep them all on [Tailscale](https://tailscale.com). It's been eye-opening to create new tools that allow agents to query and poke at production both in terms of controls/limits they need, and new capabilities I can give them.

## Joy

There's been some doom and gloom on LinkedIn, etc., about the tech space.

I tell ya what, though: This is **really** fun. With modern tooling I can do the work of a team. Installing the OS, tuning the system, and building the backend have yielded a very fulfilling time. Hitting a tedious roadblock is so much less of a buzzkill when I can quickly research then 'chat' with that research. I've always been a talk-to-learn kinda person.

Kapell itself is such a perfect mix of my interests that I hope enough of you nerds buy it so I can justify building fancier features and adding some new toys to the backend. Do check it out!
