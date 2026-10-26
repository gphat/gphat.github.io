---
layout: post
title:  "Kapell Remote: Network Music Protocol"
date:   2026-10-26 07:51:00
categories: music appstore
draft: false
summary: "How Kapell's Remote lets one Mac drive another without streaming a single sample."
---

[Kapell 1.6 shipped](https://kapell.fm/blog/2026-10-27-release-160/) with a feature I've wanted since before Kapell had a name: [Remote](https://kapell.fm/remote/). One Mac running Kapell controls another Mac running Kapell. That's it. That's the feature! But getting there involved a few choices I'm pretty happy with and I wanna yap about 'em.

## Why I Care

I have a problem with hi-fi. I have a pretty good amplifier and CD transport. I started buying used CDs recently so I could enter data from them into [MusicBrainz](https://musicbrainz.org) which Kapell is a [bronze-tier sponsor of](https://metabrainz.org/supporters/tiers/2). That part works great! The problem is that the majority of music is streaming now, and streaming with hi-fi generally leads one to hi-fi _streamers_.

Streamers are hi-fi components — or even all-in-one boxes nowadays — that allow you to connect to the usual streaming suspects and pipe their music into your systems with audiophile connections. They commonly have a nice [DAC](https://en.wikipedia.org/wiki/Digital-to-analog_converter) or whatever. It's a common way to get modern streaming music onto your fancy-shmancy audio gear.

But here's my problem: Software/firmware on these devices are bad. Try them! Furthermore, do you think these companies will support future updates to their platforms when the underlying streamers change? Probably not, even though you might've paid _thousands_ of dollars for the device. On top of that, they'd like you pay [another monthly fee](https://roon.app/) to get the full audiophile, listening room experience. I don't want this vendor lockout stuff. I've got a lovely system I agonized over, delicately threading cables so power and signal never cross. It deserves more!

This is dumb. There's a better way. No, it's not Airplay. Airplay makes your phone/laptop/etc _stream_ audio, and it tops out at 16/44.1 which limits what your system can do.

The answer is that Mac mini you have laying around, which you bought in a fever dream of OpenClaw bliss, or that you've left sitting on a shelf for a few years. They used to be cheap, but I bet you have one laying around. Or an old laptop?

## A Remote, Not a Stream

So my design question was: what's the _least_ thing that has to cross the network?

Both Macs already have Apple Music and could have Kapell. Both can stream at full quality on their own. The receiver — the mini — doesn't *need* audio from the laptop. It needs to be _told what to play_.

**Remote is a protocol, not a stream.** The controller (my laptop or, in the future, phone) sends commands: play this list of tracks, skip, seek. The receiver (the mini) fetches from Apple Music itself and plays to its own DAC, then reports back what it's doing. No audio crosses the network. Your Wi-Fi can get back to buffering your kid's videos and hosting botnets. Slap a USB cable on that sucker and get it talking to your DAC. Full fidelity here you come.

To the controller, the receiver is just another output. You pick "Living Room Mini" from the same output picker you'd use to switch to headphones, and from then on every play button in the app goes there instead. There's no new queueing UI to learn, because there doesn't need to be one.

This allows your receiver to set its output to whatever formac your DAC can handle. [This is a bit tedious to set in macOS](https://kapell.fm/docs/set-sample-rate-audio-midi-setup/) but you only have to do it once.

### Commands Down, State Up

The wire is boring: length-framed JSON over a single TLS connection, with a protocol version on each message. No MusicKit or AppKit types cross the wire.

Commands go down: `play`, `playStation`, `playNext`, `transport`. State comes up: what's playing, the playhead, the queue, whether it's sounding or stalled (and _why_, so "Stations need Apple Music" on the mini shows up on the laptop rather than nowhere), and what the DAC is doing — device, sample rate, bit depth. That's the magic! Now you can set your output to be whatever ungodly format your high-end DAC can manage!

The playhead doesn't stream either. The receiver sends the elapsed time, the playback rate, and its clock at that instant. Every command gets an ack, and every command shows up in Kapell's telemetry rack on _both_ ends with its round-trip time. I'm an observability nerd at heart. I can't help it. :)

## Go Play

This is my favorite kind of feature: small surface, big value, fun to design. The whole thing is still in beta, since making a network protocol for music queuing is likely to have bugs. Check out the [Remote page](https://kapell.fm/remote/) for the pretty signal-path drawing, or [the docs](https://kapell.fm/docs/remote/) to set it up. If your Mac mini has been sitting on a shelf doing nothing, it finally has a job.
