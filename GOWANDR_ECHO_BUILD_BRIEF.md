# GoWandr Echo App Build Brief

## Product Direction

GoWandr is pivoting away from booking, flight search, AI planning, and travel APIs.

The new app helps travelers and groups turn scattered travel inspiration into a confident decision.

Core promise:

> Save the trips you are dreaming about. GoWandr helps you and your group choose the one that is actually worth doing.

The product should feel modern, beautiful, clear, emotionally easy, and lightweight. It should not feel like admin work, a travel spreadsheet, a booking engine, or a generic Pinterest clone.

## Hard Constraints

- No AI features.
- No flight, hotel, booking, map, weather, or travel inventory APIs.
- No native booking.
- Do not force login for the first experience.
- Do not make the user enter receipts, reservation numbers, documents, confirmation codes, or detailed itinerary data.
- The app should create value through saved inspiration, decision tools, voting, smart local logic, and excellent UX.

## Brand Assets

Use the uploaded GoWandr logo assets:

- `C:/Users/creat/Documents/GoWandr files/GoWandr Logo Final/Design Files/GoWāndr-Logo-Full-Black.png`
- `C:/Users/creat/Documents/GoWandr files/GoWandr Logo Final/Design Files/GoWāndr-Logo-Full-Color.png`
- `C:/Users/creat/Documents/GoWandr files/GoWandr Logo Final/Design Files/GoWāndr-Logo-Full-White.png`
- `C:/Users/creat/Documents/GoWandr files/GoWandr Logo Final/Design Files/GoWāndr-Logo-Icon-Black.png`
- `C:/Users/creat/Documents/GoWandr files/GoWandr Logo Final/Design Files/GoWāndr-Logo-Icon-Color.png`
- `C:/Users/creat/Documents/GoWandr files/GoWandr Logo Final/Design Files/GoWāndr-Logo-Icon-White.png`

Preferred visual identity:

- Calm premium travel aesthetic.
- Use the teal brand colors from the logo as the main brand accent.
- Avoid a generic SaaS dashboard look.
- Avoid overly playful cartoon styling.
- Use large destination imagery, editorial spacing, soft cards, clear hierarchy, and crisp mobile patterns.
- The app should feel like travel inspiration with decision clarity, not a finance tool.

## Product Structure

The app has three main pillars:

1. Echo
2. Matchup
3. Trip Lab

### Echo

Echo is where users collect travel inspiration.

This should not feel like a heavy planning board. It should feel fast, visual, and low-pressure.

Users create Trip Drafts such as:

- Miami Birthday
- Solo Reset
- New Orleans Weekend
- Jamaica Baecation
- Europe Someday

Each Trip Draft can contain saved ideas:

- photo or image placeholder
- title
- note
- optional pasted link as plain text
- optional media link from TikTok, Instagram Reels, YouTube, Shorts, blogs, or websites
- thumbnail preview when available
- category
- quick tags
- priority

Suggested idea categories:

- Food
- Stay
- Beach
- Nightlife
- Culture
- Adventure
- Shopping
- Photo Spot
- Relax
- Other

Suggested quick tags:

- Must-do
- Maybe
- Skip
- Chill
- Active
- Romantic
- Friends
- Family
- Solo
- Food
- Nightlife
- Beach
- Culture
- Luxury
- Low-key

Echo should generate a simple local summary using rules, not AI.

Example summaries:

- "This trip is shaping up as a food and nightlife weekend."
- "This feels more like a relaxed couple trip than a group trip."
- "You have a lot of must-dos for a short trip. Pick the top 3 first."
- "This draft feels split between beach reset and party weekend."

### Matchup

Matchup is the killer feature.

It helps individuals or groups compare trip ideas and decide where to go.

User flow:

1. Host selects 2-4 Trip Drafts.
2. App creates a visual matchup.
3. Host can vote alone or share with friends.
4. Friends vote without creating an account.
5. App shows the best trip based on excitement, realism, dealbreakers, and commitment.

Matchup should feel fun, quick, and visual.

Voting should take less than 60 seconds.

Voting prompts:

- Which trip feels more exciting?
- Which trip feels easier to actually pull off?
- Which trip would you be most ready to commit to?
- Which trip feels more memorable?
- Which trip fits the group better?
- Which one would you regret skipping?

Reaction chips:

- I'm in
- Maybe
- Too pricey
- Not my vibe
- Dream trip
- Easy yes
- Need dates
- Too far
- No passport
- Love the food
- Too much planning

Dealbreaker chips:

- Too expensive
- Too far
- Dates do not work
- No passport
- Not enough nightlife
- Too much partying
- Too outdoorsy
- Not relaxing enough
- Already been
- Safety concern

Commitment meter:

- Just browsing
- Interested
- I'd go if dates work
- Ready to plan
- Ready to book elsewhere

The app should make visible the difference between casual excitement and real commitment.

Example result:

