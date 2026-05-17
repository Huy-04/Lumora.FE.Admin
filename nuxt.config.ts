export default defineNuxtConfig({
  routeRules: {
    "/hubs/**": {
      proxy: `${process.env.NUXT_API_PROXY_TARGET || "https://api.hlbeer.me"}/hubs/**`,
    },
  },
  devtools: {
    enabled: false,
  },
  components: [
    {
      path: "~/Shared/components",
      pathPrefix: false,
    },
    {
      path: "~/features",
      pathPrefix: false,
      pattern: "**/components/**/*.vue",
    },
  ],
  imports: {
    dirs: [
      "features/**/composables",
      "Shared/api",
      "Shared/composables",
      "Shared/composables/**",
    ],
  },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxtjs/tailwindcss"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  experimental: {
    appManifest: false,
  },
  app: {
    head: {
      title: "Lumora Admin",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Lumora admin interface for authentication, identity, and access management.",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon.svg",
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700;800&display=swap",
        },
      ],
    },
  },
  typescript: {
    typeCheck: true,
  },
  runtimeConfig: {
    apiProxyTarget: process.env.NUXT_API_PROXY_TARGET || "https://api.hlbeer.me",
    public: {
      appName: "Lumora Admin",
      realtimeBaseUrl: process.env.NUXT_PUBLIC_REALTIME_BASE_URL || "",
    },
  },
});
