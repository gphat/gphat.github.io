---
title:  "Stop Hitting Yourself: How Automation Is Hurting You"
date:   2020-05-26 07:50:00
categories: automation
series: automation
draft: false
summary: "Replacing humans with automation comes with a lot of risk that's hard to see in the moment."
---

I really dislike writing post openings. It feels tedious to define the problem in leading ways that will entice a reader, especially when the important bits are further down. I wish I could just press a button and get a Cory-like opening blurb with some toilsome bits like “so and so is defined by wikipedia as” and a pithy joke. I wanna automate it.

[Automation](https://en.wikipedia.org/wiki/Automation) is a process being performed with minimal, if any, human involvement. [DevOps](https://en.wikipedia.org/wiki/DevOps) and [SRE](https://en.wikipedia.org/wiki/Site_Reliability_Engineering) commonly recommend aggressive automation to do more with less in modern, [complex systems](https://en.wikipedia.org/wiki/Complex_system). There's certainly a lot to be gained from automation, but there's also a downside when this technology replaces human involvement.

## Toxic Teammates
Have you ever worked with a stubborn, uncommunicative teammate? Maybe they didn’t contribute to joint projects or _did_ contribute but didn’t share until the end? Perhaps they insisted on dropping everything at exactly noon every day so they could get their favorite sandwich for lunch, work be damned, and left everyone else to deal with the mess.

Such a teammate is often considered toxic and ruinous to teams everywhere. My goal today is to show you how the automation you’re making in your job is generating these “teammates” and wrecking your happiness, reliability and ability to do cool new things.

##  Toil and Trouble
One of my responsibilities is keeping an API library up to date. Inside this API is a list of acceptable names for cloud provider services. That list changes periodically and is kept in a bit of Java source code as a map. So every few weeks I copy the block from Java into Go and — by hand — rejigger it into Go syntax and commit it. Each time I think about how I could write a parser to do this… or maybe ask the other team to move the definitions to YAML files so I could rid myself of this toilsome work. Sometimes I even typo a definition and release it to the world. “Damn!” I say, reminding myself that if this were YAML and I had a script I could avoid this happening.

This sort of tedium is common in jobs. Despite my whining, I’ve only had problems with this process two or three times in a year. Each time it was obvious to me what had happened and it was fixed quickly and effectively with very little customer impact. This is because I — as a human — am full of wonder: foresight, imagination, adaptability, and ingenious. While I make errors on some occasions, I more often create safety.[^0] When I do make errors, I quickly recognize and correct them using my adaptability and ingenuity. Compare this to the heap of new problems I might bring by introducing new dependencies to a well understood process.

## How Automation Hurts
The point I'm getting to here is that despite our seemingly genetic distaste for toil we should be extremely careful about reaching for automation.

> Automation has generally been introduced to meet the needs of the process rather than the needs of the people working with the process[^jcsauto]

My plan is to scare you sober by showing all ways that automation is like that toxic teammate. In a follow up I'll help you learn how to avoid these problems.

**Automating a process without proper consideration, design, and planning can create technical debt, incidents, and undermine all your hard work.**

For the rest of this post, imagine a common bit of automation in many orgs: [autoscaling](https://en.wikipedia.org/wiki/Autoscaling). Some sort of latency metric is monitored and, based on thresholds, some other resource like compute is scaled up or down. This replaces a human looking at charts and making a judgement call, or missing an unexpected surge because they were busy watching _Tiger King_ and eating half-gallons of ice cream. Not that I've done that.

Imagine our new autoscaling system has worked well for weeks, then a surge in traffic occurs. The autoscaler automation does its job and no human needs to get involved! Sadly, this load consumes all the compute your cloud provider has allotted to you. Tasks across the org begin failing with esoteric error messages as compute grinds to a halt. Since most of us skip error checking for operations that generally succeed we may not even have error messages!

"But Cory", you say with a smirk, "we have tons of automated things underlying our entire lives and we're getting by". Sure, we are. The key difference is *definedness*. There are some processes which are so well defined, and so unlikely to encounter problems that we've been able to free ourselves completely from the toil. For more complex or poorly defined situations, however, human capabilities are still essential.[^jcsauto]

### Automation Requires More Of Humans
Automation removes the human from involvement in the operation. This is a blessing in reduced fatigue or improved productivity. Unfortunately it's a curse in *situation awareness*.

These kinds of second order effects are common with automation because humans are "out of the loop". **This means additional time is required for all these folks to get acquainted with the system, how it works, and what can be done about it.[^1]** If the user doesn’t know about the automation or has forgotten the logic, they may end up fighting what seems like unexplainable behavior! This price is being paid at a shitty time, as we may be dealing with customer side effects and blowing up the entire org's productivity by invoking the incident machinery.

This situation leaves us with an irony and a paradox.

**Irony:** the more complex an automation, the more crucial the human becomes.[^2] Our autoscaler, meant to improve latency, has instead caused a complex series of second order failures that a — or many! — humans most now sort through.

**Paradox:** our automation was intended to remove the need for humans, but instead we've made a new, different joint human-computer doodad.[^2]

### Automation Creates New Problems
When we set out to make our autoscaler or any other automation, our goal was to reduce the effort and/or accuracy of a task. This goal is so strong that we generally miss, or don't bother to imagine, the *side effects* that come with the benefits. **Adoption of any technology, which automation is a form of, increases needs for coordination, creates new situations, and new failures. "It changes what is canonical and what is exceptional."[^3]**

Consider our earlier example. Not only do we have new failure modes, we have additional process and state that humans must internalize. Before the autoscaler we had one set of problems, now we have exciting new problems!

### Automation Increases Complexity
The productivity gain from automation is tantalizingly quantifiable. The ramifications are frustratingly qualitative. The time spent staring at charts, editing files, and executing changes can be added up in a spreadsheet and celebrated at review time. What will we do with all this extra time?

**We create even more complexity**, that's what. We'll go and automate another thing, or create a new thing that needs automation later. This is a form of The Law of Stretched Systems[^4]:

> Every system is stretched to operate at its capacity; as soon as there is some form of improvement, for example, in the form of new technology, it will be exploited to achieve a new intensity and tempo of activity.

We'll take this newfound free time and permission to make *more* complexity without realizing we're going to pay later.

Harkening back to our earlier problems we can also look to cybernetics for the [Law of Requisite Variety](https://en.wikipedia.org/wiki/Variety_(cybernetics)#Law_of_requisite_variety) which warns us that a controller — which is what our automation is — must have *at least* as many states as the system it controls. This culminates in a combo finisher by [Brian Kernighan's famous admonition](https://en.wikiquote.org/wiki/Brian_Kernighan) that debugging is twice as hard as programming. Can you debug this automation if it's more complex than its target process? What about when multiple pieces of automation start interacting?

### Automation Is Design
Automation usually begins from a point of frustration. Our autoscaler was likely born either from an incident remediation or someone who was sick of staring at charts. Our aforementioned quantitative improvements spur us into action. The autoscaler is only a state machine, right? You've written a zillion of those!

The repercussions of adding automation warrant research, user interviews, collecting feedback, and all that other work that *isn't* coding. I'm talking about **design** here.

Design is never neutral, so every change you affect or error you emit benefits from design.[^5] How will users know the autoscaler has taken action? Will the autoscaler make correct choices when faced with increasing latency and capacity for other functions? Can users disable the autoscaler? These are all essential questions to factor into your design.

### Automation Reduces Optionality
Humans have created some beautiful  — and some despicable — things. A human as part of a system means that system can still be adaptive[^0]. When we remove humans we remove this adaptive capability. Yeah, yeah, I know we have ML and AI but these are, for now, very crude in comparison to humans. Using them is, in effect, even more automation that we must understand. Eep!

To automate a process requires a very specific, fixed set of instructions. Do you understand the process and its ramifications well enough to do that yet? Automating a process requires design and choices, which can reduce the freedom of afforded from continued learning, evolution, and adaptation from the human operator.[^3] Doing this too early can result in shortcomings, bugs, and technical debt.

A human is aware of seasonal differences, like Black Friday, where a human would temper their actions. A human would recognize a network outage and not scale the compute down to 0 when the latency metric is 0 or missing. These lessons must be learned before we can rely on automation, lest we realize the repercussions in embarrassing incidents.

## Automation Is Brittle And Dangerous
You're still here reading, so you didn't bail early. Those that did probably think this post is some sort of Luddite position that we should stop or cast off automation. I'm ok with that assessment if it slows engineers down and encourages them to think through when and how to automate something. By all means read this half way through and talk shit about it, so long as it scares you.

Really, the opposite is true. I'm in awe of our automated accomplishments. My issue is with the wreckage we leave in our wake in the form of half-ass resilience. Automation is incredibly powerful, but so is human capability. Deploying automation too soon can result in a rickety, dangerous foundation that humans prop up with grueling on all schedules and unhappy customers.

The next time you feel the urge to automate, instead begin a design document. Better yet, marvel in your own antientropic powers and keep learning so you can write a better design document later.

# References
[^jcsauto]: E. Hollnagel, [The Role of Automation in Joint Cognitive Systems](https://www.sciencedirect.com/science/article/pii/S1474667017376851)
[^0]: Richard Cook, [How Complex Systems Fail](https://web.mit.edu/2.75/resources/random/How%20Complex%20Systems%20Fail.pdf)
[^1]: Mica Endsley, [Automation and Situation Awareness](http://www.aerohabitat.eu/uploads/media/Automation_and_Situation_Awareness_-_Endsley.pdf)
[^2]: Lisanne Bainbridge, [Ironies of Automation](https://www.ise.ncsu.edu/wp-content/uploads/2017/02/Bainbridge_1983_Automatica.pdf)
[^3]: Thomas B. Sheridan, [Allocating Functions Rationally](https://journals.sagepub.com/doi/10.1177/106480469800600305)
[^4]: Woods, Hollnagel, ["Joint Cognitive Systems: Patterns in Cognitive Systems Engineering"](https://erikhollnagel.com/books/joint-cognitive-systems-patterns.html)
[^5]: Donald A. Norman, ["The Design of Everyday Things"](https://en.wikipedia.org/wiki/The_Design_of_Everyday_Things)
