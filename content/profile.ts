/**
 * Single source of truth for everything the site claims.
 *
 * `source` is not decoration. Anything marked `document` is backed by a file in
 * the repo and links to it; `confirmed` is publicly checkable (a live API, a
 * public repo); `self` is Harshit's own account of his work and is written as
 * such. Nothing ships without one of the three.
 */

export type Source = 'document' | 'confirmed' | 'self'

export interface Fact {
  readonly text: string
  readonly source: Source
  /** Path to the backing document, when there is one. */
  readonly evidence?: string
}

export const identity = {
  name: 'Harshit Wandhare',
  location: 'Richardson, TX',
  email: 'dal314006@utdallas.edu',
  altEmail: 'harshitwandhare45@gmail.com',
  github: 'https://github.com/harshitwandhare',
  // The `harshit-yc` work account was deleted and github.com/harshit-yc now
  // 404s, so it is not linked anywhere. The commits it made are still in the
  // Yosemite-Crew history, and the founder's letter covers the same ground
  // without depending on a profile that no longer exists.
  linkedin: 'https://linkedin.com/in/harshit-wandhare-a088201aa',
  status: 'Open to Summer 2027 SWE and AI/ML internships',
  // Replace this file with a real headshot — see public/portrait.README.
  portrait: '/portrait.jpg',
  // No phone number, deliberately, and not merely because one was missing.
  //
  // A number on a public page is harvested within days, and in this repo it
  // would also sit in git history forever. Recruiters open with email in any
  // case. The number belongs on the résumé PDF, which is sent to a named
  // recipient rather than crawled — so it lives there and nowhere in here.
} as const

/**
 * The one-paragraph summary at the top of the résumé sheet.
 *
 * Mirrors the LaTeX résumé so the two read as one document, with the star count
 * stated as a floor rather than a moving figure — the résumé's "2,100+" was
 * already above the real number by the time it was printed.
 */
export const summary =
  'Software engineer with 3 years shipping production systems end to end, now an M.S. Computer ' +
  'Science student at UT Dallas. Solo-owned the highest-traffic module of a 30-engineer program ' +
  'at Reliance Jio (top annual performance rating), then served as the sole engineer at a ' +
  '3-person company, building an open-source platform now past 2,000 GitHub stars. Seeking a ' +
  'Summer 2027 software engineering or AI/ML internship.'

export const hero = {
  line: 'I build production systems end to end — and have shipped them alone.',
  sub: 'Three years shipping web, mobile and backend at scale: enterprise platforms serving 100K+ users at Reliance Jio, then the entire engineering function at a three-person startup in Germany. Now an MS Computer Science student at UT Dallas on the Intelligent Systems track.',
} as const

/** The four numbers under the hero. Each implies a different competency. */
export interface Metric {
  readonly value: string
  readonly label: string
  readonly source: Source
  /** When true, the value is fetched live rather than typed. */
  readonly live?: boolean
  readonly note?: string
  /** Path to the backing document, when there is one. */
  readonly evidence?: string
}

export const metrics: readonly Metric[] = [
  {
    // Was 1,268 and "#1 of 15". Both moved when the `harshit-yc` work account
    // was deleted: GitHub re-attributes a deleted account's commits, and the
    // contributor count is 29 once anonymous attribution is included. 1,214 is
    // the figure the API returns today, and it is still the largest share of
    // any contributor — 982 is next.
    value: '1,214',
    label: 'commits — most on the project',
    source: 'confirmed',
    note: 'Verifiable via the contributors API with anon=1; the account itself is gone.',
  },
  // The only star count anywhere on the site. Job Sentinel and ATLAS are young
  // repos with none, and leading a panel with a zero would draw the eye
  // straight to the weakest fact on the page.
  { value: '2,045', label: 'stars on that project', source: 'confirmed', live: true },
  { value: '100K+', label: 'monthly users', source: 'self' },
  { value: 'A*', label: 'top rating, Jio', source: 'document', evidence: '/docs/jio-rating.pdf' },
]

export interface Role {
  readonly org: string
  readonly title: string
  readonly where: string
  readonly from: string
  readonly to: string
  readonly badge?: string
  /** Company mark, shown small beside the role. */
  readonly logo?: { src: string; alt: string }
  /** Where the company mark and name link to. */
  readonly href?: string
  readonly points: readonly Fact[]
}

