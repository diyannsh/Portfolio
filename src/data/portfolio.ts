// All editable content lives here. Update freely — components read from this file.
import me from "@/assets/me.png";
import emilap from "@/assets/emilap.png";
import straySentinel from "@/assets/stray-sentinel.png";

export const portfolio = {
  name: "Diyannsh Verma",
  firstName: "DIYANNSH",
  heroWord: "PORTFOLIO",
  role: { bold: "Full Stack", italic: "Developer" },
  photo: me,
  email: "diyannsh@gmail.com",
  location: "India",
  timezone: "Asia/Kolkata",
  about:
    "I build fast, cinematic web experiences where engineering meets motion. From real-time 3D on the GPU to scalable APIs in the cloud, I obsess over the details people feel but rarely notice.",
  aboutMeta: [
    { label: "Based in", value: "India · IST" },
    { label: "Focus", value: "Full Stack · Creative Dev" },
    { label: "Status", value: "Open to work" },
  ],
  skills: [
    "React", "Next.js", "TypeScript", "Three.js", "WebGL", "GSAP", "Node.js",
    "Tailwind", "PostgreSQL", "GraphQL", "Docker", "AWS", "Python", "Redis",
    "Framer Motion", "Prisma", "Figma", "Git",
  ],
  projects: [
    {
      title: "eMilap",
      year: "2026",
      image: emilap,
      stack: ["React", "Express", "PostgreSQL", "Gemini"],
      description:
        "A campus lost and found platform that connects people who lost an item with the people who found it. Report items, review possible matches, and confirm ownership with private details before anything is returned.",
      live: "https://emilap.onrender.com/",
      github: "https://github.com/diyannsh/eMilap",
      details: {
        architecture:
          "A single-origin deployment serves the React application and Express API together. The API coordinates campus reports, encrypted claims, a background matching worker, storage, and the assistant.",
        components: [
          { title: "Web application", text: "A React 18 and Vite single-page app for reporting, browsing, claiming, and campus guidance." },
          { title: "API and identity", text: "An Express and TypeScript API handles community-scoped access, secure sessions, validation, and report workflows." },
          { title: "Data and matching", text: "PostgreSQL with Prisma stores reports and memberships; an embedded worker finds likely lost and found matches." },
          { title: "Private evidence", text: "S3-compatible storage holds report images and private evidence, while AES-256-GCM protects claim clues at rest." },
          { title: "Campus assistant", text: "Milap.ai uses Gemini when available and falls back to deterministic campus search when the model is unavailable." },
        ],
        workflow: [
          "A campus member reports a lost or found item with its category, location, and public details.",
          "The background matcher compares reports and surfaces likely matches to their owners.",
          "A claimant submits private identifying clues; the app encrypts them and keeps them out of public listings.",
          "The owner verifies the match and coordinates a return using campus desk guidance.",
        ],
        technology: [
          { category: "Frontend", items: ["React 18", "Vite 6", "TypeScript", "Tailwind CSS 3", "Three.js", "GSAP", "Lenis"] },
          { category: "API and security", items: ["Node.js 20+", "Express 4", "Zod", "Helmet", "express-session", "bcryptjs", "AES-256-GCM"] },
          { category: "Database and jobs", items: ["PostgreSQL", "Prisma ORM", "connect-pg-simple", "Embedded matching worker"] },
          { category: "Storage and AI", items: ["AWS S3 / Cloudflare R2", "AWS SDK v3", "Google Gemini API", "Deterministic retrieval fallback"] },
        ],
      },
    },
    {
      title: "Stray Sentinel",
      year: "2026",
      image: straySentinel,
      stack: ["Vite", "Express", "FastAPI", "Pinecone"],
      description:
        "An animal birth control audit platform designed to detect stray dog management fraud through AI biometric identity verification and closed-loop geospatial auditing.",
      live: "https://stray-sentinel.vercel.app/",
      github: "https://github.com/diyannsh/stray-sentinel",
      details: {
        architecture:
          "The Express API coordinates the citizen and contractor portals, cloud image storage, dog records, and a separate Python verification service. The AI service creates a biometric vector and searches Pinecone; the API then returns the matching city record and audit result.",
        components: [
          { title: "Citizen portal", text: "Lets community members submit a dog photo and review identity, vaccination, sterilization, and territory records." },
          { title: "Contractor dashboard", text: "Combines a dog’s verified record with current GPS coordinates to audit a proposed release location." },
          { title: "Verification service", text: "A Python FastAPI microservice uses OpenCV and NumPy to create a 512-dimension feature vector and query Pinecone." },
          { title: "API and records", text: "An Express API coordinates verification, Cloudinary image uploads, MongoDB Atlas records, and release-distance checks." },
        ],
        workflow: [
          "A citizen or contractor uploads or captures a dog photo; the API stores the image in Cloudinary.",
          "The FastAPI service extracts a 512-dimension feature vector and searches Pinecone for a biometric match.",
          "The API links the biometric ID to its MongoDB Atlas record, or creates a new ID when no match is found.",
          "During a release audit, browser GPS coordinates are compared with the original territory; distances over 500 meters are flagged.",
        ],
        technology: [
          { category: "Frontend", items: ["Vite", "Vanilla JavaScript", "HTML", "CSS", "Three.js"] },
          { category: "API", items: ["Node.js", "Express"] },
          { category: "AI and matching", items: ["Python", "FastAPI", "OpenCV", "NumPy", "Pinecone"] },
          { category: "Data and location", items: ["MongoDB Atlas", "Cloudinary", "Browser Geolocation API"] },
        ],
      },
    },
  ],
  experience: [
    { period: "UP NEXT", role: "Professional Experience", company: "Coming soon", text: "I’m currently focused on college and building projects. This part of my journey will grow as I begin professional work." },
    { period: "2026 — 2030", role: "B.Tech, Information Technology", company: "JNTUH University", text: "Currently pursuing my degree while building practical skills through coursework and independent projects." },
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/diyannsh" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/diyannsh/" },
    { label: "X", href: "https://x.com/Diy_ansh" },
    { label: "Instagram", href: "https://www.instagram.com/notdiyansh/" },
  ],
  nav: ["Home", "About", "Skills", "Projects", "Certificates", "Experience", "Contact"],
};
