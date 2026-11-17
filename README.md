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

Open the URL Vite prints. The six pages are `/#/`, `/#/about`, `/#/events`, `/#/gallery`, `/#/sponsors`, and `/#/contact`.

The footer also links to **Website guide** at `/#/how-to`: a browser-only, plain-English guide to adding/removing events, updating sponsors, uploading images and publishing through GitHub. It includes expandable JSON examples, punctuation tips, access requirements and recovery instructions for volunteers.

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

- **Home:** the approved community-focused vision, time-aware upcoming/ongoing programs, artwork representing the five classical art forms, and a manually controlled testimonial carousel.
- **About:** the supplied founding story, full vision, art forms, community purpose, and invitation to join the journey. Five named trustees have face-free photo placeholders and mission-based introductions; individual biographies are not invented.
- **Events:** compact, chronological season overview showing every listed program without empty calendar days. Music/Dance filters include program counts; a year selector appears only when multiple seasons are available. The same event list adapts from desktop cards to mobile rows. A direct program link looks like `/#/events?event=calendar-2027-01-23-carnatic-vocal-1`.
- **Gallery:** a direct Instagram action for photos and updates. No placeholder thumbnails, fictional albums, art-form filters, or sample descriptions are displayed.
- **Contact us:** questions about Kalavedhike and its programs, an email link when configured, and the Instagram contact option. Linked from both header and footer.
- **Sponsors:** three clearly labelled placeholder spaces with blank logo areas and inactive website text. No sponsor affiliation or external website is invented.

## Easy content updates: edit two JSON files

**No React or TypeScript changes are needed for routine events or sponsor updates.**

| Edit | File |
| --- | --- |
| Add, update or remove events | `src\content\events.json` |
| Add, update or remove sponsors | `src\content\sponsors.json` |
| Upload approved event photos | `public\assets\events` |
| Upload approved sponsor logos | `public\assets\sponsors` |

Both JSON files contain arrays. Copy an existing object, change its fields, and separate objects with commas. Use double quotes, no comments, and no trailing commas. Keep each `id` unique and stable; changing an event ID breaks previously shared event links. Use lowercase hyphenated IDs such as `january-concert`.

### Events

Illustrative editing example, not a confirmed booking:

```json
{
  "id": "january-concert",
  "title": "An evening of Carnatic music",
  "artForm": "Carnatic music",
  "date": "2027-01-23",
  "time": "18:30",
  "endTime": "20:00",
  "venue": "Replace with the confirmed venue and address",
  "artists": [
    { "name": "Replace with artist name", "url": "https://example.com/artist" }
  ],
  "photo": "assets/events/january-concert.jpg",
  "photoAlt": "Describe the approved face-free event image",
  "description": "Replace with a short introduction to the program.",
  "tentative": true
}
```

- `date` is **YYYY-MM-DD**. `time` and optional `endTime` use **24-hour HH:mm**, always in **India Standard Time**. No timezone calculation is needed.
- Leave `time` and `endTime` empty (`""`) if unknown. A start time without an end time is supported; no end time is invented. For an overnight or multi-day program, add `"endDate": "2027-01-24"` with `endTime`; otherwise the end is on the same day.
- `artForm` must be one of `Carnatic music`, `Hindustani music`, `Bharatanatyam`, `Kathak`, or `Odissi`.
- Add multiple artists to `artists`. Each has a `name` and optional HTTPS `url` for a website, profile or performance link. Use `[]` when artists are not announced.
- `venue` can include the full address. Leave it empty when unknown; the site shows "Venue to be announced".
- Upload the image first, then set `photo` to its path **without `public/`**. Leave it empty to retain the art-form illustration. Add meaningful `photoAlt` text. Images are displayed on Home cards and in event details, including mobile.
- Keep `tentative: true` for proposals. Set it to `false` only after confirmation; the pages automatically stop labelling that event as proposed.

The original twelve 2027 proposals are preserved. No times, artist bookings, photos or venues have been fabricated. The compact Events overview remains unchanged; selecting a program reveals its photo, time, venue and clickable artists.

