---
name: Entreno
description: An at-home 8-week bodyweight plan coached from the floor, one figure and one number at a time.
colors:
  ground: "#000000"
  surface: "#1c1c1e"
  surface-raised: "#2c2c2e"
  bar: "#111113"
  ink: "#ffffff"
  ink-secondary: "#aeaeb2"
  ink-tertiary: "#8e8e93"
  lime: "#b8f23f"
  on-lime: "#0d1600"
  lime-tint: "#1e2a0c"
  lime-tint-ink: "#dcf7a6"
  danger: "#ff6961"
  session-strength: "#b8f23f"
  session-cardio: "#5ac8fa"
  session-hiit: "#ff5c7a"
  session-recovery: "#ffc24b"
  session-rest: "#636366"
  demo-stage: "#0e0e10"
  demo-floor: "#1b1b1e"
  demo-figure: "#f2f2f7"
  demo-figure-far: "#6c6c72"
  demo-focus-far: "#5f7d27"
  demo-prop: "#3a3a3f"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
  cue:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.45
  numeral-hero:
    fontFamily: "ui-rounded, 'SF Pro Rounded', -apple-system, system-ui, sans-serif"
    fontSize: "84px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  numeral-count:
    fontFamily: "ui-rounded, 'SF Pro Rounded', -apple-system, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
rounded:
  pill: "999px"
  card: "20px"
  inner: "14px"
  cell: "12px"
spacing:
  gutter: "16px"
  row-gap: "10px"
  block-gap: "12px"
  card-pad: "16px"
  screen-gap: "28px"
  section-gap: "32px"
  column-max: "560px"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.on-lime}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "56px"
  button-primary-hero:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.on-lime}"
    rounded: "{rounded.pill}"
    height: "64px"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "56px"
  button-quiet:
    textColor: "{colors.lime}"
    padding: "0 12px"
    height: "44px"
  icon-button:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "44px"
  chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  grouped-list:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  set-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "14px 14px 14px 18px"
  set-card-done:
    backgroundColor: "{colors.lime-tint}"
  set-check:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "64px"
  set-check-done:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.on-lime}"
  demo-stage:
    backgroundColor: "{colors.demo-stage}"
    rounded: "{rounded.card}"
  tab-bar:
    backgroundColor: "{colors.bar}"
    textColor: "{colors.ink-tertiary}"
    height: "58px"
  tab-bar-active:
    textColor: "{colors.ink}"
---

# Design System: Entreno

## Overview

**Creative North Star: "The Coach on the Floor"**

Entreno plays the fitness category standard straight: the dark, quiet iOS grammar of Apple Fitness and Nike Training Club, tuned to be read from a phone propped on the floor two metres away. Everything sits on a true-black ground in a single centred column; surfaces are one step of charcoal lighter; ink is white with two grey steps. One lime accent carries every action and every "done", and nothing else competes with it.

The signature is the technique figure: a flat, round-capped vector athlete on a near-black stage, with the working muscle group lit in lime and a single cue line beneath it that changes with each phase of the rep. Its controls sit beside the cue, never over the figure. Around it, type and targets run large: 34px titles, 44 to 84px rounded numerals, 56 to 64px pill buttons. Depth comes from tonal steps, never shadow.

**Key Characteristics:**
- True-black ground, charcoal surfaces, white ink, one lime accent.
- Session-type hues exist only as small markers (dots, done marks, HIIT block segments).
- System SF Pro for words, SF Rounded tabular numerals for every count and time.
- Soft 20px containers, 14px inner shapes, pills for everything tappable.
- Flat: no shadows, no borders except hairline row rules inside grouped lists.
- Motion is short and settling (one ease-out curve); reduced motion collapses it.

## Colors

A near-monochrome iOS dark palette with a single acid-lime voice and four small session hues.

### Primary
- **Floor Lime** (lime): the only action colour. Primary pill buttons, quiet text buttons, the focus ring, progress fill, the "today" dot, set-done checks, and the lit muscle group on the figure. Text on it is **Lime Shadow Ink** (on-lime), a near-black green.
- **Lime Tint** (lime-tint) with **Lime Tint Ink** (lime-tint-ink): the done-state wash. A completed set card, the "level up" and "session done" banners, and the progress status pill turn this deep olive; their text is the pale lime.

