// Editor components
export { BeqeekEditor } from './editor/index.js';

// Render components for plugins
export * from './renders/typography.js';
export * from './renders/accordion.js';
export * from './renders/table.js';

// Yoopta-compatible exports (matching large_document_code.md naming)
export {
  TypographyP,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyBlockquote,
  TypographyLink,
} from './renders/typography.js';

export {
  AccordionList,
  AccordionListItem,
  AccordionListItemContent,
  AccordionListItemHeading,
} from './renders/accordion.js';

export { TableShadcn as Table, TableRow, TableDataCell } from './renders/table.js';
