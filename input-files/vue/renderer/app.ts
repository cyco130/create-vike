// @detype: replace
import { createSSRApp, defineComponent, h } from "vue";
// @detype: with
// import { createSSRApp, h } from "vue";
// @detype: end
import PageWrapper from "./PageWrapper.vue";
import { setPageContext } from "./usePageContext";
import type { PageContext } from "./types";

export { createApp };

function createApp(pageContext: PageContext) {
  const { Page, pageProps } = pageContext;
  // @detype: replace
  const PageWithLayout = defineComponent({
    // @detype: with
    // const PageWithLayout = {
    // @detype: end
    render() {
      return h(
        PageWrapper,
        {},
        {
          default() {
            return h(Page, pageProps || {});
          },
        }
      );
    },
    // @detype: replace
  });
  // @detype: with
  // };
  // @detype: end

  const app = createSSRApp(PageWithLayout);

  // Make `pageContext` available from any Vue component
  setPageContext(app, pageContext);

  return app;
}