### Sponsors

Illustrative editing example; replace the sample details with approved sponsor content:

```json
{
  "id": "community-sponsor",
  "name": "Replace with sponsor name",
  "bio": "A short introduction to the sponsor and their support for the arts.",
  "website": "https://example.com",
  "logo": "assets/sponsors/community-sponsor.png",
  "placeholder": false
}
```

Upload the logo, fill in `name`, `bio` and the complete HTTPS `website`, and set `placeholder` to `false`. The whole card, including its logo, links to that website. To retain a blank placeholder, set `placeholder: true` and leave `website` and `logo` empty. Add/remove objects to change the number of sponsors; there is no fixed limit or code change.

### Save and publish

You can edit these files in GitHub using the pencil icon and upload images using **Add file > Upload files**, or edit locally. Upload images **before** committing JSON that references them (or commit both together). Use short, hyphenated image filenames such as `concert-stage.jpg`; supported types include JPG, PNG, WebP, AVIF, GIF and SVG. JSON image paths use `/`, even on Windows.

Locally, run `npm run check:content` for a quick content check. `npm run build` also checks JSON values, unique IDs, valid dates/times, HTTPS links and the existence of image files before building. Errors identify the file, record and field. Routine content changes do not require changing test expectations.

Commit the JSON and any images to the website repository's `main` branch. The existing GitHub Actions workflow rebuilds and publishes the website automatically; JSON changes are **not a live feed** and must be deployed. No CMS, database, login, server or Google Sheets access is needed.

### Optional Google Sheets import

JSON is now the source of truth. `npm run sync:events` is an optional import aid: it writes **`src\content\events.imported.json` for review only**, never overwriting `events.json` or manually entered times, venues, artists and photos. Copy approved imported records into the main JSON file, retaining any confirmed details.

Before importing, set `KALAVEDIKE_EVENTS_CSV_URL=<approved HTTPS CSV export URL>` in the ignored `.env.local` file or your environment. Obtain the actual URL privately; never commit it. Builds and visitors do not fetch the sheet. The importer continues to exclude budgets, shortlisted artists, internal notes, discovery links and unverified biographies. Missing configuration, malformed CSV or unsupported rows fail without changing published content.

## Approved narrative and remaining content

The supplied vision and About narrative are approved site content, not sample text. They describe the neighbourhood-accessibility purpose, Bengaluru's cultural hubs, the Sarjapur Road travel barrier, the founding members' collective initiative, the full range of classical art forms, and the community/family focus. All supplied sections are rendered, including Our Story, Our Vision, What We Do, More Than a Performance Venue, and Join Us on This Journey.

`src\content\site.ts` centralises the name, tagline, signature, and full vision; the shared `VisionStatement` component keeps Home and About consistent. `src\content\about.ts` holds the full supplied About paragraphs and offerings. Header, footer, page introductions, notices, and metadata use the same neighbourhood/community message.

The gallery is Instagram-only for now: no sample imagery, fictional event records, or placeholder descriptions are published there. The former sample archive and album data remain in source for future development but are not imported by the public gallery. The footer notice identifies proposed calendar dates and the Instagram destination, without incorrectly labelling the approved vision or trust story as fictional.

The contact email has not been supplied. Set `site.email` in `src\content\site.ts` to the confirmed public email address to enable the visible `mailto:` link automatically. Until then, the Contact Us page explicitly says the email address has not been published and provides Instagram instead; no address is guessed.

Sponsor and testimonial content is intentionally placeholder-only. Maintain sponsors in `src\content\sponsors.json` as described above; confirmed sponsors need a bio, HTTPS website and uploaded logo. Placeholder records deliberately have neither fake URLs nor logo images.

Update `src\content\testimonials.ts` with approved quotes, attribution names and context; set `placeholder: false` only after approval. Current text describes where future testimonials will appear and is explicitly not presented as an actual endorsement. The carousel shows one item at a time, wraps with previous/next buttons, supports slide selectors and left/right arrow keys, and never auto-rotates. Empty and single-item collections do not display dead navigation controls.

