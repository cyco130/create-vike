import {
  createApp as createVueApp,
  createSSRApp,
  defineComponent,
  h,
} from "vue";
import PageWrapper from "./PageWrapper.vue";
import { setPageContext } from "./usePageContext";
import type { PageContext } from "./types";

export { createApp };

function createApp(pageContext: PageContext) {
  const { Page, pageProps } = pageContext;
  const PageWithLayout = defineComponent({
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
  });

  const app = pageContext.isHydration
    ? createSSRApp(PageWithLayout)
    : createVueApp(PageWithLayout);

  // Make `pageContext` available from any Vue component
  setPageContext(app, pageContext);

  return app;
}
