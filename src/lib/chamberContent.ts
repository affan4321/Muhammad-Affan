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
    pdfUrl: "/Muhammad_Affan.pdf",
  },
  "who-am-i": {
    type: "who-am-i",
    title: "Who Am I",
    summary: "I'm a curious AI engineer and Full Stack developer who loves turning messy problems into clean, working systems. With hands-on experience building production AI systems, agent-based platforms, and automation pipelines, I enjoy experimenting with LLMs, RAG systems, computer vision, and AI-driven video generation.",
    ambitions: "Whether it's late-night debugging, creative brainstorming, or integrating modern AI tools into scalable cloud solutions, I bring logic, curiosity, and a bit of stubbornness to every challenge — always learning, always building, and occasionally over-engineering just for fun.",
  },
  "about-me": {
    type: "about-me",
    title: "About Me",
    // pdfUrl: "/pdfs/about-me.pdf",
    summary: "I'm Muhammad Affan, an AI engineer and Full Stack developer based in Lahore, Pakistan, with an insatiable curiosity and a passion for turning complex, messy problems into clean, elegant, and functional systems. From an early stage in my career, I realized that technology is not just about code—it's about solving real-world problems with creativity, precision, and innovation. While my Bachelor of Science in Computer Science at FAST National University of Computer and Emerging Sciences, Islamabad, I have honed a diverse skill set spanning JavaScript, Python, C/C++, Dart, and more. I'm well-versed in frameworks such as React.js, Angular, Next.js, and Flutter. Beyond coding, I have developed expertise in deploying scalable cloud solutions using AWS, Docker, and automation tools like n8n.My professional journey began with a full-stack internship at Moqah.pk, where I focused on front-end development, building smooth authentication flows and user-friendly pages such as multi-directional carousels and policy pages. Fixing backend bugs and improving user experience there gave me a hands-on understanding of the value of detail in software development. Later, at VECTOR Inc., I spearheaded the development of cutting-edge AI-powered products in the fashion space. I built VFit, a Virtual Try-On solution, and a Height Estimation app utilizing computer vision to recommend clothing sizes- both integrated into an AI-driven eCommerce platform named Splendor. I also developed VECTOR's official website, focusing on performance and branding, showcasing my versatility from AI to web design. Currently, I'm an AI Engineer at GSpec Technologies, Soft Techniques, where I architect and deploy innovative AI solutions tailored to client needs. One of my proudest achievements is building Alive5, an AI-powered voice agent platform capable of handling real-time voice interactions with over 291 unique voices. This platform integrates intelligent conversation flows, telephony systems, live chat, and CRM tools, all deployed on scalable AWS infrastructure. I've also designed AI automation and video generation pipelines, orchestrating multiple AI models and services for seamless content creation. Exploring diffusion workflows and GPU limitations with ComfyUI has deepened my understanding of the cutting-edge in AI video synthesis.Among my notable projects is the Stories We Tell platform, a full-stack AI-powered story development tool that supports multi-user sessions, real-time streaming chat, and intelligent narrative extraction. Additionally, I contributed to the DisasterShield platform, a digital disaster recovery system connecting homeowners, contractors, and insurers with smart contractor matching and secure insurance claim processing.To keep pushing my boundaries, I earned a certification in Ethical Hacking focused on web application penetration testing, equipping me with security insights that complement my AI and development expertise. Every step of my career is fueled by a drive to learn, build, and innovate. I embrace challenges with logic, curiosity, and a touch of stubbornness, always seeking to create meaningful solutions that blend the power of AI with user-centric design. This is my journey so far- a blend of education, technology, and passion, continuously evolving as I explore the future of AI and software development.",
  },
  "social-handles": {
    type: "social",
    title: "Social Handles",
    socialLinks: [
      { platform: "GitHub", url: "https://github.com/affan4321", icon:"github.png" },
      { platform: "LinkedIn", url: "https://www.linkedin.com/in/sheikhmuhammadaffan", icon:"linkedIn.png" },
      { platform: "Instagram", url: "https://www.instagram.com/smaffan92", icon:"instagram.png" },
      { platform: "Facebook", url: "https://www.facebook.com/smaffan92", icon:"facebook.png" },
      { platform: "Portfolio", url: "https://smaffan.com", icon:"latestFace.svg" },
    ],
  },
  "jewelry-cad": {
    type: "portfolio",
    title: "Jewelry CAD World",
    projects: [
      {
        id: "COMING SOON",
        title: "3D Jewelry Designer",
        description: "Coming soon...",
        link: "#",
      }
    ],
  },
  "video-editing": {
    type: "portfolio",
    title: "Video Editing World",
    projects: [
      {
        id: "COMING SOON",
        title: "Video Editor",
        description: "Coming soon...",
        link: "#",
      }
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
        link: "#",
      }
    ],
  },
  "ai-journey": {
    type: "portfolio",
    title: "AI Journey",
    projects: [
      {
        id: "ai-1",
        title: "Voice Agent Platform (Alive5)",
        description: "Architected and deployed an AI-powered voice agent system with intelligent conversation flows, intent detection, and FAQ integration using LiveKit, OpenAI GPT-4o, and FastAPI, handling real-time voice interactions with 291+ available voices. Designed scalable agent workflows and initiated deployment on AWS AgentCore along with AWS server, to support modern, distributed, and scalable agent-based applications. Implemented telephony integrations (Telnyx) including SIP trunking, webhooks, and call transfer for production-grade voice handling. Built LiveChat and CRM integrations with Socket.io, enabling real-time messaging, automatic thread creation, and structured customer data capture.",
        link: "https://voice-agent-livekit.vercel.app/",
      },
      {
        id: "ai-2",
        title: "AI Automation & Video Generation Pipelines (n8n)",
        description: "Designed and implemented end-to-end AI automation workflows using n8n, integrating external AI services and custom backends. Built automated AI video generation pipelines using Kie.ai's models like Google Veo, OpenAI Sora, and many more via API-driven orchestration. ComfyUI-based video generation, including paid hosted models and experimental local pipelines. Explored local ComfyUI training and pipeline setup, gaining hands-on understanding of diffusion workflows, model constraints, and GPU limitations; strategically deprioritized local training to meet strict client deadlines.",
        link: "#",
      },
      {
        id: "ai-3",
        title: "Stories We Tell Platform",
        description: "Built a full-stack AI-powered story development platform enabling conversational narrative creation. Developed intelligent extraction of structured story elements from conversations. Implemented multi-user sessions with authentication, persistence, and cross-device continuity. Delivered a real-time streaming chat experience with scalable backend APIs.",
        link: "https://stories-we-tell.vercel.app/",
      },
      {
        id: "ai-4",
        title: "DisasterShield Platform",
        description: "Built a digital disaster recovery platform connecting homeowners with contractors and insurers. Implemented intelligent contractor matching based on location, expertise, and availability. Integrated secure payments, insurance claim (FNOL) processing, and document generation. Developed real-time notifications, role-based access control, and a mobile-first user experience.",
        link: "https://disaster-shield.vercel.app/",
      },
    ],
  },
};