### Secondary
- **Session hues** (session-strength, session-cardio, session-hiit, session-recovery, session-rest): strength lime, cardio cyan, HIIT pink, recovery amber, rest grey. They mark what kind of day it is: the 12 to 14px dot beside a session title or plan row, the filled ring in the progress grid, the HIIT block track. Recovery is amber, not blue, so it never reads as cardio at dot size.

### Neutral
- **True Black** (ground): every screen and full-screen overlay background.
- **Charcoal Surface** (surface): grouped lists, set cards, the rest timer card, plan week tiles, the progress grid.
- **Raised Charcoal** (surface-raised): secondary pills, chips, round icon buttons, stepper buttons, pressed-row feedback, row hairlines, empty progress segments.
- **Tab Bar Black** (bar): the bottom tab bar and overlay footers, a hair above true black.
- **White Ink / Secondary Ink / Tertiary Ink** (ink, ink-secondary, ink-tertiary): titles and values; meta lines and supporting copy; dates, chevrons, inactive tabs, column heads.
- **Danger Coral** (danger): the "common mistakes" diamond marker and destructive reset actions only.
- **Demo stage set** (demo-stage, demo-floor, demo-figure, demo-figure-far, demo-focus-far, demo-prop): the figure's world. Near limb in pale figure white, far limb in mid grey; focus muscles in lime near and dimmed olive far; props (chair, door, wall, steps) in dark greys so the body always reads first.

### Named Rules
**The One Voice Rule.** Lime is the only colour that means "tap this" or "done". Never introduce a second action colour.

**The Marker-Only Rule.** Session hues appear only as small marks (dots, rings, segments at most 28px wide). They never fill a button, a card, or a title.

## Typography

**Display Font:** SF Pro via the system stack (-apple-system, BlinkMacSystemFont, with system-ui, Segoe UI, Roboto fallbacks)
**Label/Mono Font:** SF Pro Rounded via ui-rounded, with tabular numerals

**Character:** The native iOS voice, set heavy and large. Heavy 800 titles with slight negative tracking give the large-title feel; rounded tabular numerals make counts and timers friendly and steady as they tick.

### Hierarchy
- **Display** (800, 34px, 1.1, -0.02em): tab-screen large titles (Hoy session title, Plan, Progreso).
- **Headline** (800, 28 to 30px, 1.12 to 1.15, -0.01em): sheet and runner titles (exercise name, day sheet, history).
- **Title** (700, 18 to 22px, 1.2): section heads inside a screen ("Ejercicios", "Mañana").
- **Cue** (600, 19px, 1.3, balanced): the figure's phase cue line and lead sentences. Reserves 2.6em so the layout does not jump as cues change.
- **Body** (400, 17px, 1.45): base copy and list-row names (600 for names).
- **Label** (600, 15px; meta and notes at 15 to 16px regular in secondary ink; tab labels 12px 600).
- **Numerals** (SF Rounded 700, tabular): the session timer (84px, 72px mid), rest countdown (64px), set count (44px), week tiles (16px).

### Named Rules
**The Rounded Number Rule.** Every count, time, week number, and speed label uses the rounded numeral face with tabular figures. Words never do.

**The Floor Distance Rule.** Nothing a user acts on mid-session is set below 17px; the number being counted is at least 44px.

## Layout

One centred column, max 560px, with 16px gutters that grow to the safe-area insets. Tab screens stack sections with 28 to 32px gaps; within a section the head sits 12px above its content. Sheets and the guided session open as full-screen overlays: a 44px close / title / spacer bar on top, a scrolling body, and a sticky footer on the tab-bar black carrying the primary actions at thumb reach. The bottom tab bar (58px plus safe area) holds three items and stays fixed.

There are no breakpoints. On desktop the same 560px column centres on black and the tab bar's items align to it. In session mode the figure is height-capped (25 to 30dvh worth of width) so the sets or timer fit on the first screen.

## Elevation & Depth

Entirely flat. Depth is tonal: ground (black) to bar to surface to raised surface, each a small step lighter. No box-shadows, text-shadows, or blur anywhere. Overlays separate by covering the screen and rising in (24px, 320ms), not by casting shadow.

