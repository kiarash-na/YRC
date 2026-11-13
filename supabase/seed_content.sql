-- seed_content.sql — one-time content seed for migration 0006_content_db.sql
--
-- Seeds:
--   * public.posts          — the 11 journal articles formerly kept as
--                             MDX files in content/blog/ (frontmatter + body).
--   * public.content_blocks — 'events.course_details' and 'events.faqs', formerly
--                             the courseDetails/faqs exports in src/data/events.ts.
--
-- content/blog/ and src/data/events.ts were retired after this seed was applied;
-- the database is now the source of truth for journal posts and events page copy.
--
-- Generated deterministically from those files (gray-matter for MDX frontmatter).
-- Idempotent: re-runs upsert on posts.slug / content_blocks.key.

begin;

insert into public.posts (slug, title, excerpt, cover, date, author, tags, highlights, body) values ('your-first-long-run-how-far-is-far-enough', 'Your first long run: how far is far enough?', 'The long run is the backbone of every training week, but the right distance depends on where you are, not where the plan says you should be.', '/YRC/5.png', '2026-06-23', 'YRC Coaching Team', '{"Training"}', '{}', $yrc$
Ask five runners how long a long run should be and you will get six answers. The honest one is simpler: long is relative. For someone building toward their first 10K, 50 minutes on their feet is a long run. For a marathoner, that same 50 minutes barely counts as a warm-up.

## Start from what you can already do

A good rule is to take your current longest comfortable run and add ten to fifteen minutes, not ten kilometers. Hold that new distance for two or three weeks before stretching it again. Your cardiovascular system adapts quickly, but your tendons and joints move on a slower schedule, and they are the ones that complain later.

Pace matters less than you think on these runs. If you cannot hold a conversation, you are going too fast for a long run. Slow down, even if it feels embarrassingly easy. The purpose is time on your feet and the patience that comes with it.

Finally, protect the day after. A long run followed by a forced rest day because everything hurts is not progress. Finish feeling like you could have gone a little further, and you chose the right distance.$yrc$) on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, cover = excluded.cover, date = excluded.date, author = excluded.author, tags = excluded.tags, highlights = excluded.highlights, body = excluded.body;

insert into public.posts (slug, title, excerpt, cover, date, author, tags, highlights, body) values ('why-we-run-together-on-sundays', 'Why we run together on Sundays', 'The Sunday group run is the oldest tradition in the club, and it survives because it is about much more than the kilometers.', '/YRC/43.png', '2026-06-28', 'YRC Community', '{"Community"}', '{}', $yrc$
Ask any long-time member when the club really happens and they will not point to a race or a track session. They will point to Sunday morning. The group run is where YRC stops being a logo and becomes a set of people you recognize by their stride.

The format has barely changed over the years. Meet early, split into pace groups so nobody runs alone and nobody gets dropped, loop back for coffee. The fast group and the easy group leave together and, more importantly, finish together.

## What the kilometers carry

The conversation is the real training. New members get their first questions answered somewhere around kilometer three, when the talking gets easy. Race plans get made, weekends get compared, and the occasional terrible idea gets talked out of existence before anyone registers for it.

If you have been running alone and wondering whether a club is for you, Sunday is the low-stakes answer. Show up, say you are new, and let the group do the rest. The distance will pass faster than you expect. It always does when you are not watching your watch.$yrc$) on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, cover = excluded.cover, date = excluded.date, author = excluded.author, tags = excluded.tags, highlights = excluded.highlights, body = excluded.body;

insert into public.posts (slug, title, excerpt, cover, date, author, tags, highlights, body) values ('fueling-the-morning-run', 'Fueling the morning run', 'Should you eat before an early run or head out empty? The answer depends on how far you are going and how your stomach feels about 6 AM.', '/YRC/24.png', '2026-07-01', 'YRC Editorial', '{"Nutrition"}', '{}', $yrc$
The 6 AM crowd at the club splits into two camps: those who cannot run without breakfast and those who cannot run with one. Both are right, for their own runs. The deciding factors are distance, intensity and what your stomach tolerates before sunrise.

For an easy run under an hour, most people can head out on water alone. Your body stores enough glycogen from the night before to cover a relaxed effort. Just drink a glass of water first, since you wake up mildly dehydrated whether you feel it or not.

## When food becomes non-negotiable

Anything longer than an hour, or anything fast, deserves fuel. Keep it small and simple: half a banana, a slice of toast with honey, a few dates. Give yourself twenty to thirty minutes between eating and starting, and avoid fat and fiber before hard efforts, because they digest slowly and announce themselves mid-run.

Afterward, eat a real breakfast within an hour. Protein and carbohydrates together help you recover and stop the late-morning crash. Experiment on training days, write down what worked, and never test a new pre-run meal for the first time on race morning.$yrc$) on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, cover = excluded.cover, date = excluded.date, author = excluded.author, tags = excluded.tags, highlights = excluded.highlights, body = excluded.body;