export const experience: readonly Role[] = [
  {
    org: 'Yosemite Crew · DuneXploration UG',
    title: 'Product Engineer',
    where: 'Germany · Remote',
    from: '2025-09',
    to: '2026-07',
    logo: { src: '/logos/yosemite.png', alt: 'Yosemite Crew' },
    href: 'https://www.linkedin.com/company/yosemitecrew/',
    points: [
      {
        text: 'Sole engineer-owner of an open-source veterinary practice-management system at a three-person company — architecture, web platform, mobile app, integrations, CI and release.',
        source: 'document',
        evidence: '/docs/lor-founder.pdf',
      },
      {
        text: 'The #1 contributor to the project by commits, ahead of every other engineer on it.',
        source: 'confirmed',
      },
      {
        text: 'Owned the React Native app end to end including the release process — builds, store review, and shipping to both the App Store and Google Play.',
        source: 'document',
        evidence: '/docs/lor-founder.pdf',
      },
      { text: 'Designed HL7/FHIR-aligned clinical data models.', source: 'self' },
      {
        text: 'Integrated IDEXX Laboratories diagnostics and Merck Veterinary Manual APIs.',
        source: 'self',
      },
      {
        text: 'Built the auth stack on AWS Cognito and Amplify Gen 2 — custom Lambda OTP triggers, WebAuthn passkeys, TOTP MFA, OAuth across Google/Apple/Facebook — then led its migration to SuperTokens.',
        source: 'self',
      },
      {
        text: 'Owned cloud infrastructure (Lambda, S3, CloudFront, Redis) and authored the GitHub Actions estate — CodeQL, Gitleaks, SonarCloud gates, Playwright E2E — across three codebases in a Turborepo/pnpm monorepo.',
        source: 'self',
      },
      {
        text: 'Ran customer discovery interviews; hired and onboarded the second engineer, and wrote the specs they built against.',
        source: 'self',
      },
    ],
  },
  {
    org: 'Reliance Jio Platforms Limited',
    title: 'Software Development Engineer I',
    where: 'Navi Mumbai, India',
    from: '2023-10',
    to: '2025-09',
    badge: 'A* annual rating — the firm’s highest performance category',
    logo: { src: '/logos/jio.svg', alt: 'Reliance Jio' },
    href: 'https://www.linkedin.com/company/jioplatforms/',
    points: [
      {
        text: 'Rated A*, the highest performance category, awarded to a limited number of engineers.',
        source: 'document',
        evidence: '/docs/jio-rating.pdf',
      },
      {
        text: 'Ran daily scrum for a 30-engineer program spanning 10+ modules; solo-owned two modules end to end.',
        source: 'self',
      },
      {
        text: 'Enterprise products served 100K+ monthly active users; the larger module served 75,000+ on its own.',
        source: 'self',
      },
      {
        text: 'Designed the SDK layer for secure WebView-to-native message passing between React Native shells and embedded Angular/Next.js apps — adopted as the standard integration layer across products.',
        source: 'document',
        evidence: '/docs/lor-jio.pdf',
      },
      {
        text: 'Shipped four products to production: Selfie with Modi, Namo Trending New UI, Jio CMS Strapi, and Delhi Chali Modi Ke Saath.',
        source: 'document',
        evidence: '/docs/jio-rating.pdf',
      },
      {
        text: 'Built an internal CMS on Next.js and Strapi; cut average page load ~40% via an Angular 17 SSR migration deployed on EC2.',
        source: 'document',
        evidence: '/docs/lor-jio.pdf',
      },
    ],
  },
]

export interface Project {
  readonly name: string
  readonly blurb: string
  readonly stack: readonly string[]
  /** Omitted when the repository is private — a link that 404s is worse than none. */
  readonly repo?: string
  readonly live?: string
  readonly docs?: string
  readonly private?: boolean
  /** Project mark. `srcLight` is used in light mode where the two differ. */
  readonly logo?: { src: string; srcLight?: string; alt: string }
  readonly points: readonly Fact[]
}

