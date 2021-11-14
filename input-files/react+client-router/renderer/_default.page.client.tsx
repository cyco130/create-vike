import ReactDOM from "react-dom";
import React from "react";
import { useClientRouter } from "vite-plugin-ssr/client/router";
import { PageWrapper } from "./PageWrapper";
import { PageContext } from "./types";

useClientRouter({
  async render(pageContext: PageContext) {
    if (pageContext.isHydration) {
      // When we render the first page. (Since we do SSR, the first page is already
      // rendered to HTML and we merely have to hydrate it.)
      const { Page, pageProps } = pageContext;
      ReactDOM.hydrate(
        <PageWrapper pageContext={pageContext}>
          <Page {...pageProps} />
        </PageWrapper>,
        document.getElementById("page-view")
      );
    } else {
      // When the user navigates to a new page.
      const { Page, pageProps } = pageContext;
      ReactDOM.render(
        <PageWrapper pageContext={pageContext}>
          <Page {...pageProps} />
        </PageWrapper>,
        document.getElementById("page-view")
      );
    }
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
