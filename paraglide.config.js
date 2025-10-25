/** @type {import('@inlang/paraglide-js').Config} */
export default {
  project: {
    sourceLanguageTag: 'vi',
    languageTags: ['vi', 'en'],
    path: './src/paraglide',
  },
  outdir: './src/paraglide/generated',
  strategy: {
    read: ['filesystem'],
    write: ['filesystem'],
  },
};
