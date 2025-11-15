import Paragraph from '@yoopta/paragraph';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import Blockquote from '@yoopta/blockquote';
import Link from '@yoopta/link';

import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyP,
  TypographyBlockquote,
  TypographyLink,
} from '../components/renders/typography.js';

/**
 * Typography plugins with shadcn/ui render components
 * Includes: Paragraph, H1, H2, H3, Blockquote, Link
 */
export function getTypographyPlugins() {
  return [
    Paragraph.extend({
      renders: {
        paragraph: TypographyP,
      },
    }),
    HeadingOne.extend({
      renders: {
        'heading-one': TypographyH1,
      },
    }),
    HeadingTwo.extend({
      renders: {
        'heading-two': TypographyH2,
      },
    }),
    HeadingThree.extend({
      renders: {
        'heading-three': TypographyH3,
      },
    }),
    Blockquote.extend({
      renders: {
        blockquote: TypographyBlockquote,
      },
    }),
    Link.extend({
      renders: {
        link: TypographyLink,
      },
    }),
  ];
}
