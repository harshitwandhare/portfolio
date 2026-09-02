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
  email: 'Harshit.Wandhare@utdallas.edu',
  altEmail: 'harshitwandhare45@gmail.com',
  github: 'https://github.com/harshitwandhare',
  // The `harshit-yc` work account was deleted and github.com/harshit-yc now
  // 404s, so it is not linked anywhere. The commits it made are still in the
  // Yosemite-Crew history, and the founder's letter covers the same ground
  // without depending on a profile that no longer exists.
  linkedin: 'https://linkedin.com/in/harshit-wandhare-a088201aa',
  status: 'Open to Summer 2027 software, product and AI/ML engineering internships',
  // Replace this file with a real headshot. See public/portrait.README.
  portrait: '/portrait.jpg',
  // No phone number, deliberately, and not merely because one was missing.
  //
  // A number on a public page is harvested within days, and in this repo it
  // would also sit in git history forever. Recruiters open with email in any
  // case. The number belongs on the résumé PDF, which is sent to a named
  // recipient rather than crawled, so it lives there and nowhere in here.
} as const

/**
 * The one-paragraph summary at the top of the résumé sheet.
 *
 * Mirrors the LaTeX résumé so the two read as one document, with the star count
 * stated as a floor rather than a moving figure. The résumé's "2,100+" was
 * already above the real number by the time it was printed.
 */
export const summary =
  'Software and product engineer with 3 years shipping production systems, now an M.S. Computer ' +
  'Science student at UT Dallas. Solo-owned the busiest module of a 30-engineer program ' +
  'at Reliance Jio (top annual rating), then owned the full stack of an open-source platform at a ' +
  '3-person company. 8 pull requests merged into Google, AWS, NVIDIA and Anthropic repositories. ' +
  'Seeking a Summer 2027 software or AI/ML internship.'

export const hero = {
  // The role, said plainly, directly under the name.
  //
  // The page used to open on "I own systems end to end", which says how much of
  // a system he takes on but never says what he is. Someone hiring a software
  // engineer had to read three paragraphs and infer it, and the only place the
  // job title appeared at all was the structured data, which no human sees.
  // Machines knew and people did not, which is the wrong way round.
  role: 'Software and product engineer',
  // Not "shipped them alone". Owning a system end to end is the claim worth
  // making; "alone" invites the reader to ask whether he can work on a team,
  // which the Jio scrum lead and the engineer he hired both answer below.
  line: 'I own systems end to end, from the data model to the app store.',
  // Names the surfaces rather than gesturing at them. A reader hiring for the
  // web, for mobile, for backend or for AI work should find their own words
  // here instead of deciding it is probably not for them.
  sub: 'Three years shipping production software: React and Next.js on the web, React Native on both app stores, Node and Python services on AWS underneath, and AI agent systems on top. Enterprise platforms serving 100K+ users at Reliance Jio, then full-stack ownership of an open-source platform at a three-person startup in Germany. Now an MS Computer Science student at UT Dallas, still sending patches to other people’s repositories most weeks.',
} as const

/** The four numbers under the hero. Each implies a different competency. */
export interface Metric {
  readonly value: string
  readonly label: string
  readonly source: Source
  /**
   * Where a reader goes to check the number themselves. A `confirmed` metric
   * that nobody can reach in one click is only as good as the reader's trust,
   * which is the thing the number is meant to earn.
   */
  readonly href?: string
  readonly note?: string
  /** Path to the backing document, when there is one. */
  readonly evidence?: string
}

