// The retrieval index: the facts the hero search scores and the canvas draws,
// one point per fact. This file is the source of truth — edit it directly.
// `npm run verify:content` checks its structure (known sections, every section
// covered, unique titles, no empty fields).

import type { Fact } from './types';

export const FACTS: readonly Fact[] = [
  {
    section: "now",
    title: "SAGE — what it is",
    text: "SAGE is an agentic analytics platform I'm building at Akin Pte. Ltd. Five specialised agents run the exploratory-data-analysis pipeline, every step writes to a replayable audit trail, and inference stays local on a dual-model router/generator split.",
    keywords: "sage analytics platform agentic akin current building product eda pipeline",
  },
  {
    section: "now",
    title: "SAGE — how it got approved",
    text: "I pitched SAGE to the Board, the Director and the CEO of Akin. It was approved and I was given the architecture end to end — my design, my calls, my responsibility.",
    keywords: "pitch board director ceo approved presentation stakeholders ownership leadership",
  },
  {
    section: "now",
    title: "SAGE — the stack",
    text: "SAGE runs React and TypeScript with Plotly on the front, FastAPI with Alembic migrations behind it, pytest for the suite, and Docker Compose to hold the whole thing together.",
    keywords: "sage stack react typescript plotly fastapi alembic pytest docker compose technology",
  },
  {
    section: "now",
    title: "Local inference",
    text: "SAGE keeps inference local through Ollama on a dual-model architecture — a small router model decides what kind of question it is, a larger generator answers. Client data never leaves the machine.",
    keywords: "local inference ollama privacy router generator dual model on-premise offline security",
  },
  {
    section: "now",
    title: "Audit trail",
    text: "Every agent step in SAGE writes to a full audit trail, so any answer can be replayed back to the data that produced it. That's the part people in the room actually cared about.",
    keywords: "audit trail traceability replay explainability compliance governance provenance",
  },
  {
    section: "now",
    title: "Agent architecture",
    text: "The five SAGE agents split the work: profiling, cleaning, analysis, visualisation and narrative. They pass structured state, not prose, which is the only way the audit trail stays useful.",
    keywords: "agents architecture five multi agent design orchestration state handoff workflow langgraph",
  },
  {
    section: "work",
    title: "Current role",
    text: "I'm a Software Development Intern in AI Tools & Automation at Akin Pte. Ltd., Singapore, working remotely from Delhi NCR. Started June 2026, still there.",
    keywords: "current job role employed akin intern singapore remote where working now company",
  },
  {
    section: "work",
    title: "Ethara AI",
    text: "At Ethara AI I was an LLM Post-Training Intern from February to May 2026. I was promoted from Tasker to Quality Reviewer inside the first month.",
    keywords: "ethara post training rlhf previous job promotion promoted quality reviewer tasker",
  },
  {
    section: "work",
    title: "RLHF experience",
    text: "I did RLHF evaluation at Ethara AI and, as a Quality Reviewer, assessed output from up to 40 contributors — which is mostly a lesson in how inconsistent human preference data really is.",
    keywords: "rlhf reinforcement human feedback evaluation reviewing contributors annotation quality data labelling",
  },
  {
    section: "work",
    title: "Years of experience",
    text: "Two AI internships across 2026 — Ethara AI (Feb–May) and Akin Pte. Ltd. (Jun–present) — alongside a BCA in AI & Data Science. Short on years, long on shipped systems.",
    keywords: "experience years how long senior junior level seniority background career",
  },
  {
    section: "work",
    title: "Remote work",
    text: "Akin is in Singapore; I'm in Delhi NCR. Fully remote since June 2026, across a 2.5-hour offset, and it works because everything I build gets written down.",
    keywords: "remote work distributed timezone singapore async communication collaboration wfh",
  },
  {
    section: "patent",
    title: "The patent",
    text: "I'm a named inventor on Indian Patent Application 202611015954 A, \"An AI Powered Wheeled Omnidirectional Robot\", filed 12 February 2026 and published 27 March 2026 in Journal 13/2026. Applicant: K.R. Mangalam University.",
    keywords: "patent invention filed published application number journal ip intellectual property inventor robot",
  },
  {
    section: "patent",
    title: "My role on the patent",
    text: "One of seven named inventors, and the software lead: sensor fusion, autonomous navigation, and the real-time fall-detection subsystem.",
    keywords: "patent role contribution software lead inventors team seven what did you do",
  },
  {
    section: "patent",
    title: "Fall detection",
    text: "The robot's fall-detection subsystem runs on OpenCV and MediaPipe with a ten-second confirmation loop before it escalates to an emergency alert — because a false alarm at 3am costs more trust than it saves.",
    keywords: "fall detection opencv mediapipe computer vision realtime emergency alert elderly safety healthcare",
  },
  {
    section: "projects",
    title: "Academic RAG chatbot",
    text: "A university-certified Universal Academic RAG Chatbot built on LangChain and ChromaDB — retrieval over institutional documents, with citations, so students stop getting confidently wrong answers.",
    keywords: "rag chatbot retrieval langchain chromadb university academic certified vector database documents",
  },
  {
    section: "projects",
    title: "Multi-Agent Ecosystem",
    text: "An open-source multi-agent orchestration sandbox — SAGE's predecessor, and where I worked out how agents should hand work to each other before there was anything at stake.",
    keywords: "multi agent ecosystem open source orchestration github sandbox predecessor coordination",
  },
  {
    section: "projects",
    title: "Full-Stack HRMS",
    text: "A full-stack HR management system: authentication, employee records, payroll views and role-scoped access — the unglamorous CRUD work that teaches you data modelling.",
    keywords: "hrms hr human resources full stack crud auth roles web app database",
  },
  {
    section: "projects",
    title: "Smart Mouse",
    text: "Smart Mouse turns a webcam into a pointer — hand tracking through OpenCV and MediaPipe, no extra hardware.",
    keywords: "smart mouse hand tracking gesture webcam opencv mediapipe accessibility computer vision",
  },
  {
    section: "projects",
    title: "Other projects",
    text: "Also: a movie recommender, an RL-ready Advanced Snake environment, a commercial data analysis for Vardaan Foods, and DDoS traffic classification (in progress).",
    keywords: "movie recommender snake reinforcement learning vardaan foods ddos network traffic security side projects",
  },
  {
    section: "projects",
    title: "How this list stays current",
    text: "The project grid reads my GitHub live and shows only repos tagged `portfolio`. I curate it by adding or removing a tag on GitHub — the page never gets edited.",
    keywords: "github api live auto update topic tag curated dynamic feed repos refresh",
  },
  {
    section: "projects",
    title: "Open source",
    text: "The Multi-Agent Ecosystem is public on GitHub, and anything tagged `portfolio` on my profile is fair game to read.",
    keywords: "open source public github code repository contribute read review",
  },
  {
    section: "stack",
    title: "Python",
    text: "Python is my strongest language — advanced, and the one everything else gets prototyped in first.",
    keywords: "python language strongest primary programming best skill proficiency",
  },
  {
    section: "stack",
    title: "Languages",
    text: "Python (advanced), TypeScript, JavaScript, SQL and C++.",
    keywords: "languages programming typescript javascript sql cpp c++ coding",
  },
  {
    section: "stack",
    title: "Agentic tooling",
    text: "LangGraph, LangChain, RAG pipelines, Ollama, RLHF and HuggingFace embeddings — the agentic and LLM layer is where I spend most of my time.",
    keywords: "langgraph langchain rag ollama rlhf huggingface embeddings llm agent framework tooling ai",
  },
  {
    section: "stack",
    title: "Backend",
    text: "FastAPI, SQLAlchemy, Alembic, SQLite and ChromaDB. I like a backend I can migrate without fear.",
    keywords: "backend fastapi sqlalchemy alembic sqlite chromadb api server database migrations",
  },
  {
    section: "stack",
    title: "Frontend",
    text: "React, Vite, Tailwind and TanStack Query — enough front-end to ship the whole product myself rather than hand off a JSON endpoint and hope.",
    keywords: "frontend react vite tailwind tanstack query ui web fullstack",
  },
  {
    section: "stack",
    title: "Ops and testing",
    text: "Docker, Git, pytest, Vercel and Render. Tests are not optional on anything with an agent in it.",
    keywords: "devops docker git pytest vercel render deployment testing ci hosting",
  },
  {
    section: "stack",
    title: "Data science",
    text: "Pandas, NumPy, Scikit-learn and Plotly — the everyday tools of the BCA in AI & Data Science, and of SAGE's analysis layer.",
    keywords: "data science pandas numpy scikit sklearn plotly analysis machine learning visualisation statistics",
  },
  {
    section: "stack",
    title: "Computer vision",
    text: "OpenCV and MediaPipe, used in anger on both the patented robot and Smart Mouse.",
    keywords: "computer vision opencv mediapipe image video tracking detection",
  },
  {
    section: "about",
    title: "Who I am",
    text: "I'm an AI software engineer in Delhi NCR, India. I build systems where a single model isn't enough — several of them checking each other, a retrieval layer that doesn't hallucinate, and an audit trail you can defend in a room full of people who didn't write the code.",
    keywords: "who are you about yourself introduce bio personality person ritul aryan",
  },
  {
    section: "about",
    title: "Name",
    text: "Ritul Aryan — ऋतुल आर्यन in Devanagari.",
    keywords: "name called devanagari hindi spelling pronunciation ritul aryan",
  },
  {
    section: "about",
    title: "Location",
    text: "Delhi NCR, India — 28.61°N 77.21°E. I work remotely for a Singapore company and I'm open to more of that.",
    keywords: "location where live based city country india delhi ncr timezone remote relocate",
  },
  {
    section: "about",
    title: "Education",
    text: "BCA in Artificial Intelligence & Data Science at K.R. Mangalam University, expected 2027.",
    keywords: "education degree study university college bca graduation student academic qualification",
  },
  {
    section: "about",
    title: "How I work",
    text: "I over-prepare, I write tests, and I'd rather ship something small that holds than something large that doesn't. Most of what I know I learned by building the thing badly first.",
    keywords: "how work style philosophy approach process values working method habits",
  },
  {
    section: "about",
    title: "What I want next",
    text: "I'm looking for teams working on agentic systems, retrieval infrastructure or LLM tooling — people who'd rather argue about architecture than agree about nothing.",
    keywords: "looking for want next role hiring opportunity job seeking interested goals future career",
  },
  {
    section: "about",
    title: "Why hire me",
    text: "I've taken a system from a pitch in front of a CEO to a running architecture, I hold a patent as software lead, and I ship the front end and the back end myself. I'm early in my career and that's exactly why I'll outwork the brief.",
    keywords: "why hire good fit strengths value reason choose recommend best candidate sell",
  },
  {
    section: "about",
    title: "Weaknesses",
    text: "Two internships is not ten years. I'm short on scale — I haven't run anything at millions of users. I'm long on ownership: everything on this page, I built or led.",
    keywords: "weakness gaps missing lacking cons downside honest limitations junior inexperience",
  },
  {
    section: "about",
    title: "This website",
    text: "This page is a retrieval system, not a chatbot. The index is hand-written facts about me, scored in your browser with no server and no API key. The background is that index — each point is a fact, and they light up when they match.",
    keywords: "website site built how made this page tech portfolio design retrieval search index background canvas",
  },
  {
    section: "about",
    title: "Languages spoken",
    text: "Hindi and English. The Devanagari on this page is my actual name, not decoration.",
    keywords: "language spoken hindi english devanagari speak communication",
  },
  {
    section: "recognition",
    title: "Kurash state champion",
    text: "Delhi State School Games champion in Kurash, U-19, −81 kg (2022–23), with zonal podiums in Judo. Sport is where I learned that you don't rise to the occasion, you fall to the level of your preparation.",
    keywords: "kurash judo sport champion state medal athlete martial arts wrestling hobby fitness discipline",
  },
  {
    section: "recognition",
    title: "Team leadership",
    text: "Software Lead on a seven-member robotics team for the Smart India Hackathon internal round, and Team Leader for the NAAC accreditation data analysis.",
    keywords: "leadership lead team manage hackathon smart india naac accreditation collaboration",
  },
  {
    section: "recognition",
    title: "Certifications",
    text: "IBM Big Data with Spark & Scala (Jun 2026), NASSCOM Salesforce Developer Catalyst (May 2025), UNESCO MGIEP Media Literacy (Apr 2025), IBM Data Analysis with Python (Oct 2024).",
    keywords: "certifications certificate ibm nasscom unesco courses training credentials spark scala salesforce",
  },
  {
    section: "contact",
    title: "Contact",
    text: "Email ritularyan1723@gmail.com, phone +91 78278 62135, or github.com/ritul-aryan and linkedin.com/in/ritul-aryan.",
    keywords: "contact email phone reach hire message get in touch linkedin github number",
  },
  {
    section: "contact",
    title: "Availability",
    text: "Open to full-time and internship conversations, remote or Delhi NCR. Fastest route is email.",
    keywords: "available availability hire hiring open freelance fulltime internship start notice",
  },
];

/** Rendered in the hero prompt and the footer. */
export const FACT_COUNT = FACTS.length;
