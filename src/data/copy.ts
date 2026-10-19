// All display copy, section headings and the /fast page text.
//
// This file is the source of truth — edit it directly. It began as an exact
// extraction from the prototype; since 2026-10-19 the wording is owned here.
// `npm run verify:content` checks its structure, not its wording.

export interface RailLabel {
  /** Devanagari section title shown in the left rail. */
  readonly devanagari: string;
  /** Numbered English label, e.g. "00 / Who I am". */
  readonly label: string;
}

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export interface SkillBar {
  /** Matches `data-skill`, used by StackFilter to dim project cards. */
  readonly key: string;
  readonly label: string;
  readonly level: string;
  /** Bar fill width, percent. */
  readonly pct: number;
}

export interface SkillChip {
  readonly key: string;
  readonly label: string;
}

export interface Stat {
  readonly value: string;
  readonly label: string;
  /** Target for the count-up animation. */
  readonly count: number;
  readonly suffix: string;
}

export interface Role {
  readonly period: string;
  readonly org: string;
  readonly meta: string;
  readonly bullets: readonly string[];
}

export const COPY = {
  meta: {
    title: "Ritul Aryan — AI Software Engineer",
  },

  /**
   * IntroLoader. The 1.7s duration is fixed, not real load progress, and SKIP
   * is the visitor's route to the light path — see BUILD-RULES.md before changing.
   */
  loader: {
    name: "ऋतुल आर्यन",
    tickerStart: "initialising",
    tickerBuilding: "building the index",
    tickerReady: "ready",
    countZero: "00%",
    skip: "SKIP → PLAIN TEXT VERSION",
  },

  header: {
    brand: "RITUL ARYAN",
    /** NOTE: "WORK" points at #projects, not #work. Faithful to the prototype. */
    nav: [
      { label: "NOW", href: '#now' },
      { label: "PATENT", href: '#patent' },
      { label: "WORK", href: '#projects' },
      { label: "STACK", href: '#stack' },
      { label: "CONTACT", href: '#contact' },
    ] as readonly NavLink[],
    clockPlaceholder: "DELHI · --:--",
    clockPanelWhere: "DELHI NCR · IST (UTC+5:30) · WHERE I AM",
    modeFull: "FULL",
    modeFast: "FAST",
  },

  hero: {
    role: "AI Software Engineer",
    separator: "/",
    location: "Delhi NCR, India",
    /** Rendered as two lines; the prototype splits them with <br>. */
    nameLines: ["Ritul", "Aryan"] as readonly string[],
    devanagari: "ऋतुल आर्यन",
    lede: "I build systems that reason before they answer — multi-agent pipelines, retrieval, and the plumbing underneath. This page is one of them.",
    typewriterLines: [
      "Architecting SAGE, an agentic platform at Akin.",
      "Named inventor on Indian patent 202611015954 A.",
      "Five agents, one pipeline, one audit trail.",
      "Inference stays local. Client data stays put.",
      "Delhi state champion in Kurash, U-19.",
      "BCA in AI & Data Science, expected 2027.",
    ] as readonly string[],
    askBullet: "◆",
    /** Wraps the fact count: `askBefore` + 44 + `askAfter`. */
    askBefore: "Ask the index —",
    askAfter: "facts, scored in your browser. Press / to focus, or click any point in the field",
    askPrompt: "?",
    retrieve: "RETRIEVE",
    closeAnswer: "CLOSE ✕",
    scrollHint: "Scroll — or ask",
  },

  about: {
    rail: { devanagari: "परिचय", label: "00 / Who I am" } as RailLabel,
    /** The coordinate caption under the 230px 4:5 frame. */
    coordinates: "28.61°N 77.21°E",
    paragraphs: [
      "I'm twenty-something, based in Delhi NCR, and most of what I know I learned by building the thing badly first. I'm drawn to problems where a single model isn't enough — where you need several of them checking each other, a retrieval layer that doesn't hallucinate, and an audit trail you can actually defend in a room full of people who didn't write the code.",
      "Before software I spent years on a mat: I was Delhi state champion in Kurash at U-19. That's where I learned the only useful thing about pressure — you don't rise to the occasion, you fall to the level of your preparation. It's why I over-prepare, why I write tests, and why I'd rather ship something small that holds than something large that doesn't.",
      "Currently finishing a BCA in AI & Data Science (2027) while working as a software development intern. I read papers on the metro, I break things on purpose, and I'm looking for people who'd rather argue about architecture than agree about nothing.",
    ] as readonly string[],
    links: [
      { label: "EMAIL", href: 'mailto:ritularyan1723@gmail.com' },
      { label: "GITHUB", href: 'https://github.com/ritul-aryan' },
      { label: "LINKEDIN", href: 'https://linkedin.com/in/ritul-aryan' },
    ] as readonly NavLink[],
  },

  /** The centred interstitial between About and Now. Has no id in the prototype. */
  patterns: {
    devanagari: "हर चीज़ में एक पैटर्न है",
    headline: "A galaxy and a dataset are the same problem — too many points, not enough story.",
    body: "The field behind this page is both. At rest it's a constellation. Ask it something and it becomes a network — the same points, the same lines, a different question. That's the whole job.",
  },

  now: {
    rail: { devanagari: "अभी", label: "01 / What I'm building" } as RailLabel,
    title: "SAGE",
    badge: "BUILDING NOW",
    body: "An agentic analytics platform I pitched to the Board, the Director and the CEO of Akin Pte. Ltd. — and was approved to architect end to end. Five specialised agents run the exploratory-data-analysis pipeline. Every step writes to an audit trail you can replay. Inference stays local on a dual-model router/generator split, so client data never leaves the machine.",
    stats: [
      { value: "5", label: "agents in the pipeline", count: 5, suffix: "" },
      { value: "2", label: "model router / generator", count: 2, suffix: "" },
      { value: "100%", label: "local inference · Ollama", count: 100, suffix: "%" },
      { value: "3", label: "execs in the room at pitch", count: 3, suffix: "" },
    ] as readonly Stat[],
    chips: [
      { key: "langgraph", label: "LangGraph" },
      { key: "fastapi", label: "FastAPI" },
      { key: "react", label: "React + TypeScript" },
      { key: "plotly", label: "Plotly" },
      { key: "ollama", label: "Ollama" },
      { key: "docker", label: "Docker Compose" },
    ] as readonly SkillChip[],
    disclaimer: "SCREENSHOTS WITHHELD — UNRELEASED COMPANY UI",
  },

  work: {
    rail: { devanagari: "कार्य", label: "02 / Experience" } as RailLabel,
    roles: [
      {
        period: "JUN 2026 → PRESENT",
        org: "Akin Pte. Ltd.",
        meta: "Software Development Intern · AI Tools & Automation · Singapore, remote",
        bullets: [
          "Pitched SAGE to the Board, Director and CEO; approved to architect and build it end to end.",
          "Designed a five-agent EDA pipeline with a complete, replayable audit trail.",
          "Kept inference local on a dual-model router/generator architecture over Ollama.",
        ],
      },
      {
        period: "FEB 2026 → MAY 2026",
        org: "Ethara AI",
        meta: "LLM Post-Training Intern",
        bullets: [
          "Promoted Tasker → Quality Reviewer inside the first month.",
          "RLHF evaluation; reviewed output from up to 40 contributors.",
        ],
      },
    ] as readonly Role[],
  },

  patent: {
    rail: { devanagari: "पेटेंट", label: "03 / Patent" } as RailLabel,
    title: "An AI Powered Wheeled Omnidirectional Robot",
    body: "Named inventor, one of seven. I was software lead: sensor fusion, navigation, and a real-time fall-detection subsystem on OpenCV and MediaPipe with a ten-second confirmation loop that has to hold before the robot escalates to an emergency alert. The loop exists because a false alarm at 3am costs more trust than it saves.",
    /**
     * The first two carry `data-chip` keys so StackFilter can highlight them;
     * the last two are inert labels with no key.
     */
    chips: [
      { key: "opencv", label: "OpenCV" },
      { key: "mediapipe", label: "MediaPipe" },
      { label: "Sensor fusion" },
      { label: "Navigation" },
    ] as readonly { readonly key?: string; readonly label: string }[],
    recordHeading: "APPLICATION RECORD",
    /**
     * Each value is a list of lines. The prototype hard-breaks the APPLICANT
     * value across two lines with <br>; flattening it to one string changes the
     * rendered cell, so the break is preserved as data.
     */
    record: [
      { key: "NO.", lines: ["202611015954 A"] },
      { key: "FILED", lines: ["12 FEB 2026"] },
      { key: "PUBLISHED", lines: ["27 MAR 2026"] },
      { key: "JOURNAL", lines: ["13/2026"] },
      { key: "APPLICANT", lines: ["K.R. Mangalam", "University"] },
    ] as readonly { readonly key: string; readonly lines: readonly string[] }[],
  },

  projects: {
    rail: { devanagari: "परियोजनाएँ", label: "04 / Projects" } as RailLabel,
    /** `blurbBefore` + highlighted "portfolio" + `blurbAfter`. */
    blurbBefore: "This list refreshes itself. It reads my GitHub live and shows only repos I've tagged",
    blurbTopic: "portfolio",
    blurbAfter: "— I curate it by adding a tag, never by editing this page.",
    /** Rail status when the build-time GitHub fetch fails or is skipped. */
    statusOffline: "GITHUB UNREACHABLE AT BUILD · SHOWING CURATED",
  },

  stack: {
    rail: { devanagari: "कौशल", label: "05 / Stack" } as RailLabel,
    hintBefore: "Hover to preview.",
    hintAction: "Click to pin",
    hintAfter: "— the filter holds on the projects above until you clear it or leave this section.",
    groups: {
      languages: {
        heading: "Languages",
        bars: [
          { key: "python", label: "Python", level: "ADVANCED", pct: 95 },
          { key: "typescript", label: "TypeScript", level: "STRONG", pct: 72 },
          { key: "sql", label: "SQL", level: "STRONG", pct: 68 },
          { key: "cpp", label: "C++ · JavaScript", level: "WORKING", pct: 54 },
        ] as readonly SkillBar[],
      },
      agentic: {
        heading: "Agentic & LLM",
        chips: [
          { key: "langgraph", label: "LangGraph" },
          { key: "rag", label: "RAG" },
          { key: "langchain", label: "LangChain" },
          { key: "ollama", label: "Ollama" },
          { key: "rlhf", label: "RLHF" },
          { key: "embeddings", label: "HuggingFace embeddings" },
          { key: "chromadb", label: "ChromaDB" },
          { key: "pytorch", label: "PyTorch" },
        ] as readonly SkillChip[],
      },
      dataVision: {
        heading: "Data & Vision",
        chips: [
          { key: "pandas", label: "Pandas" },
          { key: "numpy", label: "NumPy" },
          { key: "sklearn", label: "Scikit-learn" },
          { key: "plotly", label: "Plotly" },
          { key: "opencv", label: "OpenCV" },
          { key: "mediapipe", label: "MediaPipe" },
        ] as readonly SkillChip[],
      },
      platform: {
        heading: "Backend, Frontend, Ops",
        chips: [
          { key: "fastapi", label: "FastAPI" },
          { key: "sqlalchemy", label: "SQLAlchemy" },
          { key: "alembic", label: "Alembic" },
          { key: "sqlite", label: "SQLite" },
          { key: "react", label: "React" },
          { key: "vite", label: "Vite" },
          { key: "tailwind", label: "Tailwind" },
          { key: "tanstack", label: "TanStack Query" },
          { key: "docker", label: "Docker" },
          { key: "pytest", label: "pytest" },
          { key: "git", label: "Git" },
          { key: "vercel", label: "Vercel · Render" },
        ] as readonly SkillChip[],
      },
    },
  },

  recognition: {
    rail: { devanagari: "मान्यता", label: "06 / Recognition" } as RailLabel,
    sport: {
      heading: "Off the keyboard",
      /** Two lines in the prototype, split with <br>. */
      titleLines: ["State Champion", "Kurash"] as readonly string[],
      body: "Delhi State School Games, U-19, −81 kg (2022–23). Zonal podiums in Judo alongside it.",
    },
    leadership: {
      heading: "Leadership",
      items: [
        "Software Lead, 7-member robotics team — Smart India Hackathon internal round.",
        "Team Leader, NAAC accreditation data analysis.",
      ] as readonly string[],
    },
    certifications: {
      heading: "Certifications",
      items: [
        { name: "IBM · Big Data, Spark & Scala", date: "JUN 26" },
        { name: "NASSCOM · Salesforce Catalyst", date: "MAY 25" },
        { name: "UNESCO MGIEP · Media Literacy", date: "APR 25" },
        { name: "IBM · Data Analysis with Python", date: "OCT 24" },
      ] as readonly { name: string; date: string }[],
    },
  },

  contact: {
    headline: "Hiring for agentic systems, retrieval, or anything that has to reason before it answers?",
    links: [
      { label: "ritularyan1723@gmail.com", href: 'mailto:ritularyan1723@gmail.com' },
      { label: "+91 78278 62135", href: 'tel:+917827862135' },
      { label: "GITHUB", href: 'https://github.com/ritul-aryan' },
      { label: "LINKEDIN", href: 'https://linkedin.com/in/ritul-aryan' },
    ] as readonly NavLink[],
  },

  footer: {
    indexHeading: "Index",
    indexLinks: [
      { label: "00 · परिचय / About", href: '#about' },
      { label: "01 · अभी / Now", href: '#now' },
      { label: "02 · कार्य / Experience", href: '#work' },
      { label: "03 · पेटेंट / Patent", href: '#patent' },
      { label: "04 · परियोजनाएँ / Projects", href: '#projects' },
      { label: "05 · कौशल / Stack", href: '#stack' },
    ] as readonly NavLink[],
    elsewhereHeading: "Elsewhere",
    elsewhereLinks: [
      { label: "Email ↗", href: 'mailto:ritularyan1723@gmail.com' },
      { label: "GitHub ↗", href: 'https://github.com/ritul-aryan' },
      { label: "LinkedIn ↗", href: 'https://linkedin.com/in/ritul-aryan' },
      { label: "+91 78278 62135", href: 'tel:+917827862135' },
    ] as readonly NavLink[],
    howHeading: "How this page works",
    /** `howBefore` + 44 + `howAfter`. */
    howBefore: "Ask it a question and it searches",
    howAfter: "facts about me — in your browser, with no server and no API key. The moving field behind the page is that same index: one point per fact, lit when it matches. Built by hand, no template.",
    statusHeading: "Status",
    statusValue: "Open to work",
    statusLines: [
      "Agentic systems · retrieval",
      "Remote or Delhi NCR",
      "Fastest route is email",
    ] as readonly string[],
    bigName: "ऋतुल आर्यन",
    copyright: "© 2026 Ritul Aryan · Delhi NCR, India · 28.61°N 77.21°E",
    backToTop: "Back to top",
    backToTopArrow: "↑",
  },

  /** The /fast page. Complete content, plain text, no retrieval engine. */
  fast: {
    note: "// FAST PATH — plain text, no canvas, no motion, no retrieval engine.",
    name: "Ritul Aryan",
    devanagari: "ऋतुल आर्यन",
    summaryLines: ["AI Software Engineer — agentic systems, multi-agent orchestration, LLM applications, full-stack.", "Delhi NCR, India · BCA in AI & Data Science, expected 2027."] as readonly string[],
    contactLinks: [
      { label: "ritularyan1723@gmail.com", href: 'mailto:ritularyan1723@gmail.com' },
      { label: "+91 78278 62135", href: 'tel:+917827862135' },
      { label: "github.com/ritul-aryan", href: 'https://github.com/ritul-aryan' },
      { label: "linkedin.com/in/ritul-aryan", href: 'https://linkedin.com/in/ritul-aryan' },
    ] as readonly NavLink[],
    contactSeparator: "·",
    experience: {
      heading: "## EXPERIENCE",
      jobs: [
        {
          title: "Akin Pte. Ltd. — Software Development Intern, AI Tools & Automation",
          meta: "| Singapore, remote | Jun 2026 – present",
          bullets: [
            "- Pitched SAGE, an agentic analytics platform, to the Board, Director and CEO; approved to architect and build end to end.",
            "- Five-agent EDA pipeline with a full, replayable audit trail.",
            "- Local Ollama inference on a dual-model router/generator architecture.",
            "- React/TypeScript + Plotly over FastAPI, Alembic, pytest, Docker Compose.",
          ],
        },
        {
          title: "Ethara AI — LLM Post-Training Intern",
          meta: "| Feb 2026 – May 2026",
          bullets: [
            "- Promoted Tasker → Quality Reviewer in month one.",
            "- RLHF evaluation; reviewed output from up to 40 contributors.",
          ],
        },
      ],
    },
    patent: {
      heading: "## PATENT",
      title: "\"An AI Powered Wheeled Omnidirectional Robot\" — Indian Patent Application 202611015954 A",
      bullets: [
        "- Filed 12 Feb 2026; published 27 Mar 2026 (Journal 13/2026). Applicant: K.R. Mangalam University.",
        "- Named inventor, 1 of 7. Software lead: sensor fusion, navigation, real-time fall detection (OpenCV/MediaPipe) with a 10-second confirmation loop before emergency escalation.",
      ] as readonly string[],
    },
    projectsHeading: "## PROJECTS",
    skills: {
      heading: "## SKILLS",
      lines: [
        "Languages: Python (advanced), TypeScript, JavaScript, SQL, C++",
        "Agentic/LLM: LangGraph, RAG, LangChain, Ollama, RLHF, HuggingFace embeddings, PyTorch",
        "Data: Pandas, NumPy, Scikit-learn, Plotly",
        "Vision: OpenCV, MediaPipe",
        "Backend: FastAPI, SQLAlchemy, Alembic, SQLite, ChromaDB",
        "Frontend: React, Vite, Tailwind, TanStack Query",
        "Ops: Docker, Git, pytest, Vercel, Render",
      ] as readonly string[],
    },
    certifications: {
      heading: "## CERTIFICATIONS",
      body: "IBM Big Data/Spark & Scala (Jun 2026) · NASSCOM Salesforce Developer Catalyst (May 2025) · UNESCO MGIEP Media Literacy (Apr 2025) · IBM Data Analysis with Python (Oct 2024)",
    },
    recognition: {
      heading: "## RECOGNITION",
      body: "Software Lead, 7-member robotics team (Smart India Hackathon internal round) · Team Leader, NAAC accreditation data analysis · State Champion, Kurash — Delhi State School Games U-19 −81 kg (2022–23), plus zonal podiums in Judo.",
    },
    footerNote: "Switch to FULL in the bar above for the interactive version.",
  },
} as const;