// Every figure below was re-checked against the GitHub API on 2026-08-16. They
// drift, so re-check before claiming them elsewhere; the commit count only ever
// grows, the star count moves both ways.
export const metrics: readonly Metric[] = [
  {
    // History of this number, because the attribution behind it has broken
    // twice. It was 1,268 and "#1 of 15" while the `harshit-yc` work account
    // existed. The company deleted that account, which orphaned every commit.
    // Verifying harshit@yosemitecrew.com on the personal account made GitHub
    // re-attribute them retroactively. On 2026-08-18 that email was removed
    // again and briefly ended up verified on a colleague's account, which made
    // these commits render under his profile; it has since been released and
    // the email is now held by nobody.
    //
    // So the link is the author-filtered commit list, NOT
    // /graphs/contributors. While the commits are unattributed the graph does
    // not list him at all, and sending a reader there would show them a page he
    // is absent from. The commit list is filtered on the git author *email*,
    // which lives in the commit objects themselves and is true regardless of
    // which GitHub account happens to hold that address. It renders his name on
    // all 1,394 rows.
    //
    // Counted on `main` via /repos/.../commits?author=<email>, 2026-08-18:
    // harshit 1,394, harshvardhan 1,058, ankit 81. The ranking is checkable by
    // swapping the email in that URL, which is why the claim can still be made.
    value: '1,394',
    label: 'commits, most on the project',
    source: 'confirmed',
    href: 'https://github.com/YosemiteCrew/Yosemite-Crew/commits/main?author=harshit%40yosemitecrew.com',
    note: 'Every one of them, filtered by author email',
  },
  // The only star count anywhere on the site. Job Sentinel and ATLAS are young
  // repos with none, and leading a panel with a zero would draw the eye
  // straight to the weakest fact on the page.
  {
    // A floor, not a reading. This was 2,045, then 2,034, and is 2,025 today:
    // stars move both ways and a figure printed above the real one is the worst
    // version of a true claim. The floor stays true without maintenance.
    value: '2,000+',
    label: 'stars on that project',
    source: 'confirmed',
    // The repo home, not /stargazers: GitHub 404s the stargazers list for
    // signed-out visitors, and the count is on the repo header anyway.
    href: 'https://github.com/YosemiteCrew/Yosemite-Crew',
    note: 'Check it on GitHub',
  },
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
    from: '2025-10',
    to: '2026-07',
    logo: { src: '/logos/yosemite.png', alt: 'Yosemite Crew' },
    href: 'https://www.linkedin.com/company/yosemitecrew/',
    points: [
      {
        // Not "sole engineer". A backend product engineer worked alongside him
        // and is the 1,058 in the line below, so the honest claim is the scope
        // he owned, not the absence of anyone else.
        text: 'Owned the full stack of an open-source veterinary practice-management system at a three-person company: architecture, web platform, mobile app, integrations, CI and release.',
        source: 'document',
        evidence: '/docs/lor-founder.pdf',
      },
      {
        text: 'The largest contributor to the project by commits, ahead of every other engineer on it, with 1,394 against 1,058 for the next.',
        source: 'confirmed',
      },
      {
        text: 'Owned the React Native app end to end including the release process: builds, store review, and shipping to both the App Store and Google Play.',
        source: 'document',
        evidence: '/docs/lor-founder.pdf',
      },
      { text: 'Designed HL7/FHIR-aligned clinical data models.', source: 'self' },
      {
        text: 'Integrated IDEXX Laboratories diagnostics and Merck Veterinary Manual APIs.',
        source: 'self',
      },
      {
        // Scoped down deliberately. Passkeys, TOTP and the SuperTokens
        // migration were mostly the backend engineer's work; what he owns here
        // is the Cognito sign-in and the docs the migration was built from.
        text: 'Built sign-in on AWS Cognito and Amplify Gen 2, covering OAuth across several identity providers and email with one-time codes, and wrote the integration docs the backend engineer worked from.',
        source: 'self',
      },
      {
        text: 'Owned cloud infrastructure (Lambda, S3, CloudFront, Redis) and authored the GitHub Actions estate, from CodeQL and Gitleaks to SonarCloud gates and Playwright E2E, across three codebases in a Turborepo/pnpm monorepo.',
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
    badge: 'A* annual rating, the firm’s highest performance category',
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
        text: 'Designed the SDK layer for secure WebView-to-native message passing between React Native shells and embedded Angular/Next.js apps, adopted as the standard integration layer across products.',
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
  /** Omitted when the repository is private: a link that 404s is worse than none. */
  readonly repo?: string
  readonly live?: string
  readonly docs?: string
  readonly private?: boolean
  /** Project mark. `srcLight` is used in light mode where the two differ. */
  readonly logo?: { src: string; srcLight?: string; alt: string }
  readonly points: readonly Fact[]
}

// Job Sentinel leads. It is the most inspectable thing here, the CI badges,
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
      { text: 'Local-first by design: no user data leaves the machine.', source: 'self' },
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
        text: 'Three memory tiers: an episodic SQLite ledger, a semantic store, and versioned skill playbooks.',
        source: 'confirmed',
      },
      {
        text: 'Three interchangeable runtimes (Claude Agent SDK, LangGraph, and local Ollama) behind one typed protocol.',
        source: 'confirmed',
      },
      {
        text: 'Destructive host actions are approval-gated in code, not in prompts.',
        source: 'confirmed',
      },
      {
        // A floor. The suite is at 64 today and only grows, so an exact count
        // here is a number that goes stale every time a test is added.
        text: 'Strict static typing, 60+ tests, and behavioural evals gating CI.',
        source: 'confirmed',
      },
    ],
  },
  // Kalki, an autonomous short-form video generator, used to sit here. It came
  // out because its repository is private, so the card was the only one on a
  // page built around checkable claims that a reader could not open. A card
  // nobody can click is the weakest thing in a section called Selected work.
  {
    name: 'dsa-mastery',
    blurb: 'Algorithms curriculum that runs in the browser.',
    stack: ['Python', 'TypeScript', 'Next.js', 'Pyodide'],
    repo: 'https://github.com/harshitwandhare/dsa-mastery',
    live: 'https://dsa-mastery-delta.vercel.app',
    logo: { src: '/logos/dsa-dark.svg', srcLight: '/logos/dsa-light.svg', alt: '' },
    points: [
      {
        text: '315 indexed problems and 75 graded drills across 29 lessons, from first principles rather than from a problem list.',
        source: 'confirmed',
      },
      {
        text: 'Python executes in the browser in a Web Worker, with a timeout enforced by terminating the worker, since nothing else can interrupt running Python.',
        source: 'confirmed',
      },
      {
        text: 'Every page is generated from markdown, and CI fails the build if the published output drifts from its source.',
        source: 'confirmed',
      },
      {
        text: 'A stylesheet test reads the real tokens and fails if any colour drops below WCAG AA.',
        source: 'confirmed',
      },
    ],
  },
]

