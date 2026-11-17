# Kalavedhike

A standalone, English-language website for an Indian performing-arts trust bringing classical arts closer to Sarjapur Road and surrounding neighbourhoods in Bengaluru. Built with React, TypeScript, and Vite, with local content and no backend.

The public brand is **Kalavedhike**, with the tagline **Bringing the Arts Closer to Home**. The existing project directory, package identifier, example static-host subpath, and Instagram handle retain their original spelling for compatibility.

## Run locally

Use a Node.js release supported by the installed Vite version (Node 22.12+ recommended).

```powershell
Set-Location C:\path\to\Kalavedike
npm ci
npm run dev
```

Open the URL Vite prints. The five pages are `/#/`, `/#/about`, `/#/events`, `/#/gallery`, and `/#/contact`.

```powershell
npm test
npm run lint
npm run typecheck
npm run build
npm run preview
```

Browser coverage uses Playwright Chromium:

```powershell
npx playwright install chromium
npm run test:e2e
```

The browser runner starts its own development server on port 4178, builds the production site, and previews it beneath `/Kalavedike/` on port 4179. Do not start another server on those ports first. Reports and screenshots go to the ignored `test-results` directory by default; set `KALAVEDIKE_ARTIFACTS_DIR` to use another directory.

## Pages

- **Home:** the approved community-focused vision, time-aware upcoming/ongoing programs, and artwork representing Carnatic music, Bharatanatyam, Hindustani music, Kathak, and Odissi.
- **About:** the supplied founding story, full vision, art forms, community purpose, and invitation to join the journey. Five named trustees have face-free photo placeholders and mission-based introductions; individual biographies are not invented.
- **Events:** compact, chronological season overview showing every listed program without empty calendar days. Music/Dance filters include program counts; a year selector appears only when multiple seasons are available. The same event list adapts from desktop cards to mobile rows. A direct program link looks like `/#/events?event=calendar-2027-01-23-carnatic-vocal-1`.
- **Gallery:** a direct Instagram action for photos and updates. No placeholder thumbnails, fictional albums, art-form filters, or sample descriptions are displayed.
- **Contact us:** questions about Kalavedhike and its programs, an email link when configured, and the Instagram contact option. Linked from both header and footer.

## Calendar data from Google Sheets

The calendar and Home programs use twelve proposed 2027 events imported from the trust's planning spreadsheet. These are **proposals, not confirmed bookings**. The sheet supplies dates but no times or venues, so the website displays "Time to be announced (IST)" and "Venue to be announced" rather than inventing information. The source URL is deliberately not published because the sheet contains internal planning information.

The website uses a **committed snapshot**, not a live feed. Visitors do not contact Google, need a Google account, or receive the source sheet's internal planning data. To refresh after editing the sheet:

```powershell
Set-Location C:\path\to\Kalavedike
npm run sync:events
npm test
npm run build
```

Before refreshing, put `KALAVEDIKE_EVENTS_CSV_URL=<approved HTTPS CSV export URL>` in an ignored `.env.local` file, or set that environment variable in your shell. Obtain the actual source URL privately from the maintainer; never commit it. The refresh command loads `.env.local` automatically. Missing source configuration fails without modifying the snapshot. Website builds do not need this setting and do not fetch the spreadsheet.

The local Vite server updates automatically after the generated file changes. For a deployed site, commit the reviewed generated snapshot and push it to trigger a new build. The Events page displays the last-import date.

`scripts\sync-events.mjs` downloads the publicly viewable CSV, validates it, and atomically regenerates `src\content\events.ts`. **Do not edit that file manually**: a refresh overwrites it. No API key, account credentials, or spreadsheet editing access is required. If viewing access is removed, data is malformed, the proposals disclaimer changes, or a new unsupported performance type appears, the command fails visibly without replacing the existing schedule.

Only a public whitelist is generated: stable ID, normalised performance title, art-form category, date, generic proposed-program description, TBA venue, and sample/proposed status. Budgets/totals, candidate artist lists, internal booking notes, artist-discovery links, and potentially mismatched artist biographies are excluded. In particular, no shortlisted artist is presented as booked, and internal experimental wording is not used as a public title.

Importer tests cover quoted CSV, multiline cells, date/weekday agreement, complete row handling, duplicate rejection, and excluded private fields. The content regression test records the current twelve source dates; review/update that expectation when intentionally changing the schedule.

## Approved narrative and remaining content