// Job Sentinel leads. It is the most inspectable thing here — the CI badges,
// the test count and the ADRs are all publicly checkable in seconds, and
// inviting inspection is a stronger move than describing the work.
export const projects: readonly Project[] = [
  {
    name: 'Job Sentinel',
    blurb: 'Local-first career platform.',
    stack: ['Python', 'FastAPI', 'Playwright', 'Next.js', 'SQLite'],
    repo: 'https://github.com/harshitwandhare/job-sentinel',
    live: 'https://job-sentinel.vercel.app',
    docs: 'https://harshitwandhare.github.io/job-sentinel/',
    logo: { src: '/logos/job-sentinel.png', alt: '' },
    points: [
      {
        text: 'Aggregates postings across sources, scores role fit with a local or bring-your-own-key LLM, and tracks the full application pipeline.',
        source: 'self',
      },
      {
        text: 'Ships a clip-to-track browser extension, a Typer CLI, a Next.js UI and a FastAPI backend.',
        source: 'self',
      },
      { text: 'Local-first by design — no user data leaves the machine.', source: 'self' },
      {
        // 507 collected by pytest today. Written as a floor: the old "~450"
        // counted test functions and missed every parametrised case.
        text: '500+ tests, strict static typing, reproducible pinned builds, and CI gates for CodeQL, OpenSSF Scorecard, gitleaks, pip-audit and license compliance.',
        source: 'confirmed',
      },
    ],
  },
  {
    name: 'ATLAS',
    blurb: 'Multi-agent AI orchestration system.',
    stack: ['Python', 'FastAPI', 'asyncio', 'LangGraph', 'Next.js', 'SQLite'],
    repo: 'https://github.com/harshitwandhare/atlas-ra',
    live: 'https://atlas-ra.vercel.app',
    logo: { src: '/logos/atlas-dark.svg', srcLight: '/logos/atlas-light.svg', alt: '' },
    points: [
      {
        text: 'An orchestrator routes goals to specialist agent teams and a Critic verifies every result before it counts as done.',
        source: 'confirmed',
      },
      {
        text: 'Three memory tiers — an episodic SQLite ledger, a semantic store, and versioned skill playbooks.',
        source: 'confirmed',
      },
      {
        text: 'Three interchangeable runtimes — Claude Agent SDK, LangGraph, and local Ollama — behind one typed protocol.',
        source: 'confirmed',
      },
      {
        text: 'Destructive host actions are approval-gated in code, not in prompts.',
        source: 'confirmed',
      },
      {
        text: 'Strict static typing, 59 tests, and behavioural evals gating CI.',
        source: 'confirmed',
      },
    ],
  },
  {
    name: 'Kalki',
    blurb: 'Autonomous AI content generation.',
    stack: ['TypeScript', 'Node.js', 'LLM APIs'],
    // The repository is private, so no link is rendered.
    private: true,
    points: [
      {
        text: 'Generates and publishes short-form video autonomously — LLM-driven scripting, automated media processing, scheduled publishing.',
        source: 'self',
      },
    ],
  },
]

/**
 * The résumé download.
 *
 * Deliberately `null` for now. The current PDF carries a US phone number, and a
 * PDF linked from a public page is harvested the same way a page is — which
 * would undo the decision made in `identity` above for the sake of one file.
 *
 * To publish it: remove the phone from the header in the résumé source,
 * recompile, save as `public/resume.pdf`, and set this to
 * `{ file: '/resume.pdf', updated: 'YYYY-MM' }`. Nothing else needs changing —
 * the contact section renders the link only when this is set, and a test
 * asserts the published file carries no phone number.
 */
export const resume: { readonly file: string; readonly updated: string } | null = null

export interface Paper {
  readonly title: string
  readonly venue: string
  /** Hosted here, not merely cited. A downloadable paper persuades; a citation does not. */
  readonly file: string
  readonly pages: number
  readonly sizeMb: string
  readonly points: readonly string[]
}

export const research: readonly Paper[] = [
  {
    title: 'Integrating YOLOv5 and CNN for Number Plate Recognition in Automated Parking Systems',
    venue: 'First author · Vidyalankar Institute of Technology · 2023 · unpublished manuscript',
    file: '/papers/number-plate-recognition.pdf',
    pages: 8,
    sizeMb: '1.1',
    points: [
      'YOLOv5 detector at 95.45% mAP, 88.7% precision, 96.4% recall — 100 epochs on a 433-image custom dataset.',
      'Custom CNN over 36 character classes at 89.66% accuracy — 80 epochs, 6,659-image dataset.',
      'OpenCV preprocessing: cropping, grayscale, Hough-transform deskew, contour-based character segmentation.',
      'Trained locally on an Nvidia RTX 2060 (6GB) — 100 epochs in 0.849 hours.',
    ],
  },
  {
    title:
      'A Comprehensive Survey of Methodologies in Social Media Analytics for Disaster Management',
    venue: 'First author · Vidyalankar Institute of Technology · unpublished manuscript',
    file: '/papers/social-media-disaster-management.pdf',
    pages: 5,
    sizeMb: '0.25',
    points: [
      'Systematic review of seven papers spanning CyberGIS frameworks, text mining, QGIS spatial analysis, YOLO/VGG-16 image classification, CNN visual sentiment analysis and NLP tweet classification.',
    ],
  },
]