export interface MergedPr {
  readonly number: number
  readonly title: string
  /** ISO date it landed. */
  readonly merged: string
  readonly url: string
  /** Set only where the change is worth calling out as more than a fix. */
  readonly tag?: string
}

export interface Contribution {
  /** owner/name, exactly as GitHub spells it. */
  readonly repo: string
  /** His merged pull requests on that repo, filtered by author. */
  readonly href: string
  readonly what: string
  readonly language: string
  /** `srcLight` only where the published avatar needs a second file per theme. */
  readonly logo: { src: string; srcLight?: string; alt: string }
  readonly merged: readonly MergedPr[]
}

/**
 * Work merged into other people's repositories.
 *
 * This section exists because it is the only thing on the page that a stranger
 * can verify without taking his word for anything. The Yosemite commit count
 * needs an author-email filter to survive a broken attribution; a merged pull
 * request in someone else's repository needs nothing. It is either there or it
 * is not, the maintainer's name is on the merge, and the diff is public.
 *
 * Ordered by what was merged, not by how famous the owner is. Two more are open
 * and are listed separately, because "open" and "merged" are different claims
 * and collapsing them would be the whole point of the section, lost.
 *
 * Every URL here is checked by the link test in e2e/content.spec.ts.
 * Verified against `gh pr list --author harshitwandhare` on 2026-09-01.
 */