insert into public.posts (slug, title, excerpt, cover, date, author, tags, highlights, body) values ('easy-pace-is-not-a-failure', 'Easy pace is not a failure', 'Running slowly on purpose is one of the hardest habits for new runners to accept, and one of the most valuable.', '/YRC/11.png', '2026-07-08', 'YRC Editorial', '{"Training"}', '{}', $yrc$
Every club has the same story. A new member joins the Sunday group, spends the whole run trying to keep up with the front pack, and finishes wrecked. Three weeks later they are injured or gone. The pace that broke them was never the goal.

Most of your running, roughly eighty percent of it, should feel genuinely easy. Easy enough to chat, to notice the street, to finish with energy left. This is not a concession to weakness. It is how endurance actually gets built: more oxygen delivered, more efficient movement, more consistency week after week.

## The test that never lies

The talk test beats any watch. If you can speak in full sentences without gasping, the effort is right. If you can only manage single words, back off. Heart rate zones help too, but the talk test works without charging.

Running slowly in a group takes more discipline than running fast alone. Trust that the runners who look relaxed at the back are not slacking. They are the ones who will still be improving in six months, while the heroes of week one are icing their knees.$yrc$) on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, cover = excluded.cover, date = excluded.date, author = excluded.author, tags = excluded.tags, highlights = excluded.highlights, body = excluded.body;

insert into public.posts (slug, title, excerpt, cover, date, author, tags, highlights, body) values ('how-to-pace-your-first-10k', 'How to pace your first 10K', 'Ten kilometers is short enough to feel fast and long enough to punish a bad first kilometer. Here is how to split it.', '/YRC/33.png', '2026-07-21', 'YRC Coaching Team', '{"Races"}', '{}', $yrc$
The first kilometer of a 10K is a trap. The crowd is loud, your taper has you feeling springy, and everyone around you goes out like it is a 5K. If you follow them, you will meet the consequences at kilometer six, and they will not be friendly.

## Think in three parts

Break the race into segments. Kilometers one to three should feel almost too comfortable, a touch slower than your goal pace. You are paying down the adrenaline debt that the start line always runs up. If it feels easy, you are doing it right.

Kilometers four to seven are the race. Settle into goal pace and hold it while others who sprinted the start begin to fade. This section is won with focus, not speed. Keep your breathing rhythmic and your shoulders loose, and check your watch at each marker rather than every hundred meters.

From kilometer eight, empty the tank gradually. Pick a runner ahead and reel them in, then another. A strong finish will not fix a blown first half, but a controlled first half makes the finish possible. Finish upright, and your second 10K will be faster than your first.$yrc$) on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, cover = excluded.cover, date = excluded.date, author = excluded.author, tags = excluded.tags, highlights = excluded.highlights, body = excluded.body;

insert into public.posts (slug, title, excerpt, cover, date, author, tags, highlights, body) values ('strength-work-that-fits-a-runners-week', 'Strength work that fits a runner''s week', 'You do not need a gym membership or two-hour sessions. Twenty focused minutes, twice a week, will keep most running injuries away.', '/YRC/17.png', '2026-08-19', 'YRC Coaching Team', '{"Training"}', '{}', $yrc$
Runners tend to treat strength training like flossing: universally recommended, quietly skipped. The excuse is always time. But the strength work that protects a runner has very little in common with bodybuilding, and it takes far less time than a single tempo run.

## The short list that matters

Your glutes, hips and calves do the heavy lifting in every stride, and they are also where most overuse injuries begin. Squats, lunges, single-leg deadlifts and calf raises cover nearly all of it. Add a plank or two for the core and you have a complete session.

Twice a week is enough. Slot the sessions after easy runs or on rest days, never the day before a hard workout or a race. Bodyweight is fine to start; a backpack with books adds load when the movements get easy.

The payoff is not visible in the mirror. It shows up at kilometer thirty of a long run, when your form holds instead of collapsing, and in the seasons you complete without a physio appointment. Twenty minutes, twice a week. That is the whole secret.$yrc$) on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, cover = excluded.cover, date = excluded.date, author = excluded.author, tags = excluded.tags, highlights = excluded.highlights, body = excluded.body;

