---
name: Entreno
description: A coach on the floor beside you; one exercise, one animated figure, one number at a time.
colors:
  ground: "#000000"
  surface: "#161618"
  surface-raised: "#262629"
  surface-high: "#3a3a3e"
  stage: "#111113"
  bar: "#111113"
  line: "#2c2c2e"
  ink: "#ffffff"
  ink-secondary: "#aeaeb2"
  ink-tertiary: "#8e8e93"
  lime: "#b8f23f"
  on-lime: "#0d1600"
  lime-tint: "#1e2a0c"
  lime-pale: "#dcf7a6"
  danger: "#ff6961"
  session-strength: "#b8f23f"
  session-cardio: "#5ac8fa"
  session-hiit: "#ff5c7a"
  session-recovery: "#ffc24b"
  session-rest: "#636366"
  stage-floor: "#1a1a1d"
  mannequin: "#dcdce1"
typography:
  display:
    fontFamily: "'Archivo Variable', 'Archivo', -apple-system, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 112"
  headline:
    fontFamily: "'Archivo Variable', 'Archivo', -apple-system, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "'Archivo Variable', 'Archivo', -apple-system, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 112"
  numeral-timer:
    fontFamily: "'Archivo Variable', 'Archivo', ui-rounded, -apple-system, system-ui, sans-serif"
    fontSize: "84px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 82"
  numeral-count:
    fontFamily: "'Archivo Variable', 'Archivo', ui-rounded, -apple-system, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 82"
  numeral-stat:
    fontFamily: "'Archivo Variable', 'Archivo', ui-rounded, -apple-system, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 82"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
  body-strong:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.25
  note:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  row: "12px"
  inner: "14px"
  capsule: "16px"
  card: "20px"
  pill: "999px"
spacing:
  tight: "6px"
  row: "12px"
  gutter: "16px"
  screen: "24px"
  section: "32px"
  stack: "36px"
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
    padding: "0 24px"
    height: "64px"
    width: "100%"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "56px"
  button-quiet:
    textColor: "{colors.lime}"
    typography: "{typography.body-strong}"
    padding: "0 12px"
    height: "44px"
  demo-control:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "44px"
  demo-control-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.pill}"
    size: "44px"
  stage:
    backgroundColor: "{colors.stage}"
    rounded: "{rounded.card}"
  week-day:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.capsule}"
    padding: "8px 0 10px"
  week-day-today:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.capsule}"
    padding: "8px 0 10px"
  stats-strip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.numeral-stat}"
    rounded: "{rounded.card}"
    padding: "14px 16px 16px"
  list-group:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  exercise-row:
    typography: "{typography.body-strong}"
    padding: "10px 14px 10px 10px"
    height: "84px"
  set-row:
    backgroundColor: "{colors.surface}"
    typography: "{typography.numeral-count}"
    rounded: "{rounded.card}"
    padding: "14px 14px 14px 18px"
  set-row-done:
    backgroundColor: "{colors.lime-tint}"
    rounded: "{rounded.card}"
  set-check:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "64px"
  set-check-on:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.on-lime}"
    rounded: "{rounded.pill}"
    size: "64px"
  chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  done-banner:
    backgroundColor: "{colors.lime-tint}"
    textColor: "{colors.lime-pale}"
    rounded: "{rounded.inner}"
    padding: "14px 16px"
  tab-bar:
    backgroundColor: "{colors.bar}"
    textColor: "{colors.ink-tertiary}"
    typography: "{typography.label}"
    height: "58px"
  tab-item-active:
    textColor: "{colors.ink}"
---

# Design System: Entreno

## Overview

**Creative North Star: "The Coach on the Floor"**

Entreno is the category standard played straight: Apple Fitness and Nike Training Club, read from a phone propped on the floor. The ground is true black, surfaces climb in three soft charcoal steps, ink is white, and one lime carries every action and every "done". Each screen has one dominant thing: a large wide title, a 3D technique figure, or a single counted number. Everything else steps back in grey.

