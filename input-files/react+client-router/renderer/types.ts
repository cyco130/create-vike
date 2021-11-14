export type PageProps = {};
// The `pageContext` that are available in both on the server-side and browser-side
export type PageContext = {
  Page: (pageProps: PageProps) => React.ReactElement;
  isHydration: boolean;
  pageProps: PageProps;
  urlPathname: string;
  documentProps?: {
    title?: string;
    description?: string;
  };
};