insert into public.posts (slug, title, excerpt, cover, date, author, tags, highlights, body) values ('new-to-the-club-your-first-month', 'New to the club? Your first month at YRC', 'Four weeks, four steps: how to go from nervous first-timer to the person who knows everyone''s name at the start line.', '/YRC/Home/pexels-runffwpu-18409430.jpg', '2026-08-27', 'YRC Community', '{"Community"}', '{}', $yrc$
Joining a running club feels harder than it is. You imagine a pack of elites who will judge your pace. What you actually find is a group of ordinary people who once stood exactly where you are standing, checking their phone near the meeting point and pretending not to be nervous.

## Week by week

Week one: just come to the Sunday group run and say you are new. That single sentence changes how the whole morning treats you. Someone will adopt you within minutes, match your pace, and explain how the club works while you run.

Week two: try a weekday session, even if it is out of your comfort zone. The weekday groups are smaller, and smaller groups mean names get learned fast. Week three: join the chat. Half the club's life happens there, from route changes to leftover race entries.

By week four, something shifts. You stop being the new person because a newer person has arrived, and you find yourself doing the adopting. That is the whole system. Nobody formally welcomes you into YRC; the club just keeps handing you forward until one day you realize you belong. See you on Sunday.$yrc$) on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, cover = excluded.cover, date = excluded.date, author = excluded.author, tags = excluded.tags, highlights = excluded.highlights, body = excluded.body;

insert into public.posts (slug, title, excerpt, cover, date, author, tags, highlights, body) values ('what-to-eat-the-week-before-race-day', 'What to eat the week before race day', 'Race-week nutrition is less about superfoods and more about boring, familiar meals eaten at the right times.', '/YRC/29.png', '2026-09-02', 'YRC Editorial', '{"Nutrition"}', '{}', $yrc$
The week before a race is when runners get strange. Suddenly everyone is loading pasta like it is a competitive sport and buying supplements they cannot pronounce. Most of it is noise. Race-week eating is about arriving at the start line rested, hydrated and unstressed, and boring food does that best.

In the early part of the week, eat normally. Your training volume drops during the taper, so your appetite may dip slightly, and that is fine. Focus on balanced plates: carbohydrates, protein, vegetables, nothing extreme in any direction.

## The last 48 hours

Two days out, shift the balance toward carbohydrates. Rice, bread, potatoes and pasta top up your glycogen stores, but there is no need to force-feed. Slightly larger portions of familiar carbs beat a mountain of spaghetti the night before.

The day before the race, eat your last big meal at lunch rather than dinner, keep dinner light and early, and skip anything new, spicy or greasy. On race morning, repeat the breakfast you have tested in training. Hydrate steadily all week instead of chugging water the night before. Your legs will thank you for the unremarkable menu.$yrc$) on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, cover = excluded.cover, date = excluded.date, author = excluded.author, tags = excluded.tags, highlights = excluded.highlights, body = excluded.body;

insert into public.posts (slug, title, excerpt, cover, date, author, tags, highlights, body) values ('race-morning-checklist-from-alarm-to-start-line', 'Race morning checklist: from alarm to start line', 'A calm race morning is built the night before. This simple routine removes the panic and leaves only the running.', '/YRC/38.png', '2026-09-10', 'YRC Editorial', '{"Races"}', '{}', $yrc$
Every experienced runner has a race morning routine so rehearsed it runs itself. Every first-timer has a story about pinning their bib on in a parking lot. The difference is not luck. It is a checklist.

Start the night before. Lay out your full kit: shoes, socks, shorts, shirt, watch, and the bib already pinned to the front. Put your post-race layer and some small cash in a bag by the door. Charge your watch. Set two alarms, because race morning is not the day to test your reliability.

## The morning itself

Wake up early enough to eat without rushing, two to three hours before the gun if you can manage it. Eat the breakfast you trained with, sip water, and give your body time to wake up fully. Arrive at the venue at least an hour early; queues for toilets and bag drops are the only reliable prediction in running.

Warm up gently: ten minutes of easy jogging, a few strides, done fifteen minutes before the start. Then find your corral, take a breath, and look around. The nerves are normal. The checklist is done. Everything left is the fun part.$yrc$) on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, cover = excluded.cover, date = excluded.date, author = excluded.author, tags = excluded.tags, highlights = excluded.highlights, body = excluded.body;

insert into public.posts (slug, title, excerpt, cover, date, author, tags, highlights, body) values ('build-the-habit-not-just-the-pace', 'Build the habit, not just the pace', 'How consistent running turns scattered workouts into a sustainable routine — and why the quiet weeks do the real work.', '/YRC/Events/Upcoming/Istanbul%20Marathon%202025/M07.jpg', '2026-09-14', 'YRC Editorial', '{"Training"}', '{}', $yrc$
Most running plans don't fail because they were too hard. They fail because they never became part of the week. A heroic long run followed by ten quiet days moves you less than three ordinary runs that actually happen, every week, without negotiation.

## Start with a realistic routine

The routine you keep beats the routine you admire. Look at your actual week — work, family, sleep — and find the slots where running fits without a fight. Two or three fixed days is enough to begin.

Anchor those runs to something that already exists: before breakfast, straight after work, with the group on Sunday. The fewer decisions between you and the door, the more often you'll get through it.

## Build gradually

Once the routine holds, let it grow slowly. Add a little time, a little distance, or one extra day — not all three at once. The goal is a workload your body and your calendar can absorb without resentment.

Progress in running is quiet. Weeks that feel unremarkable are usually the ones doing the work, so resist the urge to rush them.

## Let the race be a milestone, not the purpose

A race on the calendar gives the weeks a shape and a reason. But if the race is the only reason you run, the habit ends at the finish line.

Treat race day as a checkpoint in a longer story. The fitness, the friends and the routine you built on the way there are the real result — the medal is just the receipt.$yrc$) on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, cover = excluded.cover, date = excluded.date, author = excluded.author, tags = excluded.tags, highlights = excluded.highlights, body = excluded.body;