The premium pass gives the system two voices. Archivo Variable speaks for the app: stretched wide (112%) and heavy (800) for titles, pulled condensed (82%) for every numeral, so counts and timers sit tall and tight. SF Pro speaks for the coach's words: body copy, cues, labels, and the tab bar. The technique stage is the signature: a matte clay mannequin in a dark studio, lit by a white key and a cool rim, its working muscles in lime, with the full list of the rep's steps fixed beneath it so only the highlight moves.

Density is low and targets are large, because the user glances from two metres away between sets. Depth in the interface comes only from tonal steps; the one place with real light and shadow is inside the stage.

**Key Characteristics:**
- True black ground, three charcoal surface steps, white ink, one lime.
- Wide heavy Archivo titles, condensed tabular Archivo numerals, SF Pro for words.
- A 3D clay mannequin on a dark studio stage, working muscles in lime.
- Every step of the rep listed under the stage; only the highlight moves.
- Session hues only as small marks: dots, rings, segments.
- Soft 20px cards, full pills for every button, an iOS-style tab bar.

## Colors

A monochrome dark ladder with a single acid-lime voice and four small session hues.

### Primary
- **Floor Lime** (lime): the only action and completion colour. Primary pills, the checked set button, the current step's dot under the stage, the progress bar fill, quiet text buttons, focus rings, text selection, and the working muscles on the mannequin.
- **Lime Ink** (on-lime): text and icons on lime; near-black with a green cast so lime pills never read as grey-on-yellow.
- **Lime Tint** (lime-tint) and **Pale Lime** (lime-pale): the completion family. A logged set row turns lime-tint; done and level-up banners are lime-tint with pale-lime text; the "next level" pill on Progress is lime text on lime-tint.

### Secondary
- **Session hues** (session-strength, session-cardio, session-hiit, session-recovery, session-rest): strength lime, cardio cyan, HIIT pink, recovery amber, rest grey. They identify the session type in the meta-line dot, the week-strip rings (filled when the day is done), the Progress grid marks, and the HIIT block segments.

### Neutral
- **True Black** (ground): the page, overlays, and the session sheet header.
- **Charcoal** (surface): cards, list groups, the stats strip, set rows, week-day capsules.
- **Raised Charcoal** (surface-raised): secondary pills, chips, stepper and check buttons, pressed rows, the current week row in Progress.
- **High Charcoal** (surface-high): inactive step dots under the stage and rest-day dots.
- **Stage Black** (stage, bar): the technique stage, the tab bar, and the session footer; one step below charcoal so the figure's studio reads as a recess.
- **Hairline** (line): 1px rules between rows inside one list group and between the three stats.
- **White / Grey / Dim Grey** (ink, ink-secondary, ink-tertiary): primary text; meta lines and notes; dates, chevrons, inactive tabs, and steps not yet current.
- **Coral** (danger): destructive confirmation only (delete data).
- **Studio Floor** (stage-floor) and **Clay** (mannequin): the 3D stage's matte floor and the mannequin's body material.

### Named Rules
**The One Voice Rule.** Lime is the only colour that means "tap this" or "done". Never introduce a second action colour.

**The Marker-Only Rule.** Session hues appear only as small marks (dots, rings, segments at most 28px wide). They never fill a button, a card, or a title.

**The Amber Recovery Rule.** Recovery is amber, never blue: a second blue reads as cardio's cyan at dot size, and blue-violet is a house-banned hue.

## Typography

**Display Font:** Archivo Variable (with Archivo, -apple-system, system-ui)
**Numeral Font:** Archivo Variable, condensed (with ui-rounded, -apple-system)
**Body Font:** SF Pro Text via -apple-system (with system-ui, Segoe UI, Roboto)

**Character:** A wide, heavy grotesque for titles gives the app its premium sports-poster voice; the same family pulled condensed makes numbers tall and economical; SF Pro keeps instructions native and calm.

