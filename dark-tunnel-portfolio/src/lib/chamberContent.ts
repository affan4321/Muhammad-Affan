export type ChamberContentType = "cv" | "who-am-i" | "social" | "about-me" | "portfolio";

export interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
  image?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface ChamberContent {
  type: ChamberContentType;
  title: string;
  // For CV and About Me: PDF path
  pdfUrl?: string;
  // For Who Am I: Text content
  summary?: string;
  ambitions?: string;
  // For Social: 3D revolving models data
  socialLinks?: SocialLink[];
  // For Portfolio: Project carousel
  projects?: Project[];
}

export const CHAMBER_CONTENT: Record<string, ChamberContent> = {
  "resume-cv": {
    type: "cv",
    title: "Resume / CV",
    pdfUrl: "/pdfs/resume.pdf",
  },
  "who-am-i": {
    type: "who-am-i",
    title: "Who Am I",
    summary: "A passionate developer with expertise in 3D graphics, game development, and creative technologies.",
    ambitions: "Building immersive experiences that push the boundaries of web-based 3D applications and creating tools that empower creators.",
  },
  "about-me": {
    type: "about-me",
    title: "About Me",
    pdfUrl: "/pdfs/about-me.pdf",
  },
  "social-handles": {
    type: "social",
    title: "Social Handles",
    socialLinks: [
      { platform: "GitHub", url: "https://github.com/username" },
      { platform: "LinkedIn", url: "https://linkedin.com/in/username" },
      { platform: "Twitter", url: "https://twitter.com/username" },
    ],
  },
  "jewelry-cad": {
    type: "portfolio",
    title: "Jewelry CAD World",
    projects: [
      {
        id: "jewelry-1",
        title: "3D Jewelry Designer",
        description: "Web-based 3D jewelry design tool",
        link: "https://example.com/jewelry-1",
      },
      {
        id: "jewelry-2",
        title: "CAD Renderer",
        description: "Real-time rendering for jewelry models",
        link: "https://example.com/jewelry-2",
      },
    ],
  },
  "video-editing": {
    type: "portfolio",
    title: "Video Editing World",
    projects: [
      {
        id: "video-1",
        title: "Video Editor Pro",
        description: "Professional video editing suite",
        link: "https://example.com/video-1",
      },
      {
        id: "video-2",
        title: "Motion Graphics",
        description: "Animated motion graphics templates",
        link: "https://example.com/video-2",
      },
    ],
  },
  "game-dev": {
    type: "portfolio",
    title: "Game Dev World",
    projects: [
      {
        id: "game-1",
        title: "Dark Tunnel",
        description: "Immersive 3D portfolio experience",
        link: "https://example.com/game-1",
      },
      {
        id: "game-2",
        title: "RPG Engine",
        description: "Custom game engine for RPGs",
        link: "https://example.com/game-2",
      },
    ],
  },
  "ai-journey": {
    type: "portfolio",
    title: "AI Journey",
    projects: [
      {
        id: "ai-1",
        title: "AI Assistant",
        description: "Intelligent chatbot with NLP",
        link: "https://example.com/ai-1",
      },
      {
        id: "ai-2",
        title: "ML Models",
        description: "Machine learning model library",
        link: "https://example.com/ai-2",
      },
    ],
  },
};
