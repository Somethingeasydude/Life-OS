# MacroManagement.Co — Project Brief & Build Context

Owner: RAM Strategic Systems LLC. Client: MacroManagement.Co (macro-based
meal prep delivery, Buford GA, ~25-mi radius). Status: scoped, not yet
contracted. Client founders are RAM's close friends. Verified 2026-08-19:
averaged calories across all 14 recipes in the client's actual menu data
= 579.6, matching the brief's claimed ~575 average and 505–635 range.
Protein/carb bands also check out. The core insight is real, not just
asserted.

## The core insight (RAM's IP)

Every meal is ~575 cal regardless of which one a customer picks. So the
difference between weight loss / maintain / bulk isn't *which* meals —
it's *how many per day*. Calculator logic: target daily calories ÷ ~575
→ meals/day → subscription tier → checkout. One path, no decisions.

| Goal | Meals/day | Weekly plan |
|---|---|---|
| Weight loss | ~1/day | ~7–10/week |
| Maintain | ~2/day | ~14–15/week ($130 anchor) |
| Bulk | ~3/day | ~21/week |

## Calculator spec (the piece RAM builds)

Inputs (weight, height, sex, age, activity, goal) → BMR (Mifflin-St
Jeor) → TDEE → goal adjustment → target calories → ÷575 → meals/day →
route to tier → checkout. v1 = fixed preset swaps only. Phase 2
(ingredient-level customization) needs full per-ingredient macro data
the client doesn't have yet — do not commit to it for v1.

## Architecture: build the differentiated piece, rent the commodity piece

- **Custom-built by RAM (IP):** the calculator + branded front door.
- **Rented:** ordering, subscriptions, labels, delivery reports — on a
  purpose-built platform (Sprwt, Bottle, GoPrep, KitchenFuel candidates).
- **RAM = the glue:** connects calculator output to checkout.

**Correction, 2026-08-19 — RAM already told the client he'll handle
this personally:** Stripe linking and SMS wiring are RAM's scope, not
rented/hands-off as originally recommended. This is a real deviation
from the brief's own stated rationale ("no custom payment/SMS
liability" was explicitly why renting was recommended) — worth RAM
clarifying exactly what "linking Stripe" and "SMS wiring" means in
practice: configuring the chosen platform's native Stripe/Twilio
integration (low liability, still mostly "glue") versus writing custom
code directly against the Stripe/Twilio APIs (real payment/compliance
liability, a materially bigger scope). Not yet resolved which one this is.

## Regulatory landmine — raise FIRST, before any build

Georgia food code requires a commercial/commissary kitchen for
TCS refrigerated prepared meals — a home kitchen does not qualify.
Cottage food law doesn't cover this. This can end the business
overnight if unaddressed, and surfacing it first reprices the
engagement from "building a website" to "de-risking a food business."

## Pricing & operational parameters (client-side)

- Subscription anchor: 15 meals = $130 (~$8.67/meal)
- Delivery: Thursday + Sunday, hard Thursday cutoff
- Cash: one-time orders only, subscriptions must be card
- LLC + EIN + business bank account gates Stripe — hard dependency
- Twilio A2P registration takes ~2 weeks — texts may lag launch
- Rule to hold: the subscription discount is only real if still
  profitable at the discounted price. Need food cost/meal, packaging,
  delivery cost/drop, processing (~2.9%+30¢), kitchen cost before launch.

## RAM's engagement structure

Friend-rate build fee + monthly retainer once live. Platform/tool costs
passed through at cost, in the client's name. Lead with the regulatory
finding + architecture recommendation before writing code — value
delivered before code. Offer a small paid planning phase first rather
than a large upfront quote.

**⚠️ Pattern to break (from Ovis Canem):** RAM previously delivered
founder-level value (architecture, strategy, brand, business model) and
got only expense reimbursement + an unformalized verbal profit share.
Do not repeat — get a written agreement before building, on this
engagement and any future one.

## Open blockers

- Blocks the build: calculator output format confirmed (target macros +
  meals/day + tier) — per-ingredient data only needed if Phase 2 happens.
- Operational gaps: delivery fee amount/threshold, à la carte price,
  exact SMS triggers, whether the LLC is formed yet, whether a
  commercial kitchen is secured or even planned.

## Immediate next moves, in order

1. Surface the TCS/commercial-kitchen finding with the client — first,
   before anything else.
2. Get food-cost-per-meal to pressure-test the $130 price against real
   margin.
3. Confirm the build-vs-rent architecture with the client.
4. Send the scope + pricing doc as RAM Strategic Systems — written,
   signed, before build.
5. Build the calculator, select the meal-prep platform, wire the glue
   to checkout.