### Named Rules
**The Tonal Step Rule.** To lift something, move it one step up the ground / surface / raised ladder. Never add a shadow.

## Shapes

Soft and continuous. Containers (lists, set cards, the demo stage, the rest card, the progress grid) use the 20px card radius; nested shapes and smaller panels (thumbnails, week tiles, banners) use 14px; progress-grid rows 12px. Everything tappable that is not a row is a full pill or circle: buttons, chips, steppers, the 64px set check, 44px icon buttons. Progress tracks and segments are pills too. The only sharp form is the danger diamond (a 10px square rotated 45deg with 2px corners) marking mistakes, against the lime circle marking cues. The technique figure is drawn with round line caps throughout.

## Components

### Buttons
Confident, thumb-sized pills.
- **Shape:** full pill (999px), minimum 56px tall, 24px side padding, 18px 700 label.
- **Primary:** lime with on-lime ink. The Hoy "Empezar" hero is 64px tall at 20px and spans the column.
- **Secondary:** raised charcoal with white ink, used for "Atrás", alternates, and skip.
- **Quiet:** transparent, lime 600 text, 44px tall, for inline alternatives and disclosures.
- **Press / Focus:** press scales to 0.97 over 160ms on the house ease; focus is a 3px lime outline offset 2px; disabled drops to 40% opacity.

### Chips
- **Style:** raised charcoal pills, 44px tall, 16px 600, split equally across a row.
- **State:** selected inverts to white with black text (aria-pressed). The same inversion marks the selected plan week and the active demo speed.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** charcoal surface on black.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** none; grouped lists divide rows with a 1px raised-charcoal hairline.
- **Internal Padding:** 14 to 16px; list rows run 68 to 84px tall with a 64px figure thumbnail where the row is an exercise.

### Inputs / Fields
The only input is the set logger: a 48px round minus / plus stepper flanking a 44px rounded numeral with its unit, and a 64px round check. The check turns lime with a short pop when the set is marked, and the whole set card washes to lime tint.

### Navigation
iOS bottom tab bar: three equal items (Hoy, Plan, Progreso), 24px stroke icon over a 12px 600 label, tertiary grey at rest, white when current. No indicator pill, no accent on tabs. Inside overlays, navigation is the round close button top-left and the footer's Atrás / Siguiente pair.

### Technique Figure (signature)
A 220:196 near-black stage with a 20px radius holding a flat, round-capped figure and its props. Working muscles are lit lime (dimmed olive on the far side). Under the stage, in order: the cue line (19px 600, white, changes per rep phase), then a right-aligned row of 44px round controls (play/pause, 1x / half-speed toggle, next step). Controls never overlay the figure. Small still versions serve as list thumbnails at a 14px radius.

### Rest Timer
A charcoal card that slides in (8px, 260ms) above the session footer: secondary-ink "Descansa" label, a 64px rounded countdown, a small hint line, and a secondary "Saltar" pill to the right.

## Do's and Don'ts

### Do:
- **Do** keep every screen to one dominant thing: one figure, one number, or one large title, with the primary lime pill at thumb reach.
- **Do** show session type with a 12 to 14px hue dot beside the title or row, never with a coloured surface.
- **Do** set all numbers in the rounded tabular face (ui-rounded), at 44px or larger when they are being counted live.
- **Do** place demo controls under the figure beside its cue line, as 44px raised-charcoal circles.
- **Do** mark completion with the lime family: lime check, lime-tint card, pale-lime banner text.
- **Do** use the single house ease (cubic-bezier(0.22, 1, 0.36, 1)) at 140 to 320ms for presses, fades, and rises.

### Don't:
- **Don't** use shadows or borders to separate surfaces; step the tone instead.
- **Don't** add a second accent or let a session hue fill a button, card, or heading.
- **Don't** add a blue or blue-violet session colour; recovery stays amber so it never reads as cardio's cyan at dot size.
- **Don't** put controls, labels, or overlays on top of the technique figure.
- **Don't** set interactive text below 17px or tap targets below 44px.
- **Don't** add small uppercase labels above titles; titles stand on their own with a meta line beneath.
