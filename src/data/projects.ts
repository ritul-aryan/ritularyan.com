// Curated project list (SEED). Shown after the live GitHub feed, and on its own
// when the build-time fetch yields nothing. This file is the source of truth —
// edit it directly; `npm run verify:content` checks its structure.

import type { Project } from './types';

/** Ritul's GitHub profile. */
export const GH = "https://github.com/ritul-aryan";

/** Builds a repo-search URL on the profile, as the prototype does. */
export const repo = (q: string): string =>
  GH + '?tab=repositories&q=' + encodeURIComponent(q);

export const SEED: readonly Project[] = [
  {
    name: "SAGE",
    description: "Agentic analytics platform at Akin. Five-agent EDA pipeline, replayable audit trail, local dual-model inference.",
    tags: "LangGraph · FastAPI · React/TS · Ollama",
    badge: "AKIN · PRIVATE",
    skills: "langgraph fastapi react plotly ollama docker python typescript pytest alembic",
    url: "#now",
    priv: true,
  },
  {
    name: "Universal Academic RAG Chatbot",
    description: "University-certified retrieval assistant over institutional documents, with citations.",
    tags: "LangChain · ChromaDB · FastAPI",
    badge: "CERTIFIED",
    skills: "langchain chromadb rag fastapi python embeddings",
    url: repo("rag chatbot"),
  },
  {
    name: "Multi-Agent Ecosystem",
    description: "Open-source orchestration sandbox. SAGE's predecessor and proving ground.",
    tags: "LangGraph · Python",
    badge: "OPEN SOURCE",
    skills: "langgraph python rag",
    url: repo("multi agent"),
  },
  {
    name: "Full-Stack HRMS",
    description: "Auth, employee records, payroll views and role-scoped access.",
    tags: "React · FastAPI · SQLAlchemy",
    badge: "",
    skills: "react fastapi sqlalchemy sqlite typescript alembic python vite tailwind",
    url: repo("hrms"),
  },
  {
    name: "Movie Recommender",
    description: "Collaborative and content-based recommendation over a rated-title corpus.",
    tags: "Pandas · Scikit-learn",
    badge: "",
    skills: "pandas sklearn numpy python",
    url: repo("movie"),
  },
  {
    name: "Smart Mouse",
    description: "Hand-tracked pointer control — camera in, cursor out, no extra hardware.",
    tags: "OpenCV · MediaPipe",
    badge: "",
    skills: "opencv mediapipe python numpy",
    url: repo("smart mouse"),
  },
  {
    name: "Advanced Snake Environment",
    description: "RL-ready game environment with a configurable reward surface.",
    tags: "Python · NumPy",
    badge: "",
    skills: "python numpy sklearn",
    url: repo("snake"),
  },
  {
    name: "Vardaan Foods Analysis",
    description: "Commercial data analysis and reporting for a food-manufacturing client.",
    tags: "Pandas · Plotly",
    badge: "",
    skills: "pandas plotly numpy python sql",
    url: repo("vardaan"),
  },
  {
    name: "DDoS Traffic Analysis",
    description: "Classifying malicious traffic patterns from network capture features.",
    tags: "Scikit-learn · Pandas",
    badge: "AI · CYBERSECURITY",
    skills: "sklearn pandas numpy python",
    url: repo("ddos"),
  },
];
