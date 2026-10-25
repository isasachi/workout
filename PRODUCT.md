# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 18 + TypeScript + Vite, installable PWA (vite-plugin-pwa), deployed on Vercel from a GitHub repo. Progress stored on the phone only (IndexedDB via idb-keyval) with JSON export/import. Chosen by the user: modular, code-split, no single-file build.

## Users

Isaac, a fitness beginner training at home with no equipment. During a session the phone rests on the floor or a table and is read from a distance between sets.

## Product Purpose

Turn the "Plan de entrenamiento semanal" (Claude Doc, 2026-10-24) into a guide that shows, not tells: what today's session is, how each exercise is done (animated technique demo), which easier or harder variant to use, and a quick place to note what was done. Success: a beginner opens it, knows what to do today, does it with correct technique, and logs it in seconds.

## Positioning

Built from one specific plan: 8-week, 5 sessions Mon–Sat, bodyweight at home with a chair, wall, towel, door, steps and an optional backpack. Every exercise carries its own progression ladder (easier → harder) from the plan.

## Operating Context

Home, sneakers on a non-slip floor; phone propped up, glanced at between sets; rest 60–90 s on strength days. Intensity guided by RIR (strength) and RPE (cardio/HIIT); HR optional.

## Capabilities and Constraints

- Week view of the plan (Mon strength A, Tue cardio, Wed active recovery, Thu strength B, Fri cardio, Sat HIIT, Sun rest).
- 8-week progression: weeks 1–2 adaptation, 3–5 progression, 6–7 intensification, 8 deload. Sets, cardio minutes and HIIT blocks depend on the week.
- Per exercise: animated technique demo, cues, variant switcher along its ladder.
- Log per set (reps or seconds, variant used) and per cardio/HIIT session (done, minutes). History per exercise.
- Spanish UI. No accounts, no social, no gamification beyond simple progress. "Nada de sobreingeniería."

## Evidence on Hand

The plan document itself. No photos or video of the user; demos must be drawn/animated.

## Product Principles

1. Show before telling: every exercise is understood from the animation first, words second.
2. Readable from the floor: one big thing per screen, large numerals, large tap targets.
3. Logging takes one or two taps; defaults come from the plan.
4. The plan decides; the app never asks the beginner to plan.
5. Safety cues are part of technique, not footnotes.

## Accessibility & Inclusion

Large type and targets for at-a-distance reading; respects reduced motion (demos remain viewable step by step).

## Brand Commitments

Standing preference: the category standard played straight. Bar: Apple Fitness and Nike Training Club.
