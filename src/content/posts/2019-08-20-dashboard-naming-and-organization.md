---
title:  "Dashboard Organization and Naming"
date:   2019-08-20 07:49:00
categories: observability dashboards
series: dashboards
summary: "Having trouble finding a dashboard in that haystack you call a company? Here are some strategies to help."
---

It starts innocently: a monolith with some simple KPIs to keep an eye on. You whip up a quick dashboard. The simplicity of your needs means that things are well organized and all in one place. Order is kept. Everyone knows where to look.

Fast forward a bit and as you’ve microed your services and kubered your netes the sheer fecundity of services, teams, operators, and needs have resulted in a hot mess of dashboards. Operators use bookmarks or address bar completion to find their trusted sources. Friends meet over lunch and realize they are looking at two different views of similar data. Shady vendors erupt from allies promising magic spells that point out all your problems. It's so confusing!

<iframe src="https://giphy.com/embed/5t9wJjyHAOxvnxcPNk" width="480" height="401" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/latelateshow-what-confused-5t9wJjyHAOxvnxcPNk">via GIPHY</a></p>

Let’s discuss how we can _design_ our dashboard organization to increase awareness and findability.

## A Very Particular Set of Skills

The folks making dashboards are often the folks running the systems they monitor. This is both important from a DevOps perspective as well as for accuracy. **Unfortunately these folks — the skillful artisans of backend services, data pipelines, and machine learning — might not know best how to set up an entire company’s monitoring assets.**

If you squint at dashboards and how they interact with your operations this can be reduced to a problem of _organization_. Luckily there is an entire discipline around this called [information architecture](https://en.wikipedia.org/wiki/Information_architecture) or IA. Information architecture, a branch of [information science](https://en.wikipedia.org/wiki/Information_science), concerns itself with the design of information environments to support findability and usability. Yay for the -ilities!

Your first step is to ask around: does your company have folks that are experts in this discipline? If so, seek them out and ask for some of their time. They can likely help you through some basics on what to work toward. _Use their advice over any you get here!_

For those without you might find the [U.S. Department of Health & Human Services’s Information Architecture Basics page](https://www.usability.gov/what-and-why/information-architecture.html) helpful. Also a run through [Fundamental Concepts of Good UX](https://usabilla.com/blog/fundamental-concepts-ux/) wouldn't hurt.

Note: It may help you to explicitly appoint someone this responsibility and applaud their efforts rather than relying on unofficial or “shadow” work that goes unrewarded. Most tools have APIs for fetching assets and you can set up policies that enforce the ultimate design.

## See What You’re Working With

Most companies looking to improve their dashboard findability will be using some sort of tool, be it vendor, OSS, or in-house. Regardless you’ve likely got some existing capabilities. What does the tool support? Common mechanisms are tags or labels, hierarchies, groups, or layouts like matrices. This is vital, as trying to fight against your tools preferred mechanisms will only yield frustration.

Empowered by knowing the way your tool works we can start looking at how to best leverage it’s strengths.

## Ship Your Org Chart

Ever noticed that you tend to move toward things you’re looking at? Since organizations are full of people we tend to also go where the organization is looking. The trusty org chart is a strong indicator of how a company is orienting itself, and our products tend to reflect that. This idea is called [shipping the org chart](https://medium.com/@donorem/shipping-the-org-chart-3319181be9bd).

People tend to understand the product they work in as well as the org chart that shapes it. To that end, consider arranging your assets using the org chart as a guide. For example, you might have Product and Infrastructure Engineering teams. The Database team, nested in Infra, might have a team for Transactional versus Analytics.

![Icon-based org chart showing hierarchy of Infra, Storage, and two sub-teams](/assets/images/dash-p5-org.png)
<br>_Does your org chart have these fancy icons?_

The folks that work in these areas, as well as those higher in the org chart probably know how to navigate this structure. You can leverage this hierarchy by placing appropriate dashboards at each level. High level KPIs for each team might live at the Infra level whereas a dashboard for use with Hadoop would live in the analytics team’s area.

![Icon-based org chart with labels for where dashboards might live](/assets/images/dash-p5-org-labels.png)
<br>_Maybe these dashboards in these places?_

## Naming

I know you put a lot of thought into the clever names you’ve given your services and projects. Naming the data pipeline service for that Lord of the Rings character, complete with backstory, was really a stroke of genius. Unfortunately many teams use this sort of process and it quickly becomes impermeable claptrap.

Name your dashboards and monitoring assets for activities, not for nouns. These activities likely share some DNA with your org chart and team names. Furthermore most companies use similar words for things like orders, ETL, RPC. This allows new hires or folks from other disciplines a better chance of knowing what they are looking at.

## Findability

Lastly let’s talk about how one finds these assets. You’ll again look to your tools for help. Do they offer search features? Are names the only searchable field, or can you also search descriptions or even chart titles within a dashboard? Knowing this will help you create a strategy for improving findability.

### Use words that help

_Data Pipeline Overview_ is a better name than _Smeagol Overview_, but _Data Pipeline (Smeagol) Overview_ that lives in the Analytics team is much more helpful.

### Add more words

Many tools have descriptions or other text fields beyond just the title. Consider something like “Contains high level indicators for data pipeline health useful for stakeholders interested in investigating delays and statuses”. This might help search tooling or just those that browse in and wonder the goals.

### Linking, Lists and Ordering

Many tools allow you to create relationships between assets. A data pipeline dashboard might link to it’s destination or source, helping operators hop from one place to another. In hierarchical or list-based systems the order of dashboards might be a prominent UI feature. Consider placing more important or higher-level dashboards at the top.

Additionally, many dashboard tools allow placing text widgets. Consider including these with links to helpful resources.

### Favorites or Usage-based Metrics

If your tool allows users to flag databases as favorites or upvote them, this might help bring attention. Be wary of this, as popularity might not match your IA design.

## Keep It Up!

In case you missed it before I’ll reiterate: Appointing someone to do this work is a big help. Designs usually need _designers_. Your tools might have a framework out of the box, but helping the folks in your company know how best to use these tools, to create policities, and to enforce these policies can pay dividends. This function might be a part-time role for a skillful individual or a function of a larger team like an observability or SRE team in conjunction with specialists from your product arm. Regardless, this investment can prevent duplication of effort, improve responsiveness during problems, and generally level up your cross-team awareness. Have fun designing!

<iframe src="https://giphy.com/embed/l0MYJnJQ4EiYLxvQ4" width="480" height="418" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/l0MYJnJQ4EiYLxvQ4">via GIPHY</a></p>
