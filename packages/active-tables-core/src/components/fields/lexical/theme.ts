/**
 * Lexical Editor Theme
 * Defines CSS classes for Lexical editor elements
 */

import type { EditorThemeClasses } from 'lexical';

export const lexicalTheme: EditorThemeClasses = {
  paragraph: 'editor-paragraph mb-2',
  quote: 'editor-quote border-l-4 border-muted-foreground pl-4 italic my-4',
  heading: {
    h1: 'editor-heading-h1 text-2xl font-bold mb-4 mt-6',
    h2: 'editor-heading-h2 text-xl font-semibold mb-3 mt-5',
    h3: 'editor-heading-h3 text-lg font-semibold mb-2 mt-4',
    h4: 'editor-heading-h4 text-base font-semibold mb-2 mt-3',
    h5: 'editor-heading-h5 text-sm font-semibold mb-1 mt-2',
    h6: 'editor-heading-h6 text-xs font-semibold mb-1 mt-2',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol list-decimal list-outside ml-6 mb-2',
    olDepth: [
      'editor-list-ol1 list-decimal',
      'editor-list-ol2 list-[lower-alpha]',
      'editor-list-ol3 list-[lower-roman]',
      'editor-list-ol4 list-decimal',
      'editor-list-ol5 list-[lower-alpha]',
    ],
    ul: 'editor-list-ul list-disc list-outside ml-6 mb-2',
    listitem: 'editor-listitem mb-1',
    listitemChecked: 'editor-listitem-checked line-through opacity-60',
    listitemUnchecked: 'editor-listitem-unchecked',
    checklist: 'editor-checklist list-none ml-0',
  },
  text: {
    bold: 'editor-text-bold font-bold',
    italic: 'editor-text-italic italic',
    underline: 'editor-text-underline underline',
    strikethrough: 'editor-text-strikethrough line-through',
    code: 'editor-text-code bg-muted px-1 py-0.5 rounded text-sm font-mono',
  },
  link: 'editor-link text-primary underline hover:text-primary/80 cursor-pointer',
  code: 'editor-code bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto my-4',
  codeHighlight: {},
  image: 'editor-image inline-block my-4',
};