The user confirmed permission to reuse selected material from [@bellezeakalavedike](https://www.instagram.com/bellezeakalavedike/). The logo was downloaded from the profile's public Open Graph image metadata on 17 November 2026 and stored locally as `public\assets\branding\instagram-logo.jpg`. It is a small 150-by-150-pixel JPEG with a stylized orange instrument/letterform on black and no artist faces. The header, footer, and favicon use this logo; the floral medallion elsewhere is original decoration, not a substitute logo. A high-resolution original can replace the small profile image later.

The supplied trustees are Pallavi K Srinivasa, Roopa Sreedharan Madampath, Krithika Surianarayanan, Shanthi Naresh, and Tarini Basavaraju. `trustees.ts` maintains their names and Trustee role. Current introductions state that role and describe the trust's approved shared mission, not personal backgrounds or specialist responsibilities. Photos use labelled initials placeholders; replace the introductions with approved individual biographies when supplied. Actual trustee photos and event imagery have not been supplied. Use permitted files or directly accessible asset links; do not scrape Instagram, hotlink expiring CDN URLs, or use account credentials.

Keep **all imagery free of artist faces**, including trustee cards and gallery media. Check supplied files and use approved face-free crops or alternatives. Original local SVG illustrations currently represent the five art forms; they are not photographs or records of real performances. Do not describe them as such.

### Content files

| File in `src\content` | Maintains |
| --- | --- |
| `site.ts` | Display name/logo, tagline/signature, Instagram link, contact email, approved full vision, program/gallery notice, art-form definitions, local asset helpers |
| `about.ts` | Complete approved About narrative and performing-art offerings |
| `trustees.ts` | Five supplied trustee names, Trustee roles, and mission-based introductory paragraphs |
| `sponsors.json` | Editable sponsor names, bios, websites, logos and placeholder status |
| `testimonials.ts` | Clearly labelled testimonial placeholders, or approved quotes and attributions |
| `events.json` | Editable event dates, times, venues, artist links, photos and proposal status |
| `events.ts`, `sponsors.ts`, `parseContent.ts` | Validated JSON loaders; no routine editing needed |
| `sampleArchive.ts` | Archived fictional development records; not rendered by the current gallery |
| `gallery.ts` | Archived sample album metadata; not rendered by the current gallery |
| `types.ts` | Shared content contracts |

Internally, the event loader converts simple JSON dates/times into `Program` records. Date-only entries retain their date without a fabricated midnight start. Timed entries use explicit `+05:30` timestamps with an optional end; maintainers do not edit those internal fields.

All displayed times and season groupings use `Asia/Kolkata`, regardless of the visitor's timezone. Date-only and start-only events remain upcoming through the end of their IST calendar date. Events with a supplied end remain upcoming while ongoing, with the end later than the start. Multi-day programs show their full date/time range once per occupied season, including when they span years.

The public gallery reads only `site.instagram`; no Instagram content is fetched or embedded. If a local gallery is introduced later, use approved images with unique IDs, descriptive alt text, accurate captions, and `assetUrl('assets/gallery/filename.webp')` for subpath-safe assets.

Replace sample archive records and albums with approved actual past-event records when supplied. Do not delete an archive event while an album references it. A missing reference is deliberately surfaced as an error. Future spreadsheet proposals should not be turned into historical gallery albums merely because a date passes.

### Assets and branding

To replace the logo, place a permitted higher-resolution file under `public\assets\branding` and update `site.logo` in `src\content\site.ts` and the favicon in `index.html`. The header and footer read that shared logo path. The original decorative floral medallion is at `public\assets\branding\mark.svg`. Keep a meaningful brand link name and avoid redundant logo alt text.

Place approved gallery images under `public\assets\gallery`; optimize their sizes, retain attribution where required, and avoid identifying artists through facial imagery. The five original illustrations live under `public\assets\illustrations`. Decorative weave/mandala styles and design tokens are in `src\styles`.

If a local gallery is introduced later, do not republish fictional development records as real events. Calendar proposal status is separate: set `tentative` to `false` only when dates/bookings are confirmed. The supplied vision and founding story do not require sample disclaimers.

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
5. After GitHub accepts the DNS configuration and provisions its certificate, enable **Enforce HTTPS**. Confirm both hostnames, their redirect, all six routes, images, and event deep links.

The custom domain is configured in repository settings; a `CNAME` file is not required for this Actions-based workflow. GitHub provides HTTPS, so this setup needs neither GoDaddy web hosting nor a separate SSL purchase. Follow [GitHub's custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

Future source changes pushed to `main` trigger a checked deployment. To roll back, revert the offending source commit and push. If Pages is ever disabled or the repository is removed, remove or reassign its website DNS records too, to avoid a dangling domain.

No live deployment or DNS change is implied by these instructions. No forms, bookings, payments, authentication, admin, analytics, external font services, or live Instagram embeds are included. External Instagram links open a new tab; the site never contacts Instagram until a visitor follows that link. A domain or Pages deployment does not create an email mailbox; the contact email still needs a confirmed address and working mailbox.

### HTTPS and security

GitHub provides a free, automatically renewed certificate for the custom domain. In repository **Settings > Pages**, wait for the certificate to be available, then enable **Enforce HTTPS**. Confirm that both `http://www.kalavedike.co.in/` and `http://kalavedike.co.in/` redirect to the working HTTPS site, and that HTTPS works for both domain names without a browser warning. Do not buy a separate GoDaddy SSL certificate, ignore certificate warnings, or use a client-side redirect as a substitute.

If GitHub says **Certificate not yet created** despite correct DNS, click the separate **Remove** button beside Custom domain, immediately re-enter `www.kalavedike.co.in`, and click **Save** to restart provisioning. Simply clearing and retyping the same text will leave Save disabled. Leave the correct GoDaddy DNS records and domain-verification TXT record in place. If issuance still fails, consult [GitHub's HTTPS troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

Production builds add a Content Security Policy before any page resources: only same-origin scripts, styles, images and fonts are allowed. Inline scripts, eval, embedded objects, frames, form submissions, base-tag overrides and application network connections are disallowed. This policy is build-only so local Vite development and hot reload still work. External artist/sponsor/Instagram links remain ordinary navigations, not embedded resources. A referrer policy limits information sent when following an external link. Content still uses React text rendering, local images and validated HTTPS artist/sponsor URLs.

GitHub Pages controls HTTP response headers. A meta policy cannot set HSTS, X-Frame-Options or an effective CSP `frame-ancestors` rule; do not claim those protections are configured here. HTTPS and CSP reduce specific risks, not guarantee that any website is completely secure. Do not add sensitive transactions, payment/card details, passwords or private records to this public static site.

Owners should enable two-factor authentication on GitHub and GoDaddy, restrict repository/domain administration to trusted maintainers, and retain automatic dependency alerts. Keep `.env.local` and credentials out of Git. Before updating packages, use the existing tests/build; `npm audit --omit=dev` checks known advisories affecting production packages but is not a comprehensive security review.

## Behavior and accessibility

The season overview uses one semantic list with ordinary buttons on every screen size, not duplicate desktop/mobile calendars. It opens at the next program's year (or the linked program's year), with the latest season retained when all dates have passed. Selection opens details above the overview and focuses their heading; "Back to all programs" preserves filters and restores focus to the program, or to the season heading if filtered out. "Next up" and "Date passed" refer only to dates, not confirmed bookings or completed performances. Empty schedules/categories and missing programs have explicit notices.

Instagram actions are native links with new-tab announcements and `rel="noopener noreferrer"`. The gallery route offers the Instagram link without automatically redirecting away. The existing lightbox component is retained for future development but is not mounted by the current gallery. A configured contact email uses a native `mailto:` link, not a contact form or backend. Reduced-motion preferences are respected. Images are local, dimensioned, and lazy-loaded except for the main hero.
