---
layout: page
title: Observability
permalink: /observability/
---

Through my career as a software engineer, manager, and executive, observability has been a constant theme.

[Observability](https://en.wikipedia.org/wiki/Observability) is more than monitoring and charts.** It's a collection of techniques and tools that deepen our understanding of complex systems — not just when things go wrong, but all the time.** The goal is to give operators genuine insight into how a system behaves: what changed, what's slow, what's correlated. Good observability improves the ergonomics of that understanding, making systems less surprising to the people who run them.

# Open Source Work

* [Veneur](https://github.com/stripe/veneur) which [Stripe uses](https://stripe.com/blog/introducing-veneur-high-performance-and-global-aggregation-for-datadog) to power metrics and traces. Veneur brings efficient performance and the capability to approximate "global" histogram and timer percentiles using [Ted Dunning's t-digest](https://github.com/tdunning/t-digest) approximate histograms and sets using [HyperLogLogs](https://en.wikipedia.org/wiki/HyperLogLog).
* [Censorinus](https://github.com/gphat/censorinus) is a JVM — by way of Scala, but with no other dependencies — \*StatsD client with support for both [StatsD](https://github.com/etsy/statsd) and [DogStatsD](http://docs.datadoghq.com/guides/dogstatsd/).
* [Dozens of contributions](https://github.com/datadog/dd-agent/pulls?utf8=✓&q=is%3Apr%20author%3Agphat) to [Datadog's monitoring agent](https://github.com/datadog/dd-agent) and [Integrations SDK](https://github.com/DataDog/integrations-core).
* Perl charting library [Chart::Clicker](http://onemogin.com/chart-clicker/), with love to [Infinity Interactive](http://iinteractive.com) for being so supportive and [Stevan Little](https://twitter.com/stevanlittle) for being so inspirational.
* [SignalFx Terraform Provider](https://github.com/splunk-terraform/terraform-provider-signalfx) which I created and maintained.

# Professional Work

After joining Twitter in 2012 I quickly found my calling in the Observability team. My [Observability at Twitter post](https://blog.twitter.com/2013/observability-at-twitter) was the first mention of "observability" in this context. (The team existed before me, I was just the one to share it outside of Twitter!)

Upon joining Stripe in 2015 I created and led an observability team and worked to change Stripe's culture such that observing our systems was a core concern. I led the creation of an entirely new observability stack with minimal interruption, managed and changed vendors a few times, and contributed to large improvements in reliability and confidence at Stripe through both observability tooling and incident process.

In 2019 I joined [SignalFx](https://www.signalfx.com) as a Technical Director, functioning as a Field CTO. My role was a mix of advocacy, customer engagement, and product improvement. Late in 2019 [SignalFx was acquired by Splunk](https://www.signalfx.com/blog/signalfx-signs-definitive-agreement-to-be-acquired-by-splunk/).

After Splunk I spent time at [Jeli](https://jeli.io), working on incident analysis and learning. From there I founded Oilcan, where I spent several years building ergonomic on-call tooling aimed at making the lives of on-call engineers less miserable.

I'm now at [Airbnb](https://airbnb.com), working on infrastructure engineering. My focus includes large-scale reliability initiatives like SLOs — building the systems and culture that let engineers understand and trust what they've built.

I'm often asked by investors to discuss my thoughts of new or existing monitoring products, and I enjoy speaking about these tools with others both to learn and provide my thoughts. I've also participated on customer advisory boards, representing my engineering teammates and learning challenges from vendors.

# Writing

* [Observability Crash Course](http://onemogin.com/observability/dashboards/observability-crash-course.html)
* [The CASE Method: Better Monitoring for Humans](http://onemogin.com/monitoring/case-method-better-monitoring-for-humans.html)
* A 5 part series on dashboard design:
  * [Structure and Layout](http://onemogin.com/observability/dashboards/practitioners-guide-to-system-dashboard-design.html)
  * [Presentation and Accessibility](http://onemogin.com/observability/dashboards/practitioners-guide-to-system-dashboard-design-p2.html)
  * [What Charts To Use](http://onemogin.com/observability/dashboards/practitioners-guide-to-system-dashboard-design-p3.html)
  * [Context Improvement](http://onemogin.com/observability/dashboards/practitioners-guide-to-system-dashboard-design-p4.html)
  * [Naming and Organization](http://onemogin.com/observability/dashboards/dashboard-naming-and-organization.html)

# Speaking

I speak regularly and conferences across the country promoting observability and thoughtful, empathetic operations.

## Monitorama 2016:

<iframe src="https://player.vimeo.com/video/173610034?portrait=0" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
<p><a href="https://vimeo.com/173610034">Monitorama PDX 2016 - Cory Watson - Creating A Culture of Observability at Stripe</a> from <a href="https://vimeo.com/monitorama">Monitorama</a> on <a href="https://vimeo.com">Vimeo</a>.</p>

[Here are the slides if you prefer to flip through them rather than listen to me talk](http://www.slideshare.net/CoryWatson8/building-a-culture-of-observability-at-stripe).

There are also versions of this talk from:

* [Datadog Dash, 2016](https://www.youtube.com/watch?v=wHAQ1tesGeg)
* [InfoQ, 2016](https://www.infoq.com/presentations/stripe-culture-2016/)

## AWS Loft 2019:

I gave at talk at the New York AWS Loft office called "Demystifying Observability" for startups. It's a combination of beginner info and practical advice for how observability can help you even when you're just getting started.

<iframe width="560" height="315" src="https://www.youtube.com/embed/n6v-P4p0QIA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Monitorama PDX 2019:

<iframe width="560" height="315" src="https://www.youtube.com/embed/TvS5conOsf4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

I had the pleasure of giving a 5 minute "vendor talk" at Monitorama PDX 2019. These talks are sometimes product pitches, but more often they are just a chance to speak about something important/interesting for the attendees and *maybe* mention your product. I decided to talk about how to think about observability tooling inspired by [John Allspaw's "An Open Letter to Monitoring/Metrics/Alerting Companies"](https://www.kitchensoap.com/2015/05/01/openlettertomonitoringproducts/).

## Monitorama Baltimore 2019:

<iframe src="https://player.vimeo.com/video/369638117?portrait=0" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>

I spoke about a Dashboard Renaissance, or techniques and processes for making dashboards a more helpful part of your observability and monitoring work. [Slides are here](http://onemogin.com/assets/talks/Dashboard-Renaissance.pdf).

## KubeCon US 2019:

<iframe width="560" height="315" src="https://www.youtube.com/embed/HmKAjIlImcU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Originally conceived as a set of lessons from my personal role purchasing tools to my job at a vendor where I work with dozens of customers making the same decisions. This talk covers 6 different ways to improve your stance on observability from a *social* perspective.

## SREcon20 Americas

<iframe width="560" height="315" src="https://www.youtube.com/embed/4lnjcAPBKQk" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Incidents are an amazing source of education, but we often fail to incorporate the findings into our observability tooling. This talk provides methods for doing just that, with a bit of help from my friends at [Jeli](https://www.jeli.io).

# Podcasts

* In March of 2017 I [spoke with Software Engineering Daily](https://softwareengineeringdaily.com/2017/03/15/stripe-observability-with-cory-watson/) about my observability work at Stripe.
* In April of 2018 I [spoke with Software Engineering Daily again](https://softwareengineeringdaily.com/2018/04/23/stripe-observability-pipeline-with-cory-watson/) about observability pipelines.
* In April of 2019 I [spoke with Real World DevOps](https://www.realworlddevops.com/episodes/the-vendor-is-not-the-enemy-with-cory-watson) about going from a customer to a vendor and some observability stuff.

# Other

* Wrote [a guest post for Honeycomb talking about making people awesome with instrumentation](https://honeycomb.io/blog/2017/01/instrumentation-is-about-making-people-awesome/).
* Reviewing posts and early books in the observability space, such as a technical review of [Cindy Sridharan](https://medium.com/@copyconstruct)'s [Distributed Systems Observability](http://distributed-systems-observability-ebook.humio.com).