> New Orleans is the easiest yes. Miami is the most exciting, but two people marked it as too pricey.

### Trip Lab

Trip Lab starts after a matchup winner is chosen.

It should help the group shape the winning trip without turning into admin work.

Possible MVP features:

- Choose top 3 must-dos.
- Sort ideas into Day, Night, Food, Chill, and Backup.
- Pick trip pace: relaxed, balanced, packed.
- Keep a simple "final plan" page.
- Generate a shareable visual decision card.

Do not build detailed itinerary scheduling in the first version unless the rest of the MVP is already solid.

## No-Login Sharing

Voting should not require login.

Guest voting flow:

1. Friend opens shared matchup.
2. Friend enters nickname.
3. Friend optionally picks an avatar color.
4. Friend votes.
5. Vote is stored against a guest participant.

For a local MVP without backend:

- Create a simulated share flow inside the app.
- Show a share preview card.
- Allow "Add guest vote" locally to demo how group voting works.

Later backend version:

- Host creates a share link.
- Guests vote in browser or app.
- Guest identity can be stored with a local token.
- Host can lock voting or remove votes.

## Main Screens

### 1. Welcome / Onboarding

Goal: Explain the new GoWandr in one clear moment.

Suggested copy:

> Turn travel ideas into a decision.

Supporting copy:

> Save the places you are dreaming about, compare trip ideas with your group, and choose the one that actually feels worth doing.

Primary action:

- Start a Trip Draft

Secondary action:

- Try a Demo Matchup

### 2. Home

Home should show:

- brand header
- active Trip Drafts
- active Matchups
- quick action buttons

Primary actions:

- New Trip Draft
- New Matchup
- Add Inspiration

Home should not look empty or boring. If there is no user content, use beautiful starter examples and gentle prompts.

### 3. Echo Draft Detail

Show:

- large visual header
- draft name
- vibe chips
- Echo summary
- Trip Clarity score
- saved ideas grid/list
- Must-do / Maybe / Skip sections

Primary actions:

- Add idea
- Compare this trip
- Pick top 3

### 4. Add Inspiration

Keep this very lightweight.

Fields:

- title
- note
- category
- quick tags
- priority
- optional image placeholder or imported image later

Do not require every field.

### Link And Media Saves

Echo should support saving inspiration from pasted links.

Target platforms:

- TikTok
- Instagram Reels
- YouTube
- YouTube Shorts
- travel blogs
- restaurant or destination websites
- generic URLs

The save flow should be lightweight:

1. User pastes a link.
2. App detects the platform.
3. App attempts to get a title and thumbnail.
4. User can quickly edit title, category, tags, and priority.
5. If no thumbnail is available, app shows a polished fallback card and lets the user add an image manually.

Important technical note:

- Do not make thumbnail extraction feel like a guaranteed promise for every social platform.
- YouTube thumbnails are usually predictable from the video ID.
- TikTok, Instagram Reels, and other social platforms may block or limit metadata access.
- The app should fail gracefully with a beautiful placeholder card, not an error-heavy experience.

Recommended MVP behavior:

- YouTube/Shorts: parse video ID and show thumbnail when possible.
- Generic URLs: try basic page metadata if technically available.
- TikTok/Reels: save the link, infer platform, show brand-style placeholder, and allow user-added image/screenshot.
- Later: add a backend link-preview service only if the product proves this behavior is important enough.

This matters because Echo should feel better than Pinterest, but it should not depend on fragile scraping.

### 5. Create Matchup

User selects 2-4 drafts.

Optional setup:

- name the matchup
- add possible dates
- choose group vibe

Primary action:

- Start Voting

### 6. Voting

Use big visual cards.

Patterns:

- head-to-head cards
- progress dots
- tap choice buttons
- reaction chips
- commitment meter

Make voting feel fast and satisfying.

### 7. Results

Show:

- winning trip
- group match percentage
- most exciting trip
- easiest to pull off
- most polarizing
- top dealbreakers
- commitment summary
- next best action

Example:

> Best Choice: New Orleans Weekend
>
> 84% group match. Strongest commitment, lowest friction, and the clearest food + music vibe.

Primary actions:

- Move to Trip Lab
- Share Result
- Run Another Matchup

### 8. Trip Lab

Show:

- winner card
- top must-dos
- group notes
- pace setting
- simple sections
- shareable final plan card

## Smart Local Logic

Use deterministic local rules. No AI.

### Trip Clarity Score

Score out of 100.

Possible inputs:

- has destination or clear draft name
- has 3+ saved ideas
- has at least one must-do
- has selected vibe tags
- has trip type tags
- has too many conflicting tags
- has too many must-dos
- has a selected pace

Example scoring:

- +15 has title
- +15 has at least 3 ideas
- +15 has at least one must-do
- +15 has 2-4 strong vibe tags
- +10 has companion type
- +10 has pace
- -10 has 8+ must-dos
- -10 has conflicting tags such as "family" and "nightlife" dominating the same draft