The supplied vision and About narrative are approved site content, not sample text. They describe the neighbourhood-accessibility purpose, Bengaluru's cultural hubs, the Sarjapur Road travel barrier, the founding members' collective initiative, the full range of classical art forms, and the community/family focus. All supplied sections are rendered, including Our Story, Our Vision, What We Do, More Than a Performance Venue, and Join Us on This Journey.

`src\content\site.ts` centralises the name, tagline, signature, and full vision; the shared `VisionStatement` component keeps Home and About consistent. `src\content\about.ts` holds the full supplied About paragraphs and offerings. Header, footer, page introductions, notices, and metadata use the same neighbourhood/community message.

The gallery is Instagram-only for now: no sample imagery, fictional event records, or placeholder descriptions are published there. The former sample archive and album data remain in source for future development but are not imported by the public gallery. The footer notice identifies proposed calendar dates and the Instagram destination, without incorrectly labelling the approved vision or trust story as fictional.

The contact email has not been supplied. Set `site.email` in `src\content\site.ts` to the confirmed public email address to enable the visible `mailto:` link automatically. Until then, the Contact Us page explicitly says the email address has not been published and provides Instagram instead; no address is guessed.

The user confirmed permission to reuse selected material from [@bellezeakalavedike](https://www.instagram.com/bellezeakalavedike/). The logo was downloaded from the profile's public Open Graph image metadata on 17 November 2026 and stored locally as `public\assets\branding\instagram-logo.jpg`. It is a small 150-by-150-pixel JPEG with a stylized orange instrument/letterform on black and no artist faces. The header, footer, and favicon use this logo; the floral medallion elsewhere is original decoration, not a substitute logo. A high-resolution original can replace the small profile image later.

The supplied trustees are Pallavi K Srinivasa, Roopa Sreedharan Madampath, Krithika Surianarayanan, Shanthi Naresh, and Tarini Basavaraju. `trustees.ts` maintains their names and Trustee role. Current introductions state that role and describe the trust's approved shared mission, not personal backgrounds or specialist responsibilities. Photos use labelled initials placeholders; replace the introductions with approved individual biographies when supplied. Actual trustee photos and event imagery have not been supplied. Use permitted files or directly accessible asset links; do not scrape Instagram, hotlink expiring CDN URLs, or use account credentials.

Keep **all imagery free of artist faces**, including trustee cards and gallery media. Check supplied files and use approved face-free crops or alternatives. Original local SVG illustrations currently represent the five art forms; they are not photographs or records of real performances. Do not describe them as such.

### Content files

| File in `src\content` | Maintains |
| --- | --- |
| `site.ts` | Display name/logo, tagline/signature, Instagram link, contact email, approved full vision, program/gallery notice, art-form definitions, local asset helpers |
| `about.ts` | Complete approved About narrative and performing-art offerings |
| `trustees.ts` | Five supplied trustee names, Trustee roles, and mission-based introductory paragraphs |
| `events.ts` | Generated spreadsheet snapshot used by Home and Events; refresh with `npm run sync:events` |
| `sampleArchive.ts` | Archived fictional development records; not rendered by the current gallery |
| `gallery.ts` | Archived sample album metadata; not rendered by the current gallery |
| `types.ts` | Shared content contracts |

Use unique, stable IDs. `Program` supports either a **date-only** `date: '2027-01-23'` or a **timed** pair of `startsAt`/`endsAt` ISO timestamps with explicit timezone offsets, such as `2027-02-14T18:00:00+05:30`. Do not supply both shapes. The current spreadsheet import is date-only; it does not fabricate a midnight start or all-day booking.

All displayed times and season groupings use `Asia/Kolkata`, regardless of the visitor's timezone. Date-only events remain upcoming through the end of their IST calendar date. Timed events remain upcoming while ongoing, with the end later than the start. Multi-day programs show their full date/time range once per occupied season, including when they span years.

The public gallery reads only `site.instagram`; no Instagram content is fetched or embedded. If a local gallery is introduced later, use approved images with unique IDs, descriptive alt text, accurate captions, and `assetUrl('assets/gallery/filename.webp')` for subpath-safe assets.

Replace sample archive records and albums with approved actual past-event records when supplied. Do not delete an archive event while an album references it. A missing reference is deliberately surfaced as an error. Future spreadsheet proposals should not be turned into historical gallery albums merely because a date passes.

### Assets and branding

To replace the logo, place a permitted higher-resolution file under `public\assets\branding` and update `site.logo` in `src\content\site.ts` and the favicon in `index.html`. The header and footer read that shared logo path. The original decorative floral medallion is at `public\assets\branding\mark.svg`. Keep a meaningful brand link name and avoid redundant logo alt text.

Place approved gallery images under `public\assets\gallery`; optimize their sizes, retain attribution where required, and avoid identifying artists through facial imagery. The five original illustrations live under `public\assets\illustrations`. Decorative weave/mandala styles and design tokens are in `src\styles`.

If a local gallery is introduced later, do not republish fictional development records as real events. Calendar proposal status is separate: do not remove `tentative` labels until dates/bookings are confirmed and the importer/publication rules have been updated to represent that change. The supplied vision and founding story do not require sample disclaimers.

## Static hosting

`npm run build` creates `dist`. Publish **the contents of `dist`**, not the source directory, to any static host. Vite uses `base: './'`; image helpers use the same base. Hash routes do not need server-side route rewrites.

For example, hosting the build under `/Kalavedike/` gives `/Kalavedike/#/events`. Keep the trailing slash on the deployed base URL (or configure the host's normal directory redirect). Links within the app preserve the base directory.

### GitHub Pages with a GoDaddy domain

Publish this project in its own **public, website-only repository**. Do not initialize or push the surrounding workspace repository: it can contain unrelated projects and history. Review the staged files, keep `.env.local`, credentials, `node_modules`, `dist`, and test artifacts out of Git, and commit only the reviewed website source.

The included `.github\workflows\deploy-pages.yml` installs locked dependencies, runs tests and lint, builds the site, and uploads only `dist` to Pages. It runs on pushes to `main` and manual dispatches. In the new repository, choose **Settings > Pages > Build and deployment > Source: GitHub Actions**. Confirm the first successful deployment at `https://<owner>.github.io/<repository>/`.

The intended primary domain is **www.kalavedike.co.in**, with the bare domain redirecting to it. Keep domain registration and nameservers at GoDaddy:

1. In GitHub account **Settings > Pages**, add and verify `kalavedike.co.in` using GitHub's generated DNS TXT record. Keep that TXT record after verification.
2. In repository **Settings > Pages > Custom domain**, save `www.kalavedike.co.in` **before** pointing the website DNS records to GitHub.
3. In GoDaddy's DNS management screen, configure these website records. Substitute the actual GitHub repository owner, not the repository name, in the CNAME target.

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `<owner>.github.io` |

4. Replace only conflicting website records. Review old AAAA/forwarding settings for conflicts; preserve MX/TXT mail records and unrelated services. Do not add a wildcard or use GoDaddy domain forwarding.
5. After GitHub accepts the DNS configuration and provisions its certificate, enable **Enforce HTTPS**. Confirm both hostnames, their redirect, all five routes, images, and event deep links.

The custom domain is configured in repository settings; a `CNAME` file is not required for this Actions-based workflow. GitHub provides HTTPS, so this setup needs neither GoDaddy web hosting nor a separate SSL purchase. Follow [GitHub's custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

Future source changes pushed to `main` trigger a checked deployment. To roll back, revert the offending source commit and push. If Pages is ever disabled or the repository is removed, remove or reassign its website DNS records too, to avoid a dangling domain.

No live deployment or DNS change is implied by these instructions. No forms, bookings, payments, authentication, admin, analytics, external font services, or live Instagram embeds are included. External Instagram links open a new tab; the site never contacts Instagram until a visitor follows that link. A domain or Pages deployment does not create an email mailbox; the contact email still needs a confirmed address and working mailbox.

## Behavior and accessibility

The season overview uses one semantic list with ordinary buttons on every screen size, not duplicate desktop/mobile calendars. It opens at the next program's year (or the linked program's year), with the latest season retained when all dates have passed. Selection opens details above the overview and focuses their heading; "Back to all programs" preserves filters and restores focus to the program, or to the season heading if filtered out. "Next up" and "Date passed" refer only to dates, not confirmed bookings or completed performances. Empty schedules/categories and missing programs have explicit notices.

Instagram actions are native links with new-tab announcements and `rel="noopener noreferrer"`. The gallery route offers the Instagram link without automatically redirecting away. The existing lightbox component is retained for future development but is not mounted by the current gallery. A configured contact email uses a native `mailto:` link, not a contact form or backend. Reduced-motion preferences are respected. Images are local, dimensioned, and lazy-loaded except for the main hero.
