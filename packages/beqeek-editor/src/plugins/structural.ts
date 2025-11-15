import Accordion from '@yoopta/accordion';
import Table from '@yoopta/table';
import Divider from '@yoopta/divider';
import Callout from '@yoopta/callout';

import {
  AccordionList,
  AccordionListItem,
  AccordionListItemContent,
  AccordionListItemHeading,
} from '../components/renders/accordion.js';

import { TableShadcn, TableRow, TableDataCell } from '../components/renders/table.js';

/**
 * Structural plugins with shadcn/ui renders
 * Includes: Accordion, Table, Divider, Callout
 */
export function getStructuralPlugins() {
  return [
    Accordion.extend({
      renders: {
        'accordion-list': AccordionList,
        'accordion-list-item': AccordionListItem,
        'accordion-list-item-content': AccordionListItemContent,
        'accordion-list-item-heading': AccordionListItemHeading,
      },
    }),
    Table.extend({
      renders: {
        table: TableShadcn,
        'table-row': TableRow,
        'table-data-cell': TableDataCell,
      },
    }),
    Divider.extend({
      elementProps: {
        divider: (props: Record<string, unknown>) => ({
          ...props,
          color: 'hsl(var(--border))',
        }),
      },
    }),
    Callout,
  ];
}
