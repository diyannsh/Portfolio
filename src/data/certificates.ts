export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  category: string;
  description?: string;
  image?: string;
  aspectRatio?: number;
  file?: string;
  verificationUrl?: string;
  pinned?: boolean;
};

// Add real credentials here; at most two pinned items appear on the home page.
// image is the preview image; file can point to an original PDF or full-size image.
export const certificates: Certificate[] = [
  {
    id: "hackcache-2026",
    title: "Hackcache — Certificate of Participation",
    issuer: "Hackcache",
    date: "2026",
    category: "Hackathons",
    description:
      "Participated with team Rogue Sentinels, building e-Milap: Smart Campus Lost & Found Registry.",
    image: "/certificate-rogue-sentinels.svg",
    aspectRatio: 2016 / 2205,
    file: "/certificate-rogue-sentinels.svg",
    verificationUrl:
      "https://cachedinfo.in/hackathon/verify/6ad64723c979f66f2161ae56/participation/2/2476673e9ace05aa",
    pinned: true,
  },
  {
    id: "demo-creative-development",
    title: "Creative Web Development (Demo)",
    issuer: "Portfolio Demo",
    date: "2026",
    category: "Demo",
    description:
      "Sample certificate for previewing the collection layout and animation. This is not an earned credential.",
    image: "/demo-certificate-creative-development.svg",
    aspectRatio: 1.414,
  },
  {
    id: "demo-interactive-design",
    title: "Interactive Design & Motion (Demo)",
    issuer: "Portfolio Demo",
    date: "2026",
    category: "Demo",
    description:
      "Sample certificate for previewing the collection layout and animation. This is not an earned credential.",
    image: "/demo-certificate-interactive-design.svg",
    aspectRatio: 1.414,
  },
];
