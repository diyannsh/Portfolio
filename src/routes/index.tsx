import { createFileRoute } from "@tanstack/react-router";
import { Portfolio } from "@/components/Portfolio";

export const Route = createFileRoute("/")({
  ssr: false, // WebGL canvas + Lenis are browser-only
  head: () => ({
    meta: [
      { title: "Diyannsh Verma — Full Stack Developer Portfolio" },
      { name: "description", content: "Cinematic portfolio of Diyannsh Verma, a full stack developer crafting fast, immersive 3D web experiences." },
      { property: "og:title", content: "Diyannsh Verma — Full Stack Developer" },
      { property: "og:description", content: "Immersive WebGL portfolio: projects, skills and experience of Diyannsh Verma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});