export const openSource = {
  since: 'August 2026',
  mergedCount: 8,
  method:
    'The method does not vary. Reproduce the failure, write the test that fails first, state the broken invariant in one sentence, then send the smallest change that passes.',
  repos: [
    {
      repo: 'awslabs/cli-agent-orchestrator',
      href: 'https://github.com/awslabs/cli-agent-orchestrator/pulls?q=is%3Apr+author%3Aharshitwandhare',
      what: 'Multi-agent orchestration for coding CLIs, in isolated tmux sessions.',
      language: 'Python',
      logo: { src: '/logos/gh-awslabs.png', alt: 'awslabs on GitHub' },
      merged: [
        {
          number: 656,
          title: 'make _origin_authority total against a malformed Origin',
          merged: '2026-08-22',
          url: 'https://github.com/awslabs/cli-agent-orchestrator/pull/656',
          tag: 'security',
        },
        {
          number: 658,
          title: 'make the same-origin check scheme-aware',
          merged: '2026-08-23',
          url: 'https://github.com/awslabs/cli-agent-orchestrator/pull/658',
          tag: 'security',
        },
        {
          number: 669,
          title: 'drop the _origin_authority wrapper, document when the scheme guard applies',
          merged: '2026-08-25',
          url: 'https://github.com/awslabs/cli-agent-orchestrator/pull/669',
        },
        {
          number: 683,
          title: 'wait for the server to exit before asserting the absence',
          merged: '2026-08-26',
          url: 'https://github.com/awslabs/cli-agent-orchestrator/pull/683',
          tag: 'flaky test',
        },
      ],
    },
    {
      repo: 'google/adk-go',
      href: 'https://github.com/google/adk-go/pulls?q=is%3Apr+author%3Aharshitwandhare',
      what: 'Google’s Agent Development Kit, the Go toolkit for building and deploying agents.',
      language: 'Go',
      logo: { src: '/logos/gh-google.png', alt: 'google on GitHub' },
      merged: [
        {
          number: 1394,
          title: 'match the copyright skip list against slash-separated paths',
          merged: '2026-08-25',
          url: 'https://github.com/google/adk-go/pull/1394',
        },
        {
          number: 1400,
          title: 'name the awaited event instead of panicking on a closed channel',
          merged: '2026-08-30',
          url: 'https://github.com/google/adk-go/pull/1400',
          tag: 'concurrency',
        },
      ],
    },
    {
      repo: 'anthropics/buffa',
      href: 'https://github.com/anthropics/buffa/pulls?q=is%3Apr+author%3Aharshitwandhare',
      what: 'A protobuf implementation in Rust, with editions support and zero-copy views.',
      language: 'Rust',
      logo: { src: '/logos/gh-anthropics.png', alt: 'anthropics on GitHub' },
      merged: [
        {
          number: 375,
          title: 'qualify the core::fmt path in the generated Deserialize impl',
          merged: '2026-08-29',
          url: 'https://github.com/anthropics/buffa/pull/375',
        },
      ],
    },
    {
      repo: 'NVIDIA/cosmos-framework',
      href: 'https://github.com/NVIDIA/cosmos-framework/pulls?q=is%3Apr+author%3Aharshitwandhare',
      what: 'NVIDIA’s inference and training framework for the Cosmos models.',
      language: 'Python',
      // The published avatar sets the wordmark in near black, which disappears
      // on the dark theme, so it ships as a pair. Only the monochrome pixels
      // are lifted to the page foreground; the green eye is untouched.
      logo: {
        src: '/logos/gh-nvidia-dark.png',
        srcLight: '/logos/gh-nvidia-light.png',
        alt: 'NVIDIA on GitHub',
      },
      merged: [
        {
          number: 219,
          title: 'jitter the DROID composite instead of the three full-size views',
          merged: '2026-09-02',
          url: 'https://github.com/NVIDIA/cosmos-framework/pull/219',
          tag: 'performance',
        },
      ],
    },
  ] as readonly Contribution[],
  /** In review. Kept apart from the merged list on purpose. */
  open: [
    {
      repo: 'a2aproject/a2a-js',
      title: 'expose v0.3 to v1.0 translators as a subpath export',
      url: 'https://github.com/a2aproject/a2a-js/pull/670',
    },
    {
      repo: 'awslabs/cli-agent-orchestrator',
      title: 'keep another socket bound while asserting the lsof absence',
      url: 'https://github.com/awslabs/cli-agent-orchestrator/pull/716',
    },
  ],
} as const

/**
 * The résumé download.
 *
 * Deliberately `null` for now. The current PDF carries a US phone number, and a
 * PDF linked from a public page is harvested the same way a page is, which
 * would undo the decision made in `identity` above for the sake of one file.
 *
 * To publish it: remove the phone from the header in the résumé source,
 * recompile, save as `public/resume.pdf`, and set this to
 * `{ file: '/resume.pdf', updated: 'YYYY-MM' }`. Nothing else needs changing,
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
      'YOLOv5 detector at 95.45% mAP, 88.7% precision, 96.4% recall, over 100 epochs on a 433-image custom dataset.',
      'Custom CNN over 36 character classes at 89.66% accuracy, over 80 epochs on a 6,659-image dataset.',
      'OpenCV preprocessing: cropping, grayscale, Hough-transform deskew, contour-based character segmentation.',
      'Trained locally on an Nvidia RTX 2060 (6GB): 100 epochs in 0.849 hours.',
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
    detail: 'M.S. Computer Science, Intelligent Systems track',
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
    // Not mu.ac.in. It resolves but does not answer, and a link that hangs is
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

/** The narrative layer, deliberately behind an opt-in, not in the recruiter path. */
export const story = [
  {
    year: '2015',
    place: 'Nagpur',
    lat: 21.15,
    lon: 79.09,
    title: 'A balloon, and an idea borrowed from Google',
    body: 'Eighth standard. Google had just announced Project Loon: balloons in the stratosphere carrying internet to places cables would never reach. I built my own version at school. The local papers ran it. I have been chasing the same feeling ever since: take an idea that is too big for you, and build the small version anyway.',
  },
  {
    year: '2019',
    place: 'Mumbai',
    lat: 19.08,
    lon: 72.88,
    title: 'Engineering, and the first real system',
    body: 'Vidyalankar, Computer Engineering, 9.53. The final-year project was Parkify. YOLOv5 to find the number plate, a CNN to read it, OpenCV to clean up everything in between. I led the technical side: model selection, training, evaluation, and the integration that turned three separate pieces into one system that worked.',
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
    body: 'A German startup, three people, and I owned the whole stack. Architecture, the web platform, the React Native app on both stores, the FHIR data models, the sign-in, the CI, the cloud. I ran the customer interviews. I hired the second engineer and wrote the specs he built against. The project is open source and I am still its largest contributor by commits.',
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
