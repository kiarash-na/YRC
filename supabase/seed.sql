-- ============================================================================
-- YRC seed data
--   - the points menu (score_actions)
--   - all events, generated from content/events/*.mdx
--     by scripts/generate-events-seed.mjs — do not edit by hand
--   - one QR check-in token per event
-- Safe to re-run: every insert is idempotent.
--
-- NOTE: the first admin seat is intentionally NOT in this file (personal
-- email in a public repo). Run it once by hand in the Supabase SQL editor:
--   insert into public.admins (email) values ('<admin-email>');
-- Then link the seat to a Strava athlete ID via the /admin/admins page.
-- ============================================================================

begin;

insert into public.score_actions (key, points, description)
values ('event_attendance', 10, 'Checking in at an event')
on conflict (key) do nothing;

insert into public.events
  (slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body)
values (
  'berlin-half-marathon-2026',
  'Berlin Half Marathon 2026',
  'Our spring race trip to Berlin: 21.1K on famously fast streets, with a full YRC travel group.',
  '/YRC/Events/Upcoming/Istanbul%20Marathon%202025/M06.jpg',
  '2026-04-12',
  '2026-04-14',
  'Start area at Karl-Marx-Allee',
  'Berlin',
  'race',
  null,
  $yrc$The Berlin Half Marathon kicked off our 2026 racing season, and eighteen YRC runners made the trip. Flat roads, big crowds, and a finish through the city centre made it the perfect early-season target.

## Race weekend

We flew out on Friday, collected bibs together at the expo, and ran a short shakeout along the Spree on Saturday morning. On race day the group split into three pace pods, and every single runner finished, with five personal bests on the board.

The weekend closed with the traditional YRC recovery brunch in Kreuzberg and a very slow walk back to the hotel.

- **Distance:** 21.1K, flat city course
- **Result:** 18 starters, 18 finishers, 5 PBs
- **Trip length:** three nights, group hotel near Ostbahnhof

## Looking ahead

Berlin is now a fixture on our spring calendar. If you missed this year's trip, watch the events page for next spring's race announcement around December.$yrc$
)
on conflict (slug) do nothing;

insert into public.events
  (slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body)
values (
  'bosphorus-speed-work',
  'Bosphorus Speed Work',
  'Wednesday evening intervals along the waterfront. Structured workout, coached warm-up, all paces welcome.',
  '/YRC/5.png',
  '2026-10-14',
  null,
  'Kuruçeşme waterfront, by the rowing club gate',
  'Istanbul',
  'training',
  'https://yasrise.run/events/bosphorus-speed-work',
  $yrc$Our weekly speed session moves to the Bosphorus path for the autumn block. The flat, measured stretch between Kuruçeşme and Bebek is perfect for intervals, and the sea air keeps the hard efforts honest.

## What to expect

We meet at 19:00 sharp for a coached dynamic warm-up, then split into pace groups for the main set. This week's session is 6 times 1K at threshold pace with 90-second jog recoveries. Beginners get a scaled version with shorter reps and full recovery.

- **Bring:** running shoes, a small water bottle, and a light layer for the cool-down
- **Bag drop:** supervised bag area at the meeting point
- **Level:** every pace is welcome; groups run clockwise so nobody gets dropped

## How to join

Register so the coaches know the group sizes in advance. If it is your first speed session with YRC, arrive ten minutes early and ask for the group captain.$yrc$
)
on conflict (slug) do nothing;

insert into public.events
  (slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body)
values (
  'cappadocia-altitude-training-camp',
  'Cappadocia Altitude Training Camp',
  'Four days of trails, hills, and team time at 1,200 meters. Our winter training camp in the valleys of Cappadocia.',
  '/YRC/17.png',
  '2027-02-05',
  '2027-02-08',
  'Göreme, camp lodge next to the valley trails',
  'Nevşehir',
  'camp',
  'https://yasrise.run/events/cappadocia-altitude-training-camp',
  $yrc$Once a year we trade the city for the valleys. The Cappadocia camp is four days of structured training at roughly 1,200 meters of altitude, with soft trail surfaces that are kind to tired winter legs.

## What to expect

Mornings start with the main session: one long run, one hill workout, and one steady trail run across the weekend, all on marked routes through Göreme and the Red Valley. Afternoons are for recovery walks, mobility sessions, and a workshop on race nutrition.

Evenings are camp life at its best. Shared dinners at the lodge, route planning for the next day, and a film night with race footage from the season.

- **Includes:** lodge accommodation, all meals, and coaching
- **Travel:** group transfer from Kayseri airport on Friday afternoon
- **Level:** runners comfortable with 10K distances and up

## How to join

The camp is capped at 16 runners. Register through the link above and we will confirm your place within a week.$yrc$
)
on conflict (slug) do nothing;

insert into public.events
  (slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body)
values (
  'dubai-10k-night-race',
  'Dubai 10K Night Race',
  'A flat, floodlit 10K under the Dubai skyline. Ideal for a winter personal best and a warm mid-season trip.',
  '/YRC/11.png',
  '2027-01-16',
  null,
  'Start at Dubai Harbour, main promenade',
  'Dubai',
  'race',
  'https://yasrise.run/events/dubai-10k-night-race',
  $yrc$January in Istanbul is cold, so we take the training somewhere warm. The Dubai 10K Night Race is flat, fast, and run entirely after sunset on closed roads along the harbour.

## What to expect

Gun time is 20:00, which means a slow morning, a light lunch, and an afternoon shakeout on the beach before we head to the start village together. The course is two loops with timing mats every kilometer, so pacing by feel is easy even under the lights.

- **Distance:** 10K, two flat loops
- **Pace groups:** led by YRC captains for 45, 50, and 55 minute targets
- **Trip:** two nights in a shared hotel near the start line

## How to join

Sign up through the link above. Race entry, hotel, and airport transfers are booked as one YRC package, and spots are limited to 20 runners this year.$yrc$
)
on conflict (slug) do nothing;

insert into public.events
  (slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body)
values (
  'istanbul-marathon-2026',
  'Istanbul Marathon 2026',
  'The only marathon that crosses two continents. Run the Bosphorus Bridge with the full YRC crew behind you.',
  '/YRC/Events/Upcoming/Istanbul%20Marathon%202025/M05.jpg',
  '2026-11-08',
  null,
  'Start line at the Bosphorus Bridge, Asian side',
  'Istanbul',
  'race',
  'https://yasrise.run/events/istanbul-marathon-2026',
  $yrc$The Istanbul Marathon is our flagship race of the year, and 2026 will be no different. Whether you are targeting the full 42K or the 15K, YRC runners travel, warm up, and cross the bridge together.

## What to expect

We organize a shared bus to the start area in Altunizade, a team meeting point near the baggage drop, and a pacers' plan for the most common goal times. After the finish in Sultanahmet, we regroup at the YRC flag for photos and recovery snacks.

- **Distances:** marathon, 15K, and public run options
- **Team kit:** wear your YRC singlet so we can spot you on the course
- **Support:** cheer squads at Beşiktaş and Karaköy

## How to join

Race entry is purchased through the official marathon organizer. Register with YRC as well so you are included in the bus list, pacing groups, and post-race meetup details.$yrc$
)
on conflict (slug) do nothing;

insert into public.events
  (slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body)
values (
  'kadikoy-coffee-run',
  'Kadıköy Coffee Run',
  'A slow Saturday morning loop through Moda, ending at our favourite coffee spot. Running is only half the point.',
  '/YRC/24.png',
  '2026-05-23',
  null,
  'Kadıköy pier, in front of the ferry building',
  'Istanbul',
  'social',
  null,
  $yrc$The Coffee Run is exactly what it sounds like: a gentle 5K through Moda's back streets with a long table reserved at the end. It has quietly become the best way to meet the community if you are new.

## What to expect

We gather at the pier at 09:00 and set off along the waterfront before turning into the quieter streets around Moda Caddesi. The pace is set by whoever is chattiest that morning, and the route loops back down to the sea for a coffee stop at a neighbourhood roastery that opens early for us.

First-timers get paired with a regular so nobody runs or orders alone.

- **Distance:** 5K, mostly flat with one small hill
- **Pace:** slow on purpose
- **After:** coffee and breakfast, usually until around 11:00

## How to join

Just turn up. If you want a message the evening before with the weather plan, leave your number with any YRC captain at a community run.$yrc$
)
on conflict (slug) do nothing;

insert into public.events
  (slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body)
values (
  'munich-tuesday-community-run',
  'Munich Tuesday Community Run',
  'Every Tuesday morning in Munich: an easy social run, drills, and coffee at Café Tante Chylla. First edition on 22 September 2026.',
  '/YRC/Community/IMG_2469.JPG',
  '2026-09-22',
  null,
  'Café Tante Chylla',
  'Munich',
  'social',
  null,
  $yrc$Tuesdays are getting an upgrade. Our new Munich community run is a weekly ritual: meet early, move together, and finish with coffee and good company at Café Tante Chylla. No pace pressure, no egos — just a great way to start the day. ☕️

The first edition on **22 September 2026** is a demo run to get things started — come help us kick it off.

## What to expect

An easy, social 45-minute run of about 7–8 km, wrapped in everything a good morning session needs:

- **Meet:** 06:45 at Café Tante Chylla
- **Run starts:** 07:00 sharp
- **Format:** proper warm-up, running drills, an easy social loop, and a cool-down together
- **After:** freshly brewed coffee, snacks, good music and chit chat at the café

## How to join

Just show up — no registration needed. We meet at **Café Tante Chylla** at 06:45; you can find the café on the map here: [Café Tante Chylla on Google Maps](https://maps.app.goo.gl/uPhXTRTn2J9nFP3YA).

This run happens **every Tuesday**, so if you can't make the first one, we'll see you the week after. 🏃‍♀️$yrc$
)
on conflict (slug) do nothing;

insert into public.events
  (slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body)
values (
  'summer-sunset-social-run',
  'Summer Sunset Social Run',
  $yrc$Golden-hour miles along the Marmara coast, finished with a picnic on the grass. July's community favourite.$yrc$,
  '/YRC/22.png',
  '2026-07-11',
  null,
  'Caddebostan sahil, in front of the amphitheatre',
  'Istanbul',
  'social',
  null,
  $yrc$Mid-July heat means we run late and slow. The Sunset Social starts at 19:30, just as the coast cools down, and follows the Caddebostan promenade while the sky does its best work over the Marmara.

## What to expect

An easy 6K out-and-back at walking-pace-conversation effort. Nobody races a sunset run. We stop twice for photos and water, and strollers and dogs on leads are welcome.

The real event is after the run: a shared picnic on the grass at Caddebostan. YRC brings the coolers and watermelon, you bring whatever you like to add to the spread.

- **Distance:** 6K, flat promenade
- **Pace:** genuinely easy, all levels
- **After:** picnic until the lights come on along the coast

## How to join

No registration needed, just show up. Regulars wear something light-coloured so the group photo looks right against the sunset.$yrc$
)
on conflict (slug) do nothing;

insert into public.events
  (slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body)
values (
  'tehran-spring-half-marathon',
  'Tehran Spring Half Marathon',
  'A spring racing trip to Tehran: 21.1K through the northern districts, plus a weekend of community runs.',
  '/YRC/8.png',
  '2027-03-20',
  '2027-03-22',
  'Start area near Mellat Park',
  'Tehran',
  'race',
  'https://yasrise.run/events/tehran-spring-half-marathon',
  $yrc$Our second international race trip of the season takes us to Tehran for a spring half marathon. The course rolls gently through the northern part of the city with views toward the Alborz mountains, and the timing lines up with mild Nowruz-season weather.

## What to expect

This is a three-day trip. We land on Friday, run an easy shakeout along the park loop, race on Saturday morning, and finish the weekend with a long brunch and a group walk through the bazaar district.

- **Distance:** 21.1K, with a 10K option for newer runners
- **Travel:** group flights and shared hotel block arranged by YRC
- **On course:** two aid stations plus our own bottle table at 12K

## How to join

Register through the link above by the end of January. Passport validity of at least six months is required, and YRC will send a visa and packing checklist to confirmed runners.$yrc$
)
on conflict (slug) do nothing;

insert into public.events
  (slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body)
values (
  'track-thursdays-interval-session',
  'Track Thursdays Interval Session',
  'Proper track night: 400s and 200s under the lights, with drills and stride work for newer runners.',
  '/YRC/14.png',
  '2026-12-03',
  null,
  'Burhan Felek Athletics Stadium, Kadıköy',
  'Istanbul',
  'training',
  'https://yasrise.run/events/track-thursdays-interval-session',
  $yrc$Track Thursdays are where leg speed is built. One evening a month we book lanes at Burhan Felek and run a structured interval program under the stadium lights.

## What to expect

The evening starts at 19:30 with drills and strides, then the main set: 10 times 400 meters at your 5K pace with equal recovery, finishing with 4 times 200 meters relaxed and fast. Captains time every rep so you can just run.

Newer runners join the technique group first, working on cadence and form before merging into the intervals for the second half of the session.

- **Bring:** spikes are not needed, regular trainers are fine
- **Surface:** all-weather track, so the session runs in rain
- **After:** stretching circle and tea at the clubhouse

## How to join

Entry is limited by our lane booking, so register early. The gate code and lane assignment are emailed to registered runners the day before.$yrc$
)
on conflict (slug) do nothing;

insert into public.events
  (slug, title, excerpt, cover, event_date, end_date, location, city, category, registration_url, body)
values (
  'yrc-community-run',
  'YRC Community Run',
  'Start the week together. A relaxed community run for every level, followed by time to connect.',
  '/YRC/Events/Upcoming/Istanbul%20Marathon%202025/03.jpg',
  '2026-10-04',
  null,
  'Meeting point announced to registered runners',
  'Istanbul',
  'social',
  'https://yasrise.run/events/yrc-community-run',
  $yrc$Our community runs are the heartbeat of YRC — no bibs, no pressure, no one left behind. Show up, run together, stay for the conversation after.

## What to expect

A relaxed 5K or 10K at conversational pace, grouped so nobody runs alone. First-timers are welcome and looked after from the first step.

- **Distance:** 5K / 10K, your choice on the day
- **Pace:** easy and social — this is not a workout
- **After:** coffee and time to connect with the community

## How to join

Register through the link above so we know to expect you. The exact meeting point is shared with registered runners a few days before the run.$yrc$
)
on conflict (slug) do nothing;

-- one active QR token per event that doesn't have one yet
insert into public.event_checkin_tokens (event_id)
select e.id
from public.events e
where not exists (
  select 1 from public.event_checkin_tokens t where t.event_id = e.id
);

commit;