### Matchup Score

Score each trip using:

- excitement votes
- ease votes
- commitment level
- number of dealbreakers
- number of "too pricey" reactions
- number of "easy yes" reactions
- number of must-do saves
- clarity score

Example result categories:

- Best Overall
- Most Exciting
- Easiest Yes
- Most Relaxing
- Best Someday Trip
- Most Polarizing

The app should explain results in plain language.

## Monetization Direction

Do not block the core first experience too early.

Free:

- limited Trip Drafts
- limited saved ideas
- one active Matchup
- basic voting
- basic result

Premium:

- unlimited Trip Drafts
- unlimited Matchups
- group voting links
- advanced results
- shareable visual cards
- Trip Lab
- private matchups
- saved group preferences

Suggested paid promise:

> Make group travel decisions easier, faster, and less chaotic.

## UX Principles

- Low input, high reward.
- Never make users feel like they are doing homework.
- Every screen should answer: what can I do next?
- Use defaults and chips instead of long forms.
- Show progress and clarity.
- Make empty states useful and beautiful.
- Keep group voting lightweight and fun.
- Use plain language.
- Avoid travel-industry jargon.
- Avoid admin-style dashboards.
- Prioritize mobile ergonomics.
- Make the app feel emotionally trustworthy.

## Visual Direction

The app should feel:

- modern
- premium
- warm
- clear
- mobile-native
- travel-inspired
- visually appealing

UI guidance:

- Use the GoWandr teal as a brand anchor.
- Pair teal with warm off-white, charcoal, soft sky, and subtle coral/sun accents.
- Use rounded image cards with restrained radius.
- Use large readable typography.
- Use clear bottom navigation.
- Use tactile chips and segmented controls.
- Use destination image placeholders or curated local image assets for demos.
- Avoid clutter.
- Avoid dense financial UI.
- Avoid generic blue SaaS layouts.

## Suggested Navigation

Bottom tabs:

- Echo
- Matchup
- Lab
- Profile

For MVP, Profile can be minimal or omitted.

Alternative MVP tabs:

- Home
- Echo
- Matchup

## Demo Data

Include beautiful demo drafts so the app does not feel empty:

### Miami Birthday

Tags:

- beach
- nightlife
- friends
- celebration
- active

Ideas:

- Rooftop dinner
- Beach day
- Wynwood photos
- Night out
- Brunch spot

### New Orleans Weekend

Tags:

- food
- music
- culture
- friends
- low-key

Ideas:

- Live jazz night
- French Quarter walk
- Beignets
- Garden District
- Food crawl

### Jamaica Reset

Tags:

- beach
- romantic
- relax
- warm
- dream trip

Ideas:

- Beach resort day
- Sunset dinner
- Waterfall visit
- Spa morning
- Slow breakfast

### Mexico City Food Trip

Tags:

- food
- culture
- city
- walking
- adventure

Ideas:

- Taco crawl
- Museum day
- Park walk
- Rooftop drinks
- Market visit

## Build Priority

Phase 1 MVP:

1. Brand setup and visual system
2. Home screen with demo data
3. Echo Trip Draft list
4. Echo Draft detail
5. Add/edit idea locally
6. Trip Clarity score
7. Create Matchup from drafts
8. Voting flow
9. Results screen
10. Simple local persistence

Phase 2:

1. Guest voting simulation
2. Shareable visual result card
3. Trip Lab
4. Premium gating
5. Account/backend only if needed

## Implementation Notes

If building in Expo/React Native:

- Use local state first, then AsyncStorage or SQLite for persistence.
- Keep scoring logic in separate utility files.
- Keep sample trip data in a dedicated data file.
- Build reusable components for cards, chips, buttons, score rings, and matchup cards.
- Avoid adding heavy dependencies unless clearly needed.
- Make the UI polished before expanding features.

Suggested file structure:

```txt
src/
  components/
    Button.tsx
    Chip.tsx
    EchoCard.tsx
    IdeaCard.tsx
    MatchupCard.tsx
    ScoreRing.tsx
  data/
    demoTrips.ts
  logic/
    clarityScore.ts
    matchupScore.ts
    summaries.ts
  screens/
    HomeScreen.tsx
    EchoScreen.tsx
    EchoDetailScreen.tsx
    AddIdeaScreen.tsx
    CreateMatchupScreen.tsx
    VotingScreen.tsx
    ResultsScreen.tsx
    TripLabScreen.tsx
  storage/
    tripsStorage.ts
  theme/
    colors.ts
    spacing.ts
    typography.ts
  types.ts
```

## Product North Star

GoWandr should not be another place to save pretty travel pictures.

It should help users and groups answer:

> Where are we actually going?

The emotional win is clarity.

The practical win is fewer messy group chats, fewer abandoned travel ideas, and faster decisions.
