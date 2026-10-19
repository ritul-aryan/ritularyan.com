// Curated projects. This file is the source of truth for how each project is
// described — edit it directly; `npm run verify:content` checks its structure.
//
// HOW THE GRID IS BUILT (at build time, see src/lib/github.ts):
//   - A public repo appears only while it carries the `portfolio` topic on
//     GitHub. Add the topic to show it; remove it to hide it.
//   - If a tagged repo has an entry here, the card uses this entry's name,
//     description, tags, badge and skills, plus GitHub's language, last-push
//     date and stars. Entries appear in the order written here.
//   - Tagged repos with no entry here follow, newest first, using their GitHub
//     description and topics.
//   - Entries with no `repo` are private work. They always appear, link to an
//     in-page section, and never mention client names.
//   - If GitHub is unreachable at build time, every entry here is shown, linked
//     to its repo directly, so the grid never comes out empty.

import type { CuratedProject } from './types';

/** GitHub account the feed reads. */
export const USER = "ritul-aryan";

/** Ritul's GitHub profile. */
export const GH = "https://github.com/" + USER;

export const CURATED: readonly CuratedProject[] = [
  {
    repo: "NanoGLM-Flash",
    name: "NanoGLM-Flash",
    description: "A 72M-parameter multimodal language model built and trained from scratch, with a Zero-Critic GRPO post-training pipeline, benchmarked on NVIDIA Blackwell.",
    tags: "PyTorch · GRPO · Multimodal",
    badge: "MODEL TRAINING",
    skills: "pytorch python",
  },
  {
    repo: "ddos-traffic-analysis",
    name: "DDoS Traffic Analysis",
    description: "Real-time ML intrusion detection: classifies malicious traffic from network-capture features and surfaces it in a live security-operations dashboard.",
    tags: "Scikit-learn · Pandas · SOC dashboard",
    badge: "AI · CYBERSECURITY",
    skills: "sklearn pandas numpy python",
  },
  {
    repo: "fall-detection-module",
    name: "Fall Detection Module",
    description: "The patent robot's fall-detection subsystem: pose landmarks, a sudden height drop with a sub-45° torso angle, and a 10-second confirmation loop before any alert.",
    tags: "OpenCV · MediaPipe · Python",
    badge: "FROM THE PATENT",
    skills: "opencv mediapipe python numpy",
  },
  {
    name: "SAGE",
    description: "Agentic analytics platform I pitched to Akin's Board and CEO and built to a working prototype — a multi-agent EDA pipeline with every transformation logged to a replayable audit trail. Paused for higher-priority work.",
    tags: "LangGraph · FastAPI · React/TS",
    badge: "AKIN · PRIVATE",
    skills: "langgraph fastapi react plotly ollama docker python typescript pytest alembic",
    anchor: "#now",
  },
  {
    repo: "MAE-Data-Analytics-Killer",
    name: "Multi-Agent Ecosystem",
    description: "Open-source multi-agent pipeline that automates data cleaning and visualisation — SAGE's predecessor and proving ground.",
    tags: "LangGraph · FastAPI · React",
    badge: "OPEN SOURCE",
    skills: "langgraph fastapi react python",
  },
  {
    repo: "University-Chatbot",
    name: "Academic RAG Chatbot",
    description: "University-certified retrieval assistant over institutional documents, answering campus questions with citations.",
    tags: "LangChain · ChromaDB · FastAPI",
    badge: "CERTIFIED",
    skills: "langchain chromadb rag fastapi python embeddings typescript",
  },
  {
    repo: "hrms-ethara-assessment",
    name: "Full-Stack HRMS",
    description: "Auth, employee records, payroll views and role-scoped access.",
    tags: "React · FastAPI · SQLAlchemy",
    badge: "",
    skills: "react fastapi sqlalchemy sqlite typescript alembic python vite tailwind",
  },
  {
    repo: "Smart-Mouse",
    name: "Smart Mouse",
    description: "Hand-tracked pointer control — camera in, cursor out, no extra hardware.",
    tags: "OpenCV · MediaPipe",
    badge: "",
    skills: "opencv mediapipe python numpy",
  },
  {
    repo: "movie-recommender-system",
    name: "Movie Recommender",
    description: "Collaborative and content-based recommendation over a rated-title corpus.",
    tags: "Pandas · Scikit-learn",
    badge: "",
    skills: "pandas sklearn numpy python",
  },
  {
    repo: "Advanced-Snake-Environment",
    name: "Advanced Snake Environment",
    description: "Object-oriented Snake game built on a finite-state machine.",
    tags: "Python · NumPy",
    badge: "",
    skills: "python numpy",
  },
];
