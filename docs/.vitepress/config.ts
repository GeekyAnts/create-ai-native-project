import { defineConfig } from "vitepress";

// Docs for create-ai-native-project. Deployed to GitHub Pages at
// https://geekyants.github.io/create-ai-native-project/ — hence the base path.
export default defineConfig({
  title: "create-ai-native-project",
  description:
    "Interactive CLI that scaffolds AI-native projects for Claude Code, OpenAI Codex, OpenCode, and Cline — instructions, skills, agents, runnable stacks (incl. AI-native: MCP, Vercel AI SDK, LangGraph, PydanticAI), databases, vector DBs, ORMs, storage, auth, IaC, Docker, and CI from one registry.",
  base: "/create-ai-native-project/",
  lang: "en-US",
  lastUpdated: true,
  cleanUrls: true,
  head: [
    ["meta", { name: "theme-color", content: "#646cff" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "create-ai-native-project" }],
  ],
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started", activeMatch: "/guide/" },
      { text: "Reference", link: "/reference/configuration", activeMatch: "/reference/" },
      { text: "Contributing", link: "/contributing" },
      {
        text: "npm",
        link: "https://www.npmjs.com/package/create-ai-native-project",
      },
    ],
    sidebar: {
      "/": [
        {
          text: "Guide",
          collapsed: false,
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Demos", link: "/guide/demos" },
            { text: "Usage & Commands", link: "/guide/usage" },
            { text: "Agentic Coding Tools", link: "/guide/coding-tools" },
            { text: "Project Types", link: "/guide/project-types" },
            { text: "Stacks & Add-ons", link: "/guide/stacks" },
            { text: "Extending a Project", link: "/guide/extending" },
          ],
        },
        {
          text: "Reference",
          collapsed: false,
          items: [
            { text: "Configuration", link: "/reference/configuration" },
            { text: "Project Manifest", link: "/reference/manifest" },
          ],
        },
        { text: "Contributing", link: "/contributing" },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/GeekyAnts/create-ai-native-project" },
    ],
    editLink: {
      pattern:
        "https://github.com/GeekyAnts/create-ai-native-project/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    search: { provider: "local" },
    footer: {
      message: "Released under the MIT License.",
      copyright: "© GeekyAnts Inc",
    },
  },
});
