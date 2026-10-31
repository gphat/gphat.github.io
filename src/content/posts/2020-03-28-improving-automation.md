---
title:  "Improving Automation: Working Together"
date:   2020-05-28 07:51:00
categories: automation
series: automation
draft: false
summary: "Automation can be improved by designing for work with humans rather than alone."
---

I painted a bleak picture of runaway, people-eating automation in [Stop Hitting Yourself: How Automation Is Hurting You](http://onemogin.com/automation/automation-is-hurting-you.html). It was a bit alarmist, but for good reason. In my experience at many companies and with many customers, automation is treated as a cure-all that is rarely designed to work *with* human teammates. Instead, it removes the human completely while providing little in the way of substitute. **This post is meant to provide guidance on how to overcome this challenge and improve your operations by giving automation some extra capabilities.**

# How To Improve
**To be a good team, the parties on that team must agree to a basic compact wherein they coordinate, work toward shared goals, and prevent breakdown in communications.[^tenchallenges]** The rest of this post is concerned with doing our best with current technology to make automation a part of this deal.

As such, in this post I will be speaking about automation anthropomorphically as *part of a team*. This might feel a bit funny, but doing so encourages us to make it behave less… assholey. If we start thinking of these systems as teammates who can improve with feedback, we can begin to change our approaches to one where our humans and our robots work together instead of in isolation.

# Automation Exists In A Team
Automation often comes from a place of frustration or failure, like an incident remediation. As such it is easy for the author to focus on the outcomes rather than the context in which the automation operates. A form of incident-driven-development, if you will.

To build automation that works well with humans — or even other automation — we need to consider these techniques **at the time of design**. Many of the improvements suggested will require changes to the automation's approaches, algorithms, and capabilities. Let's discuss how.

## Automation Must Be Designed
The point of automation is to free the human from some effort. Unless you work alone, other humans will become responsible for working with and caring for the automation in the future.[^jcsauto] To that end **you must treat automation the way you'd treat a product**. That means talking to stakeholders, getting feedback, and considering ergonomics.[^designofevery]

> An appropriate design should assume the existence of error, it should continually provide feedback, it continually interact with operators in an appropriate way, and it should have a design appropriate for the worst of situations.[^problemauto]

We must also consider the cognitive load of the automation. Is it hard for people to use? If the complexity exceeds the perceived benefit they may avoid its use all together.[^misuse] Automation that is bypassed is both wasted effort and a potential future problem.

## Automation Must Communicate
Above all, automation must communicate with its human partners to be effective. Consider your automation as another person on the team. What might they say to their teammates as they work? This can improve the [gulf of evaluation](https://en.wikipedia.org/wiki/Gulf_of_evaluation)[^designofevery]. How you do this will depend on your internal capabilities, but here are some suggestions:

* Emit metrics that track currently monitored values (gauges) and critical operations (timers and error counters).
* Track estimates and error. What did the automation expect versus what *actually occurred*? Consider some lessons from [control theory](https://en.wikipedia.org/wiki/Control_theory) and [PID controllers](https://en.wikipedia.org/wiki/PID_controller). Emit telemetry about these measurements as well as judgements.
* Emit metrics that make clear any goals, thresholds, or limits. These may be fixed values, or values that change with the state machine.
* Emit events around actions, intentions, and decisions.

This feedback is vital for humans in their work and performance.[^ninesteps] Build interfaces or dashboards that curate this information, specifically aligned with the goals — e.g. control, stability, cost, latency - of the operator and the automation.[^autoaware]

As a final note, remember to allow access to the raw information (logs, metrics, events) so the operator can dig in deeply if needed. This is important, because automation merely removes the need for the human to **focus** on the tasks in question. When they need to take over for automation it is essential that raw information be available to reestablish control, see also [Ecological interface design](https://en.wikipedia.org/wiki/Ecological_interface_design).

## Automation Must Be Predictable
It is generally advisable to [avoid surprise in software](https://en.wikipedia.org/wiki/Principle_of_least_astonishment). Humans will inevitably forget stuff and work with imperfect mental models.[^wrongmental] This is a normal form of energy conservation for humans who can't possibly remember everything at all times. Maybe they are new and don't even know the automation! As such we must work to ensure that our automation considers its teammates and acts predictably. (Remember our [toxic teammate example](http://onemogin.com/automation/automation-is-hurting-you.html)!)

Here are some ways to improve predictability:
* Emit notifications and reasons when goals change, errors occur, or any time when a human might need to be aware of an action.[^designofevery]
* Emit information about the current, past, or next step in the process.
* Avoid sudden movements. Aside from being surprising to humans, smaller adjustments at faster intervals are typically better at stabilizing systems.[^feedbackcontrol]
* Add (and emitting notifications for) cool down or observational periods such that the automation can transmit its *intent* to act in time for a human to react.
* Increase urgency of communication as the bounds of control get closer. Do not snap from normal to freaking out in one tick of a loop, do so gradually. This might signal a need for a tighter feedback loop or lower interval!

As an aside, another way to improve predictability is to keep things simple. Some ML or AI features promise great benefits, but may be opaque and unpredictable to operators. Take care when evaluating and using such features.

## Automation Must Be Directable
So far we've focused on ways that automation can transmit information about its work. Now we must turn the tables and think about how our automation can receive information and adjust its behavior.

* Add a kill switch or other mechanism to quickly disable automation and make it accessible during incident response. Train people on its use.
* Add APIs to your automation that can enable, disable, or influence it's parameters, like feature flags.
* Configure "policies" that adjust the approach or the aggressiveness of actions, with ways to change this easily at runtime.
* Messages, APIs, or signaling to sense *other teammates* actions — i.e. other automation or humans — and to react accordingly. If a human intervenes, maybe I should sense this and adjust my actions.

These features allow teammates to direct the automation in a way consistent with the given context.[^tenchallenges] With these capabilities, working with automation can become a part of the documented process for responding to loss of control. Without them, automation may be forgotten and exacerbate the problem through well meaning but opaque activity.

## Automation Must Be Respectful
We've discussed at length how vital it is for automation to make information about its work available. We must also, however, balance all that yelling with a respect for the other agents. Humans typically rely on mental models of others to determine what, if anything, needs to be said to keep coordination going.[^tenchallenges] Our automation, being of simple mind, needs our help. Here are some ways we can improve things:

* Use log levels or other filterable tagging to indicate matters of different importance. Normal operations are no big deal and should be kept to low priority of communication whereas nearing the bounds of control warrants yelling loudly.
* Leverage consolidation and filtering tools that allow dialing up or down the attention given.
* Accept feedback that mutes notifying users, either at the source or through a common filter.
* Incorporating context, such as if other teammates are acting, to help guide internal decisions about how much and often to direct attention. Are we in incident?

In practical terms automation needs to be aware of the state of the world around it. If the humans are stressed out automation should aim to be helpful and not overwhelming. This could begin as a human controlled flag or signal, but over time could be adjusted to track critical health metrics of the system.

# Automation Must Evolve
We commonly celebrate a new bit of automation being turned on. We’re done with the toil and frustration of doing this manually. No more human error for us, no sir! It might be appropriate to celebrate the end of one bit of work, but now it’s time to shift over to a whole new effort: the care and feeding of automation.

Being a part of a [complex system](https://en.wikipedia.org/wiki/Complex_system) means that the automation will need to adjust over time. Working with humans will also mean learning from errors, sanding down rough edges, and generally improving understanding for the operator.[^designofevery]

Ensure that you’ve allocated time for this work, and that you revisit your automation. Think of it like a quarterly review. It’s a chance to evaluate how the automation has met the organization’s expectations and communicate what the automation can do to improve. Since it’s not as adaptable as you, any improvements will come from your own keyboard.

Too often we pave over this critical automation, tossing it aside as soon as it serves its purposes. This forces our future teammates — maybe even ourselves — to act like technological archaeologists, digging up old bits of automation and struggling to decipher what they are doing.

# Revisiting The Autoscaler
When we last left our autoscaling example from [Stop Hitting Yourself: How Automation Is Hurting You](http://onemogin.com/automation/automation-is-hurting-you.html) we hadn't we read all this rad stuff about how to improve automation. Let’s count off some ways that the autoscaler can be improved to fit the techniques described (less design, since that ship has sailed):

* **Communicate**: Emit metrics for the current, target, and **expected** values. Measure durations of any adjustments (calls to scaling APIs, etc). Track difference between expected and current values with consideration to duration and emit this as an error value.
* **Predictable**: Emit log lines for all decisions and any problems. Emit log lines for potential next steps. Adjust frequency of checks and sizes of adjustment to smaller amounts, with backoff and/or cooldowns before actually making changes to scale.
* **Directable**: Add feature flags to disable completely or adjust aggressiveness of changes. Add API calls or feature flags to adjust parameters on the fly. Monitor health KPIs over affected services and bail out (with messaging!) if things look fishy.
* **Respect**: Ensure that logging uses appropriate log levels. Monitor for changes to current values that did not correspond to automation’s changes and consider bailing out or at least logging. Don’t page or otherwise bother people directly.
* **Evolve**: Provide a convenient way for users to give feedback on tooling, preferably one that doesn’t require 11 different required JIRA fields or anything to be filed in triplicate. Periodically review performance metrics and track any tickets generated for improvement. Hell, just *ask* them.

# Future And Summary
At this point, I hope you’re glancing around at the automation that holds together your systems with a combination of fear and excitement. Fear because there many footguns and time bombs in your midst. Excitement because the above techniques can defuse and improve automation!

There are additional improvements we could imagine, like making automation aware of how *humans* work through modeling and allowing that automation to predict and adjust it’s behavior. Sadly, this and others are still a bit science fiction. The steps above, however, are all practical with today's technology and a bit of forethought!

By incorporating these concerns into our design and maintenance of automation, we can not only create a more harmonious environment, we can look forward to a less toxic, more helpful teammate. A teammate that keeps us informed of what's going on, and backs off when we take over.

I encourage you to check out the citations listed in this and the earlier posts on automation. My suggestions are just that, and are largely viewed through the lens of an observability wonk. I'm excited to hear what ideas you might have for improving automation.

# References
[^misuse]: Raja Parasuraman, [Humans and Automation: Use, Misuse, Disuse, Abuse](https://journals.sagepub.com/doi/abs/10.1518/001872097778543886)
[^tenchallenges]: Klein, Woods, Bradshaw, Hoffman, Feltovich, [Ten Challenges for Making Automation A Team Player](http://jeffreymbradshaw.net/publications/17._Team_Players.pdf_1.pdf)
[^autoaware]: Mica Endsley, [Automation and Situation Awareness](http://www.aerohabitat.eu/uploads/media/Automation_and_Situation_Awareness_-_Endsley.pdf)
[^problemauto]: Donald A. Norman, [The Problem of Automation: Inapporpriate Feedback and Interaction, Not "Overautomation"](https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/19900004678.pdf)
[^ninesteps]: Woods, Cook, [Nine Steps to Move Forward From Error](https://www.researchgate.net/publication/226450254_Nine_Steps_to_Move_Forward_from_Error)
[^cse]: Rasmussen, Pejtersen, Goodstein, [Cognitive Systems Engineering](https://www.wiley.com/en-us/Cognitive+Systems+Engineering-p-9780471011989)
[^designofevery]: Donald A. Norman, [The Design of Everyday Things](https://en.wikipedia.org/wiki/The_Design_of_Everyday_Things)
[^jcsauto]: E. Hollnagel, [The Role of Automation in Joint Cognitive Systems](https://www.sciencedirect.com/science/article/pii/S1474667017376851)
[^wrongmental]: Besnard, Greathead, [When mental models go wrong. Co-occurrences in dynamic, critical systems](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.62.9857&rep=rep1&type=pdf)
[^feedbackcontrol]: Philipp K. Janert, [Feedback Control for Computer Systems](http://shop.oreilly.com/product/0636920028970.do)
