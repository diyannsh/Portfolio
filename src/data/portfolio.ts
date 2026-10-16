// All editable content lives here. Update freely — components read from this file.
import me from "@/assets/me.jpg";
import p1 from "@/assets/project-1.jpg";
import p2 from "@/assets/project-2.jpg";
import p3 from "@/assets/project-3.jpg";
import p4 from "@/assets/project-4.jpg";

export const portfolio = {
  name: "Diyannsh Verma",
  firstName: "DIYANNSH",
  heroWord: "PORTFOLIO",
  role: { bold: "Full Stack", italic: "Developer" },
  photo: me,
  email: "hello@diyannshverma.dev",
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
      title: "Chrome Flow",
      year: "2026",
      image: p1,
      stack: ["Three.js", "GLSL", "React"],
      description:
        "An experimental WebGL playground of liquid metal shaders reacting to sound and touch in real time.",
      live: "https://example.com",
      github: "https://github.com",
    },
    {
      title: "Pulse Analytics",
      year: "2025",
      image: p2,
      stack: ["Next.js", "PostgreSQL", "tRPC"],
      description:
        "A realtime analytics dashboard handling millions of events per day with sub-second queries.",
      live: "https://example.com",
      github: "https://github.com",
    },
    {
      title: "Orbit Network",
      year: "2025",
      image: p3,
      stack: ["React", "D3", "Node.js"],
      description:
        "A global network visualizer that maps live infrastructure traffic onto an interactive 3D globe.",
      live: "https://example.com",
      github: "https://github.com",
    },
    {
      title: "Vault Wallet",
      year: "2024",
      image: p4,
      stack: ["React Native", "Express", "Redis"],
      description:
        "A minimal fintech app with instant transfers, biometric security and a buttery native feel.",
      live: "https://example.com",
      github: "https://github.com",
    },
  ],
  experience: [
    { period: "2025 — Now", role: "Full Stack Developer", company: "Freelance", text: "Shipping high-end web products and 3D experiences for startups and studios." },
    { period: "2024 — 2025", role: "Frontend Engineer", company: "Studio Nine", text: "Led interactive builds with React, GSAP and WebGL for award-winning campaigns." },
    { period: "2023 — 2024", role: "Software Intern", company: "CloudStack Labs", text: "Built internal tooling and APIs in Node.js and PostgreSQL." },
    { period: "2021 — 2025", role: "B.Tech, Computer Science", company: "University", text: "Focused on graphics, distributed systems and human–computer interaction." },
  ],
  socials: [
    { label: "GitHub", href: "https://github.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "X", href: "https://x.com" },
    { label: "Instagram", href: "https://instagram.com" },
  ],
  nav: ["Home", "About", "Skills", "Projects", "Experience", "Contact"],
};