### Hierarchy
- **Display** (800, 44px, line-height 1, wdth 112): the session title on Hoy ("Fuerza A").
- **Headline** (800, 34px, line-height 1.1, wdth 112): screen titles on Plan and Progreso. The exercise title inside a guided session runs the same voice at 30px.
- **Title** (800, 22px, line-height 1.2, wdth 112): section headings ("Ejercicios", "Calentamiento") and the HIIT phase name (24px).
- **Numeral, timer** (700, 84px, wdth 82, tabular): the running clock in cardio and HIIT (72px when the demo shares the screen); the rest countdown runs at 64px.
- **Numeral, count** (700, 44px, wdth 82, tabular): the value being logged in a set row.
- **Numeral, stat** (700, 34px, wdth 82, tabular): the three numbers in the stats strip; week-strip dates use the same face at 19px.
- **Body** (400, 17px, line-height 1.45): meta lines, step lists under the stage, list text.
- **Body strong** (600, 17px): row names, current step, list summaries.
- **Note** (400, 15px): secondary guidance under lists, in ink-secondary.
- **Label** (600, 13px, sentence case): stat labels, column heads, overlay meta; tab labels at 12px.

### Named Rules
**The Two Widths Rule.** Archivo appears at exactly two widths: 112% for words, 82% for numbers. Titles are never condensed and numerals are never wide.

**The Tabular Number Rule.** Every count, time, dose, date, and week number is set in the condensed numeral face with tabular figures. Words never are.

**The Floor Distance Rule.** Anything read mid-session (cues, the current step, the logged value) is at least 17px; the number being counted is at least 44px.

## Layout

One centered column, at most 560px wide, with 16px gutters that grow to the safe-area inset. Screens are vertical grids: 24px between blocks on Hoy, 32px on Plan and Progreso, 36px between the stacked sections of the session preview, 12px between a heading and its group. Hoy's first viewport runs title, meta line, date line, week strip, stage, stats strip, then the Empezar pill at thumb reach; the stage gives up height (clamp 240px to 380px, 40dvh) instead of width so the pill stays visible. Guided sessions open as a full-screen sheet with a 44px close circle, a centered title and step counter, and a footer on stage black that fades the content scrolling under it. Inside sessions the stage shrinks to 30dvh (25dvh for timed moves) so sets or the timer fit on the first screen. A fixed tab bar of three items sits at the bottom. On desktop the same column simply centers on black.

## Elevation & Depth

The interface is flat. Depth comes from the tonal ladder only: black ground, charcoal surface, raised charcoal for controls and pressed states. There are no box shadows anywhere in the UI. The exception is inside the stage, which is a lit 3D studio: a hemisphere fill, a white key light casting soft PCF shadows (radius 6), two cool rim lights behind the figure to cut the silhouette from the floor, a faint bounce from below, soft contact-shadow blobs where the body meets the floor, and fog in the stage colour so the floor fades into the background with no horizon line.

### Named Rules
**The Tonal Step Rule.** To lift something in the interface, move it one step up the ground / surface / raised ladder. Never add a shadow.

**The Lit Stage Rule.** Light, shadow, and fog belong to the technique stage alone; they never leak out into cards or buttons.

## Shapes