insert into public.posts (slug, title, excerpt, cover, date, author, tags, highlights, body) values ('the-first-tuesday', 'The First Tuesday', 'Our first Munich Tuesday community run: 05:45 alarms, running drills, 6.5 km of conversation, and coffee at Café Tante Chylla.', '/YRC/Community/IMG_2469.JPG', '2026-09-22', 'Kiarash', '{"Community"}', '{"/YRC/Community/IMG_2469.JPG","/YRC/Community/IMG_2484.MP4","/YRC/Community/IMG_2477.JPG","/YRC/Community/IMG_2483.MP4","/YRC/Community/IMG_2476.JPG","/YRC/Community/IMG_2475.JPG","/YRC/Community/IMG_2466.JPG"}', $yrc$
## THE FIRST TUESDAY

05:45.

The sun is still sleeping.

We’re already up.

A warm dose of support from my brother and girlfriend helps get the morning started.

They weren’t exactly the happiest people to be awake at this hour, but they showed up anyway. ❤️

We make our way to our lovely meeting point: Café Tante Chylla.

Pascal is already there, bringing the morning vibe to life.

Slowly, slowly, friends start arriving.

Some have travelled quite a distance to be here.

They came to support this little idea of mine becoming something real.

That felt pretty special.

Then, we move.

A little warm-up.

A little waking up.

And then we start running.

Easy miles. Conversations. Smiles.

After about a kilometre, it’s time for the drills.

Running drills. Body activation. The serious stuff.

For some of our friends, it’s their first time doing anything like this.

Which, naturally, makes it even more fun.

A few strange movements.

A few laughs.

A few questionable attempts.

That’s the nature of a YRC community run.

We take running seriously.

But we don’t take ourselves too seriously.

Then we keep moving.

The Loop of Love is waiting to be completed, and, more importantly, Pascal and the coffee are waiting for us.

So we continue through Munich and complete our 6.5 km loop.

Back at the café, Pascal has already prepared what we deserve:

Perfect coffee. Croissants. Energy bars.

The running is done.

Now comes the other important part.

Sitting together. Talking. Laughing. Sharing stories.

Meeting people who might have started the morning as strangers and ending it feeling a little less like strangers.

Good coffee.

Good people.

Good energy.

Maybe that's what a community run is really about.

This was the first one.

And we're only getting started.

Want to join the next Tuesday?

Sign up through our website or join the YRC Strava Club.

See you at the café. ☕️🏃‍♀️$yrc$) on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, cover = excluded.cover, date = excluded.date, author = excluded.author, tags = excluded.tags, highlights = excluded.highlights, body = excluded.body;

insert into public.content_blocks (key, items) values ('events.course_details', '[{"title":"Format","value":"Varies by course","description":"YRC running programs are built around structured preparation, consistency and progression. The exact format is defined per course."},{"title":"Duration","value":"Varies by course","description":"Program duration depends on the course and what it builds toward. Timelines are shared together with each program."},{"title":"Participation","value":"Details announced with each program","description":"Participation details are published with each program announcement, together with everything needed to take part."}]'::jsonb) on conflict (key) do update set items = excluded.items;

insert into public.content_blocks (key, items) values ('events.faqs', '[{"question":"Who is Yas Rise Community for?","answer":"YRC is for people who want to run, train, explore and grow through shared experiences and an active community."},{"question":"What kind of events does YRC offer?","answer":"YRC brings together community runs, international events, training camps, structured running programs and other shared sporting experiences."},{"question":"Do I need to be an experienced runner to join?","answer":"YRC includes experiences designed for different levels. The requirements and difficulty can vary depending on the specific event or program."},{"question":"How can I join YRC?","answer":"You can join the YRC community and explore available events and activities through the website."},{"question":"Are YRC events only about running?","answer":"Running is at the heart of YRC, but the community also includes travel, outdoor experiences, training, mobility, strength and shared activities."},{"question":"Where do YRC events take place?","answer":"YRC connects people through local and international experiences. The location depends on the specific event or program."}]'::jsonb) on conflict (key) do update set items = excluded.items;

commit;
