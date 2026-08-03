import {
  education,
  experience,
  identity,
  learning,
  projects,
  research,
  skills,
  summary,
} from '@/content/profile'

/**
 * The résumé, as a document rather than an embedded PDF.
 *
 * Rendered from the same `content/profile.ts` the homepage uses, so the two can
 * never disagree — which is the failure mode a separately-maintained PDF always
 * eventually hits.
 *
 * Being HTML rather than a PDF buys three things a file cannot: it is indexable
 * (recruiters search names), it is readable by a screen reader, and it prints to
 * a clean single-column PDF through the browser, so the downloaded copy is
 * always the current one.
 *
 * It carries no phone number. The copy sent to an application does.
 */

/**
 * How much of each section reaches the résumé.
 *
 * `content/profile.ts` is the full record and lists facts strongest first; a
 * résumé is a selection from it, not the whole thing. These limits mirror the
 * LaTeX one-pager, which is what keeps the printed sheet to a readable length
 * rather than the four pages the unabridged content produces.
 */
const LIMITS = {
  experience: [5, 3],
  projectBullets: 2,
  /** A bullet on the first paper only, matching the LaTeX. */
  researchBullets: [1, 0] as readonly number[],
  /** Kalki is on the site but not the résumé, the same call the LaTeX makes. */
  projects: 2,
} as const

/**
 * Typography, tuned to one page.
 *
 * A résumé that prints to two pages is a worse document than one that prints to
 * one, and the difference here was spacing rather than content: the first draft
 * ran 1.44 pages purely on generous margins and line height. These values match
 * the density of the LaTeX one-pager. They are named so the next person tuning
 * this can see what the knobs are instead of hunting through class strings.
 */
const T = {
  body: 'text-[11px] leading-[1.34]',
  meta: 'text-[10.5px]',
  sectionGap: 'mt-[8px]',
  sectionHead: 'text-[11px]',
  entryGap: 'space-y-[5px]',
  bulletGap: 'space-y-[2px]',
  entryTitle: 'text-[12px]',
} as const

function fmt(iso: string): string {
  const [y, m] = iso.split('-')
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return m ? `${months[Number(m) - 1]} ${y}` : (y ?? iso)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={`${T.sectionGap} break-inside-avoid first:mt-0`}>
      <h2
        className={`${T.sectionHead} border-b border-stone-400 pb-[2px] font-bold uppercase tracking-[0.09em] text-stone-900`}
      >
        {title}
      </h2>
      <div className={`mt-[5px] ${T.entryGap}`}>{children}</div>
    </section>
  )
}

function Entry({
  left,
  leftSub,
  right,
  rightSub,
  bullets,
}: {
  left: string
  leftSub?: string
  right?: string
  rightSub?: string
  bullets?: readonly string[]
}) {
  return (
    <article className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <p className={`${T.entryTitle} font-bold text-stone-900`}>{left}</p>
        {right && <p className={`${T.meta} text-stone-700`}>{right}</p>}
      </div>
      {(leftSub || rightSub) && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          {leftSub && <p className={`${T.body} italic text-stone-800`}>{leftSub}</p>}
          {rightSub && <p className={`${T.meta} italic text-stone-700`}>{rightSub}</p>}
        </div>
      )}
      {bullets && bullets.length > 0 && (
        <ul className={`mt-[3px] ${T.bulletGap}`}>
          {bullets.map((b) => (
            <li key={b} className={`flex gap-2 ${T.body} text-stone-800`}>
              <span
                aria-hidden
                className="mt-[0.62em] h-[3px] w-[3px] shrink-0 rounded-full bg-stone-500"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export function ResumeSheet() {
  return (
    <article
      id="resume-sheet"
      // Serif and near-black on white, because this is the one surface that is
      // meant to look like paper and to survive being printed.
      className="mx-auto w-full max-w-[820px] bg-white px-8 py-9 font-serif text-stone-900 shadow-2xl sm:px-12 sm:py-10"
      style={{ aspectRatio: 'auto' }}
    >
      <header className="text-center">
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-stone-900">{identity.name}</h1>
        <p
          className={`mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 ${T.meta} text-stone-700`}
        >
          <span>{identity.location}</span>
          <span aria-hidden>·</span>
          <a className="underline underline-offset-2" href={`mailto:${identity.email}`}>
            {identity.email}
          </a>
          <span aria-hidden>·</span>
          <a className="underline underline-offset-2" href="https://harshitwandhare.com">
            harshitwandhare.com
          </a>
          <span aria-hidden>·</span>
          <a className="underline underline-offset-2" href={identity.github}>
            github.com/harshitwandhare
          </a>
          <span aria-hidden>·</span>
          <a className="underline underline-offset-2" href={identity.linkedin}>
            linkedin.com/in/harshit-wandhare
          </a>
        </p>
      </header>

      <div className="mt-3">
        <Section title="Summary">
          <p className={`${T.body} text-stone-800`}>{summary}</p>
        </Section>

        <Section title="Education">
          {education.map((e) => (
            <Entry
              key={e.school}
              left={e.school}
              leftSub={e.detail}
              right={`${fmt(e.from)} to ${fmt(e.to)}`}
              rightSub={e.note}
            />
          ))}
        </Section>

        <Section title="Experience">
          {experience.map((role, i) => (
            <Entry
              key={role.org}
              left={role.title}
              leftSub={role.org}
              right={`${fmt(role.from)} to ${fmt(role.to)}`}
              rightSub={role.where}
              bullets={role.points.slice(0, LIMITS.experience[i] ?? 4).map((p) => p.text)}
            />
          ))}
        </Section>

        <Section title="Projects">
          {projects.slice(0, LIMITS.projects).map((p) => (
            <Entry
              key={p.name}
              left={p.name}
              leftSub={p.stack.join(' · ')}
              right={p.live ? p.live.replace('https://', '') : undefined}
              bullets={p.points.slice(0, LIMITS.projectBullets).map((pt) => pt.text)}
            />
          ))}
        </Section>

        <Section title="Research">
          {research.map((paper, i) => (
            <Entry
              key={paper.title}
              left={paper.title}
              leftSub={paper.venue}
              bullets={paper.points.slice(0, LIMITS.researchBullets[i] ?? 0)}
            />
          ))}
        </Section>

        <Section title="Technical Skills">
          <dl className={T.bulletGap}>
            {skills.map((g) => (
              <div key={g.group} className={`flex gap-2 ${T.body}`}>
                <dt className="shrink-0 font-bold text-stone-900">{g.group}:</dt>
                <dd className="text-stone-800">{g.items.join(' · ')}</dd>
              </div>
            ))}
            <div className={`flex gap-2 ${T.body}`}>
              <dt className="shrink-0 font-bold text-stone-900">Currently learning:</dt>
              <dd className="text-stone-800">{learning.join(', ')}</dd>
            </div>
          </dl>
        </Section>
      </div>
    </article>
  )
}