Soft and continuous. Cards, list groups, the stage, set rows, and the stats strip use 20px corners; banners, inset blocks, and Plan week cells use 14px; week-day capsules 16px; thumbnails and Progress grid rows 12px. Every button, chip, stepper, control, track, and dot is a full pill or circle. Inside a group, rows are separated by 1px hairlines; groups themselves have no border. The mannequin is an anatomical figure (MakeHuman's CC0 base mesh: an athletic young man with sculpted muscle, hands and feet, a calm face without hair) in matte clay, wearing charcoal mid-thigh shorts with straight, tailored hems. Its hands lie flat, palm down, on the floor, chair, table or wall whenever the move rests weight on them.

## Components

### Buttons
Full pills, confident and large.
- **Shape:** full pill (999px).
- **Primary:** lime with lime ink, 56px tall, 24px side padding, set in the wide Archivo voice at 800. The Empezar pill on Hoy is full width and 64px tall at 21px, with a filled play icon.
- **Secondary:** raised charcoal with white SF text at 700, same size.
- **Quiet:** transparent with lime 17px text, 44px tall, used for "Ver" and alternate actions.
- **Press:** every button scales to 0.97 on press over 160ms with the house ease; disabled drops to 40% opacity.
- **Focus:** 3px lime outline, 2px offset, across the app.

### Chips
- **Style:** raised charcoal pills, 44px tall, 16px semibold text, stretched to share a row equally.
- **State:** the selected chip inverts to white with black text.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** charcoal on black.
- **Shadow Strategy:** none; see Elevation & Depth.
- **Border:** none; 1px hairlines only between rows inside one group.
- **Internal Padding:** 14 to 16px.

### Lists and Exercise Rows
Grouped iOS-style lists on charcoal. An exercise row is 84px tall: a 64px 3D thumbnail of the move on 14px corners, the name in semibold 17px, the dose in grey 15px, and a dim chevron. Pressing a row fills it raised charcoal.

### Navigation
A fixed three-item tab bar on stage black: 26px line icons over 12px semibold labels, dim grey at rest, white when current, 58px tall above the safe area. Sheets close with a 44px raised-charcoal circle in the top-left.

### Technique Stage (signature)
A 20px-cornered recess in stage black holding the three.js scene: a clay mannequin seen from a three-quarter camera (26 degree field of view) framed on everything the move reaches, with the props it needs (chair, wall, door, towel, step, backpack, mat) in charcoal. Working muscles render in lime, painted onto the muscle itself (quads, glutes, hamstrings, chest, shoulders, triceps, abs, back) with soft edges, never a whole limb. Controls sit in the stage's top-right corner as 44px translucent dark circles (play/pause, 1x or ½x, next step), clear of the figure; the active toggle inverts to white. When WebGL is unavailable, a flat SVG figure takes its place using the demo palette.

### Step List
Directly under the stage, every step of the rep is listed at once, 17px, 10px apart, each with a 9px dot. Steps not current are dim grey with high-charcoal dots; the current step turns white and semibold and its dot turns lime and grows to 1.25x, over 360ms. Timed sessions replace the list with one fixed 19px cue per move that changes only when the move does.

### Week Strip
Seven equal capsules under the Hoy title: day letter (12px semibold), date in the condensed numeral face (19px bold), and a 20px ring in the session hue that fills when the day is logged, with a lime-ink check. Rest days show an 8px grey dot instead of a ring. Today inverts to a white capsule with black text.

### Stats Strip
Three equal cells in one charcoal 20px group directly under the stage, split by hairlines: a 13px semibold grey label over a 34px condensed numeral (minutes, exercises, RIR or RPE).

### Set Row
A 20px charcoal card per set: a grey label, minus and plus circles (48px, raised charcoal) around the 44px condensed value with its unit, and a 64px check circle. Checking fills the circle lime with a short pop and turns the row lime-tint. The next set to log carries the screen's one lime action.

### Timer and Progress
A centered condensed clock with a grey sub-line, an 8px raised-charcoal track filling lime, and for HIIT a row of 28px by 8px block segments that fill pink as blocks complete, with the current block ringed in pink.

## Do's and Don'ts

### Do:
- **Do** keep every screen to one dominant thing: one figure, one number, or one large title, with the primary lime pill at thumb reach.
- **Do** set titles in Archivo at 800 and 112% width, and every number in Archivo at 82% width with tabular figures.
- **Do** keep the full list of the rep's steps under the stage and move only the highlight.
- **Do** place demo controls in the stage's top-right corner as 44px translucent dark circles, clear of the figure's working area.
- **Do** show session type with a small hue dot or ring beside the title, in the week strip, or in a grid, never with a coloured surface.
- **Do** mark completion with the lime family: lime check, lime-tint row, pale-lime banner text.
- **Do** use the single house ease (cubic-bezier(0.22, 1, 0.36, 1)) at 140 to 360ms for presses, fades, and rises.

### Don't:
- **Don't** use shadows to separate interface surfaces; step the tone instead. Hairlines are for rows inside one group only.
- **Don't** add a second accent or let a session hue fill a button, card, or heading.
- **Don't** add a blue or blue-violet session colour; recovery stays amber so it never reads as cardio's cyan at dot size.
- **Don't** condense a title or widen a numeral.
- **Don't** put overlays or labels over the figure; the stage corner is the only place for controls.
- **Don't** set mid-session reading text below 17px or tap targets below 44px.
- **Don't** add small uppercase labels above titles; titles stand on their own with a meta line beneath.
