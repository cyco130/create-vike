import { useClientRouter } from "vite-plugin-ssr/client/router";
import { createApp } from "./app";
import { PageContext } from "./types";

useClientRouter({
  async render(pageContext: PageContext) {
    const app = createApp(pageContext);
    app.mount("#app");
  },

  ensureHydration: true,

  prefetchLinks: true,

  onTransitionStart() {
    // Page transition started
  },

  onTransitionEnd() {
    // Page transition ended
  },
}).hydrationPromise.then(() => {
  // Hydration finished; page is now interactive
});
