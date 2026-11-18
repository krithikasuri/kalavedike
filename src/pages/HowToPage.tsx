import type { ReactNode } from 'react'

const eventExample = [{
  id: 'new-program',
  title: 'Replace with the program title',
  artForm: 'Carnatic music',
  date: '2027-01-23',
  time: '18:30',
  endTime: '',
  venue: 'Replace with the venue and address',
  artists: [{ name: 'Replace with the artist name', url: '' }],
  photo: '',
  photoAlt: '',
  description: 'Replace with a short introduction.',
  tentative: true,
}]

const sponsorExample = [{
  id: 'new-sponsor',
  name: 'Replace with the sponsor name',
  bio: 'Replace with a short introduction to the sponsor.',
  website: 'https://example.com',
  logo: 'assets/sponsors/sponsor-logo.png',
  placeholder: false,
}]

function GitHubLink({ path, children }: { path: string; children: ReactNode }) {
  return <a href={`https://github.com/krithikasuri/kalavedike/${path}`} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> &#8599;</span><span className="sr-only"> (opens in a new tab)</span></a>
}

export function HowToPage() {
  return (
    <>
      <section className="page-intro container">
        <p className="eyebrow">A helping hand for our volunteers</p>
        <h1>Website <em>guide</em></h1>
        <p>Add events and update sponsors using your web browser. No coding software or installation needed.</p>
      </section>
      <div className="container how-to-guide">
        <section className="guide-note" aria-labelledby="guide-start">
          <h2 id="guide-start">Before you start</h2>
          <p>Sign in to GitHub with an account that can edit the Kalavedike website. GitHub is where our website files are kept. If you cannot see an edit button, ask the website owner for access.</p>
          <p>You will edit two simple lists called <strong>events.json</strong> and <strong>sponsors.json</strong>. Think of each entry as a small form: change the words inside the quotation marks, not the field names on the left. This guide is public; it does not give visitors permission to edit.</p>
        </section>

        <div className="guide-columns">
          <section className="guide-card" aria-labelledby="guide-events">
            <p className="eyebrow">Calendar of events</p>
            <h2 id="guide-events">Add or change an event</h2>
            <ol>
              <li><GitHubLink path="blob/main/src/content/events.json">Open the events file on GitHub</GitHubLink>. Click the pencil icon, usually labelled <strong>Edit this file</strong>.</li>
              <li>To change an event, find its title and edit its details. To add one, copy a complete existing entry, from its opening <code>{'{'}</code> to its closing <code>{'}'}</code>, and paste it before the final <code>]</code>.</li>
              <li>Give a new event a different <code>id</code>, such as <code>january-music-evening</code>. Use lowercase letters, numbers and hyphens, with no spaces. Keep existing IDs unchanged so shared links still work.</li>
              <li>Fill in the title, date, time, venue and description. Update the description too if it still says details are to be announced. Add artist names and their website or profile links when known.</li>
              <li>Check the commas using the tips below, then follow <strong>Save and publish</strong>.</li>
            </ol>
            <dl className="guide-fields">
              <div><dt>Date</dt><dd><code>2027-01-23</code> means 23 January 2027: year-month-day.</dd></div>
              <div><dt>Time</dt><dd><code>18:30</code> means 6:30 pm. All times are in India Standard Time. Leave <code>time</code> and <code>endTime</code> as <code>""</code> if unknown. An end time is optional.</dd></div>
              <div><dt>Art form</dt><dd>Use exactly: Carnatic music, Hindustani music, Bharatanatyam, Kathak, or Odissi.</dd></div>
              <div><dt>Artists</dt><dd>Each artist has a <code>name</code> and optional <code>url</code> starting with <code>https://</code>. Copy an artist entry to add another. Use <code>"artists": []</code> if none are announced.</dd></div>
              <div><dt>Photo</dt><dd>Leave <code>photo</code> as <code>""</code> to keep the illustration, or upload a photo as explained below. <code>photoAlt</code> is a short description for people who cannot see the image.</dd></div>
              <div><dt>Proposed?</dt><dd>Keep <code>"tentative": true</code> for a proposal. Change it to <code>false</code> only when the program is confirmed. Do not put quotation marks around true or false.</dd></div>
            </dl>
            <details>
              <summary>Show an event example</summary>
              <p>This example is a complete list with one entry. Replace every example value before publishing. For an existing list, copy only the entry inside the outer square brackets, not the whole list.</p>
              <pre aria-label="Event JSON example"><code>{JSON.stringify(eventExample, null, 2)}</code></pre>
              <p>For an overnight program, also add <code>"endDate": "2027-01-24"</code> and its <code>endTime</code>. The end must be after the start.</p>
            </details>
            <h3>Remove an event</h3>
            <p>Find its title and delete that whole entry, from <code>{'{'}</code> to the matching <code>{'}'}</code>, including any artist entries inside it. Remove the extra comma left between entries. Keep the outer <code>[ ]</code> brackets. If removing the only event, leave <code>[]</code>.</p>
            <p>Removing an event also removes it from the calendar and upcoming programs. Its old shared link will no longer find it. Past dates already disappear from Home automatically; you do not need to delete them just because they have passed.</p>
          </section>

          <section className="guide-card" aria-labelledby="guide-sponsors">
            <p className="eyebrow">Our supporters</p>
            <h2 id="guide-sponsors">Update sponsors</h2>
            <ol>
              <li>Upload the approved logo first, using the image instructions below.</li>
              <li><GitHubLink path="blob/main/src/content/sponsors.json">Open the sponsors file on GitHub</GitHubLink> and click the pencil icon.</li>
              <li>Replace a placeholder entry with the sponsor&apos;s <code>name</code>, short <code>bio</code>, complete <code>website</code> starting with <code>https://</code>, and <code>logo</code> path.</li>
              <li>Change <code>"placeholder": true</code> to <code>"placeholder": false</code>. A real sponsor needs both a website and an uploaded logo; the logo and card then become clickable.</li>
              <li>To add another sponsor, copy a whole entry and give it a unique <code>id</code>. To remove one, delete the whole entry and tidy the comma. Leave <code>[]</code> if removing all sponsors.</li>
              <li>Follow <strong>Save and publish</strong>. Sponsors appear in the same order as this list.</li>
            </ol>
            <details>
              <summary>Show a sponsor example</summary>
              <p>Replace the example name, bio, website and logo with approved details. Upload your logo before using its filename. For an existing list, copy only the entry inside the outer square brackets.</p>
              <pre aria-label="Sponsor JSON example"><code>{JSON.stringify(sponsorExample, null, 2)}</code></pre>
            </details>
            <p>Not ready to name a sponsor? Keep <code>"placeholder": true</code> and leave <code>website</code> and <code>logo</code> as <code>""</code> for a blank, clearly labelled placeholder.</p>
          </section>
        </div>

        <section className="guide-card" aria-labelledby="guide-images">
          <h2 id="guide-images">Upload a photo or logo</h2>
          <ol>
            <li>Choose an approved image you have permission to publish. Keep event imagery free of artist faces, using an approved crop if needed. Use a short filename with no spaces, such as <code>concert-stage.jpg</code> or <code>sponsor-logo.png</code>.</li>
            <li>Open the <GitHubLink path="tree/main/public/assets/events">event photos folder</GitHubLink> or the <GitHubLink path="tree/main/public/assets/sponsors">sponsor logos folder</GitHubLink>. Choose <strong>Add file &gt; Upload files</strong>, select your image, then <strong>Commit changes</strong> to save it.</li>
            <li>In the event entry, use <code>"photo": "assets/events/concert-stage.jpg"</code>. In a sponsor entry, use <code>"logo": "assets/sponsors/sponsor-logo.png"</code>. Match the filename, spelling and capital letters exactly. Do not include <code>public/</code> in the entry.</li>
          </ol>
          <p>Upload images before saving the entries that use them. Leave the existing <code>.gitkeep</code> file alone; it only keeps an empty folder available. JPG, PNG and WebP are straightforward choices. Use <code>/</code> in image paths, even on Windows.</p>
        </section>

        <section className="guide-card" aria-labelledby="guide-publish">
          <h2 id="guide-publish">Save and publish</h2>
          <ol>
            <li>In GitHub&apos;s editor, click <strong>Commit changes</strong>. This means &ldquo;save this version&rdquo;. Enter a short note such as &ldquo;Update January concert&rdquo;.</li>
            <li>Save to the <strong>main</strong> branch if that choice is available. If GitHub asks you to propose a change instead, submit it and ask a website maintainer to approve and merge it.</li>
            <li>Open <GitHubLink path="actions">the publishing status on GitHub</GitHubLink>. Find the latest run for your change. A yellow indicator means it is still working; a green tick means publishing finished successfully. Allow a few minutes.</li>
            <li>Refresh the website. Check the Events or Sponsors page, open the event details, and try the artist or sponsor link. If you still see the old version, wait a little and refresh again.</li>
          </ol>
          <p>Changing these files does not update the live website until the change reaches main and publishing finishes. You do not need to run commands or edit the application code.</p>
        </section>

        <section className="guide-note" aria-labelledby="guide-help">
          <h2 id="guide-help">Easy mistakes to avoid</h2>
          <p><strong>Keep the punctuation:</strong> use straight double quotes <code>"</code>, not curly quotes from Word or WhatsApp. Separate entries with a comma after the closing brace: <code>{'},'}</code>. Do not put a comma after the very last entry, before <code>]</code>. Do not add notes or comments inside the file. An empty value is two double quotes: <code>""</code>.</p>
          <p><strong>Red cross on the publishing status?</strong> The website keeps its previous published version if a check fails. Open the failed run and look for the file and field named in the error. Common causes are a missing comma, a duplicate ID, a date like 31 February, an incorrect image filename, or a link without <code>https://</code>. Correct the file and save again.</p>
          <p><strong>Need to undo a mistake?</strong> Open the file&apos;s <strong>History</strong> on GitHub to find an earlier working version. Copy its contents back into the current file using the pencil editor, then save. If you are unsure, ask the website maintainer to help before making more changes. Do not put private information in these files: this is a public website and repository.</p>
        </section>
      </div>
    </>
  )
}