/** Ordered so that backend, infrastructure and ML lead. Frontend never leads. */
export const skills: ReadonlyArray<{ group: string; items: readonly string[] }> = [
  { group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'SQL', 'Bash'] },
  {
    group: 'AI / ML',
    items: [
      'PyTorch',
      'OpenCV',
      'YOLOv5 & CNNs',
      'LLM agent systems',
      'LangGraph',
      'Ollama',
      'RAG',
      'CUDA',
    ],
  },
  {
    group: 'Backend & Data',
    items: [
      'FastAPI',
      'Node.js/Express',
      'Spring Boot',
      'REST',
      'WebSockets',
      'Redis',
      'PostgreSQL',
      'MongoDB',
      'MySQL',
      'SQLite',
    ],
  },
  {
    group: 'Cloud & Infrastructure',
    items: [
      'AWS (Cognito, Lambda, S3, CloudFront, Amplify)',
      'Docker',
      'GitHub Actions',
      'Linux',
      'Turborepo',
    ],
  },
  {
    group: 'Testing & Quality',
    items: ['pytest', 'Jest', 'Playwright', 'mypy --strict', 'CodeQL', 'Gitleaks', 'SonarCloud'],
  },
  {
    group: 'Frontend & Mobile',
    items: ['React', 'Next.js', 'Angular', 'React Native', 'Redux', 'Tailwind CSS'],
  },
]

export const learning = ['Rust'] as const

export const education = [
  {
    school: 'The University of Texas at Dallas',
    detail: 'M.S. Computer Science — Intelligent Systems track',
    from: '2026-08',
    to: '2028-05',
    note: 'Jonsson School Dean’s Graduate Scholarship',
    href: 'https://www.utdallas.edu',
    logo: { src: '/logos/utd.png', alt: 'The University of Texas at Dallas' },
  },
  {
    // The degree-awarding university leads; the affiliated college is the
    // detail. A reader outside India knows Mumbai and does not know Vidyalankar.
    school: 'University of Mumbai',
    detail: 'B.E. Computer Engineering · Vidyalankar Institute of Technology',
    from: '2019-08',
    to: '2023-05',
    note: 'CGPA 9.53 / 10.0',
    // Not mu.ac.in — it resolves but does not answer, and a link that hangs is
    // worse than none. Wikipedia is reachable, and for a reader outside India
    // it explains the university better than the university's own site does.
    href: 'https://en.wikipedia.org/wiki/University_of_Mumbai',
    logo: {
      src: '/logos/mu-dark.png',
      srcLight: '/logos/mu-light.png',
      alt: 'University of Mumbai',
    },
  },
] as const

/** The narrative layer — deliberately behind an opt-in, not in the recruiter path. */
export const story = [
  {
    year: '2015',
    place: 'Nagpur',
    lat: 21.15,
    lon: 79.09,
    title: 'A balloon, and an idea borrowed from Google',
    body: 'Eighth standard. Google had just announced Project Loon — balloons in the stratosphere carrying internet to places cables would never reach. I built my own version at school. The local papers ran it. I have been chasing the same feeling ever since: take an idea that is too big for you, and build the small version anyway.',
  },
  {
    year: '2019',
    place: 'Mumbai',
    lat: 19.08,
    lon: 72.88,
    title: 'Engineering, and the first real system',
    body: 'Vidyalankar, Computer Engineering, 9.53. The final-year project was Parkify — YOLOv5 to find the number plate, a CNN to read it, OpenCV to clean up everything in between. I led the technical side: model selection, training, evaluation, and the integration that turned three separate pieces into one system that worked.',
  },
  {
    year: '2023',
    place: 'Navi Mumbai',
    lat: 19.03,
    lon: 73.03,
    title: 'Reliance Jio, and being told what I was missing',
    body: 'I joined as a fresh graduate and left two years later with an A*, the firm’s highest rating. I ran standup for thirty engineers and solo-owned the busiest module in the program. But the appraisal that gave me the A* also said, in writing, that I needed to understand the backend better. That line is the reason for everything after it.',
  },
  {
    year: '2025',
    place: 'Mainz',
    lat: 49.99,
    lon: 8.25,
    title: 'Three people, one engineer',
    body: 'A German startup, and I was the entire engineering function. Architecture, the web platform, the React Native app on both stores, the FHIR data models, the auth stack, the CI, the cloud. I ran the customer interviews. I hired the engineer who came after me and wrote the specs he built against. The project is open source and I am still its largest contributor.',
  },
  {
    year: '2026',
    place: 'Richardson',
    lat: 32.95,
    lon: -96.73,
    title: 'UT Dallas',
    body: 'MS Computer Science, Intelligent Systems. Building agent infrastructure in my own time. Still the same thing as the balloon, with better tools.',
  },
] as const
