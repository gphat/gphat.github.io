---
title:  "The CASE Method: Better Monitoring For Humans"
date:   2019-04-09 07:49:00
categories: monitoring
summary: "A framework for improved monitoring ergonomics, mental models, and attention."
image: /assets/images/case-logo.png?201
---

Riiiiiiing! It’s 3am and you’ve just been dreaming about something great then poof: the phone rings. You’re on call this week and something seems to’ve gone awry. Automated systems are beckoning you to assess the situation and take action. Welcome to a critical point in running modern computer systems. Let’s talk about how to make alerting better for humans.

I’d like to introduce a philosophy for monitoring borne from my decades of on-call experience, my role in multiple large observability teams, and heavy influence from Rob Ewaschuk’s seminal [My Philosophy on Alerting](https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q/edit#heading=h.6ammb5h32uqq) — which has since been encoded into the [Google SRE book](https://landing.google.com/sre/sre-book/toc/index.html) — and John Allspaw’s [Considerations for Alert Design](https://www.slideshare.net/jallspaw/alert-designcac-talk2013).

_Thanks to [Kelly Dunn](https://twitter.com/kellyleland), [Arijit Mukherji](https://twitter.com/arijit_mukherji), and [Maxime Petazzoni](https://twitter.com/mpetazzoni) for reviewing this post._

# What is CASE?

Inspired by [Brendan Gregg’s USE Method](http://www.brendangregg.com/usemethod.html) and [Tom Wilkie’s RED Method](https://www.weave.works/blog/the-red-method-key-metrics-for-microservices-architecture/) I have backronymed a method. I call it **the CASE Method** and it defines four points that a team should consider and maintain when working with automated monitoring:

* [**C**ontext-heavy](#context-heavy)
* [**A**ctionable](#actionable)
* [**S**ymptom-based](#symptom-based)
* [**E**valuated](#evaluated)

Using CASE, an organization will have a healthy skepticism about interrupting humans. Monitoring will be evaluated regularly for value and effectiveness. Humans will have better mental models and greater confidence when alerted.

To get catchy for a second, the idea is that you need to make a CASE for each alert’s existence. :sunglasses:

# Why do we need this?
[On call can suck](https://medium.com/@copyconstruct/on-call-b0bd8c5ea4e0). There are a lot of reasons for this and CASE won’t help you fix all of them. It can, however, improve the quality of the things that wake you up in the night. Sneakily encoded into it are a number of organizational processes that may help as well.

I’ve found the RED and USE methods really helpful not only in building things, but also in the shared vocabulary they provide. It is my hope that CASE brings some clarity and conversation to the alerts that protect our systems and harangue our colleagues.

The core idea is to establish a culture in your organization where the existence of an alert is viewed with healthy skepticism. Alerts may be created for good reason, but we should be skeptical of their continued value unless it is demonstrated. What justifies this alert, and has that criteria been re-evaluated lately? CASE provides a framework for these questions.

# Context-Heavy
Reading a jargon filled text message on your phone at 3am is hard enough at the best of times. Responding to that page effectively requires information. Optimally the information is targeted to the problem in question and helps the responder understand the system’s context as quickly as possible. In a sense, one must “design” the alert in such a way that this is possible. This is effectively the observe and orient portions of an [OODA loop](https://en.wikipedia.org/wiki/OODA_loop). Spending time on this design should be worthwhile, because interrupting a human being is costly and should be treated with respect.

![Lots of things interrupt people](/assets/images/case-alerts.png)
<br>_Lots of things cause problems. Especially ghosts._

How can we help the responder? Alerts are one of the first stimuli that an operator will receive and are therefore a strong contributor to any hypothesis generation they may do. Runbooks and dashboards are common destinations, but are they suited to the alert rather than being full of general guidance? Allspaw claims that we must “think about the way the alert could be interpreted or acted on” (slide 29)[^1]. A good alert is designed for the operator rather than just set at a threshold and pushed out into production.

To that end, here are some ideas for improved alert context:
* Link the user to something helpful and designed, not just to a generic runbook or dashboard. In the past colleagues and I used “investigation dashboards” that were tuned to specific alerts. This may help well known failures, but might be misleading for other things. It’s a tightrope!
* Provide insight into the history of the alert: is it new? How often does it fire? Is it seasonal?
* Recent change awareness: Help with system state. Has anything changed lately like a deploy or feature flag?
* Show relationships and inform the mental model: Are the system’s dependencies clearly shown, preferably with indications of health?
* Get the user to a team quickly: Can the responder see any in-progress incidents or determine who else in the org has already been paged? Has the [incident management](https://en.wikipedia.org/wiki/Incident_management) program been invoked?

Optimally your incident management program feeds more suggestions into how alert context can be improved as you investigate failures. We can always improve this!

# Actionable
Is the responder supposed to do something in response to this notification? If action is not necessary or clear why have you interrupted them? The intent is to avoid alerts that pester the operator when no action is needed.

<blockquote class="imgur-embed-pub" lang="en" data-id="u2MmRrJ"><a href="//imgur.com/u2MmRrJ">What am I supposed to do now that you've surprised me?</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

_What am I supposed to do now that you've gotten my attention?_

In the early days of a system when complexity is low and few people are involved we often establish monitoring as a form of informational awareness. A note saying that heap usage has grown may be a nice bit of context for us in case we see a later interruption in service. At scale this becomes unmanageable because our systems operate in various states of degradation at any time. This quickly leads to [alarm fatigue](https://en.wikipedia.org/wiki/Alarm_fatigue) and can result in desensitization that harms an operator’s ability to respond effectively either due to ignoring or outright filtering of such notifications. Don’t fall into the trap of allowing alerts to continue, only to route them to email and then into a folder you never read.

These are the attributes of an actionable alert:
* The situation requires action, it is not merely informational.
* There is no obvious automation for this action, or automation is unsafe. If the action can be automated, automate the damn thing and stop bothering people!
* The situation contains urgency guidance in the form of a [service-level agreement](https://en.wikipedia.org/wiki/Service-level_agreement) (SLA) and perhaps a [recovery time objective](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_time_objective). This allows the responder to enlist the help of the organization's incident management program.

To be clear I am not advocating that you _only_ alert on the topmost SLOs for your API or similar. This concept of monitoring SLOs is fractal in that each service in your organization can be approached the same way. You will obviously be monitoring top level SLOs that face paying customers, but you will also monitor infrastructure SLOs like databases. Pretty quickly these become focused on internal customers and supporting them. Turtles all the way down!

# Symptom-Based
Like it or not, you’re probably working with a distributed system (Cavage)[^2]. As a result, your work is likely to employ many tactics to isolate and buffer services from failure (Treynor et al)[^3]. While pangs of high garbage collection durations or database query times might mean something is awry, these rumbles are not urgent if users are not going to experience problems either now or very soon.

These sorts of signals may be important and/or actionable, but if they are not causing user difficulties then they are likely not urgent enough to warrant interrupting our operator. Cause based alerts are snapshots of our mental models about system failure. It’s best to monitor important _symptoms_ rather than attempting to enumerate every possible cause of failure.

To ensure your alerts are actionable you can focus on the [performance indicators](https://en.wikipedia.org/wiki/Performance_indicator) that are important to your users. Ewaschuk called this aspect “monitoring for your users”. Also recall that you’ll be applying this philosophy through your entire organization. Once service in the bowels of your infrastructure begins having urgent problems, you can expect that the relevant team will be involved. Further hardening your systems against that failure is a wholly separate line of work (Treynor et al, section Strategies for Minimizing and Mitigating Critical Dependencies)[^3].

## Symptoms Change Less
Cook reminds us that complex systems contain a multitude of flaws, faults, and problems[^4]. If you’re trying to enumerate each of these possible causes you’ll be doing a large amount of unhelpful work that never ends. Many of the problems you’re attempting to spot will shift away over time. Sridharan says that systems are “not necessarily going to be operating while 100% healthy at any given time“ so we should focus on more “human-centric” situations (“[Distributed Systems Observability](https://distributed-systems-observability-ebook.humio.com/)”, 7)[^5].

## Avoid Incident-based Alert Debt
A common incident remediation is to make an alert for a cause. This “debt” of narrowly useful alerts may create a false sense of confidence, since your system will continue to change how it fails.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">We are monitoring the SHIT out of everything but that…</p>&mdash; Honest Status Page (@honest_update) <a href="https://twitter.com/honest_update/status/867058053480427525?ref_src=twsrc%5Etfw">May 23, 2017</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Rather than creating a false sense of confidence from cause-based alerts, instead ask yourself:

* Why didn’t a symptom-based alert find this?
* Could improved context for the responder help?
* How can we improve our observability tooling to make this diagnosis faster rather than creating alert debt?

Observability tooling for diagnosis will only improve if you consider it the means for getting from symptom to solution. Without this feedback loop you end up with a collection of reactive alerts and charts that document your past failures and none of your future ones. This provides a wonderful opportunity for an organization to shift from a reactive stance on alerting to a proactive one. It also elevates the conversation between engineering and product via common expectations and clear value. The CASE (:wink:) for any alert’s existence is clear.

## Cause-Based Is OK In Moderation
Sometimes the system being monitored leaves us little choice about a cause-based alert. Other times our operators are acutely aware that the symptom will lead to imminent failure and is therefore very actionable. Maybe you just aren’t sure what’s up and set up alerts out of an abundance of caution. This need for action is hopefully temporary until the system can be modified to deal with degradation.

Keep the other parts of CASE in mind when dealing with these situations. Being temporary doesn’t remove the need for thoughtfulness.

# Evaluated
The changes — new code, new infra, or new… whatever — to our systems introduce new forms of failure (Cook, 3).[^4] Do we still trust that this alert works as expected? Having sharp, recent mental models of your systems and experience responding to some alerts to aid [anticipatory thinking](https://www.getrevue.co/profile/resilience/issues/resilience-roundup-anticipatory-thinking-issue-27-168981) is a key part of a [learning organization](https://en.wikipedia.org/wiki/Learning_organization). Because the faults in our systems will continue to evolve, so must we.

We need to regularly evaluate the performance of each alert to ensure they work the way that we expect. Listen up management, you can have a strong impact helping your team establish this! Here are some ideas for how to do evaluation:

* Leverage [chaos engineering](https://principlesofchaos.org/), [game days](https://www.gremlin.com/community/tutorials/how-to-run-a-gameday/), or other forms of testing to ensure that alerts do what you expect. You can do this within your team without the process of larger incident management machinery!
* Include collection of data about all relevant alerts that participated in incidents are part of your incident management program. Flag help, harm, irrelevance, confusion and more. Use this as feedback.
* Healthy alerts fire on occasion and are well exercised. Verify that all the links work and point to relevant context, etc.
* Alerts that never fire or that fire frequently are unhealthy. Improve or eliminate these. Be wary of both overload and underload!
* Keep an expiration timestamp on alerts. If an alert expires, reevaluate it against CASE and update the timestamp. Think of this as a freshness date and review with your team regularly.
* Make improvement of alerts easy. Use monitoring as code and keep your alerts in a Git repository. Pull requests help you involve the team as well and you get history for past experiences. This may help remove fear of changing the alert or getting sign off from those that “own” it.
* Allow feedback on alerts, even if it’s just a quick [Google Form](https://www.google.com/forms/about/) so that responders can signal an alert being unhelpful or noisy. Put a link or call to action in the body of your alert and review the feedback regularly.
* Establish team norms that those on call have time in their schedule to improve on call during slow periods. Try and leave things better than when you found them!

# Closing
I believe that the CASE method provides teams and organizations a way to discuss the care and feeding of automated alerting. A single engineer can begin evaluating alerts through the CASE lens and from that scale up to an entire org working with teams, management, and incident management programs to keep alerts groomed and valuable. It requires no fancy tools or complex process.

As an industry we must continue to consider the human factors of on call responsibility whilst giving our customers the best experience possible. The tools and practices that we use have a vast opportunity for improvement. I hope that CASE contributes to this improvement.

Bask in improved alerting!

<iframe src="https://giphy.com/embed/qISaMW1xwmvNS" width="480" height="360" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/bird-owl-qISaMW1xwmvNS">via GIPHY</a></p>

# Citations

[^1]: Allspaw, John. “[Considerations for Alert Design.](https://www.slideshare.net/jallspaw/alert-designcac-talk2013)” Monitorama 2013 Portland, OR.
[^2]: Cavage, Mark. _[There’s Just No Getting Around It: You’re Building A Distributed System](https://queue.acm.org/detail.cfm?id=2482856)_. ACM Queue, 2013.
[^3]: Treynor, Ben et al. _[The Calculus of Service Availability](https://queue.acm.org/detail.cfm?id=3096459)_. ACM Queue, 2018.
[^4]: Cook, Richard. _[How Complex Systems Fail](https://web.mit.edu/2.75/resources/random/How%20Complex%20Systems%20Fail.pdf)_. Cognitive technologies Laboratory, University of Chicago. 2000
[^5]: Sridharan, Cindy. _[Distributed Systems Observability](https://distributed-systems-observability-ebook.humio.com/)_. O’Reilly Media, Inc. 2018
