/** @type {import('@inlang/paraglide-js').Config} */
export default {
  project: "./project.inlang",
  outdir: "./apps/web/src/paraglide/generated",
  strategy: ["cookie", "globalVariable", "baseLocale"],
  urlPatterns: [
    {
      pattern: ":protocol://:domain(.*)::port?/:path(.*)?",
      localized: [
        ["en", ":protocol://:domain(.*)::port?/en/:path(.*)?"],
        ["vi", ":protocol://:domain(.*)::port?/:path(.*)?"],
      ],
    },
  ],
};
