```tsx
import YooptaEditor, { createYooptaEditor, Elements, Blocks, useYooptaEditor } from '@yoopta/editor';

import Paragraph from '@yoopta/paragraph';
import Blockquote from '@yoopta/blockquote';
import Embed from '@yoopta/embed';
import Image from '@yoopta/image';
import Link from '@yoopta/link';
import Callout from '@yoopta/callout';
import Video from '@yoopta/video';
import File from '@yoopta/file';
import Accordion from '@yoopta/accordion';
import { NumberedList, BulletedList, TodoList } from '@yoopta/lists';
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';
import { HeadingOne, HeadingThree, HeadingTwo } from '@yoopta/headings';
import Code from '@yoopta/code';
import Table, { TableCommands } from '@yoopta/table';
import Divider from '@yoopta/divider';
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';

import { uploadToCloudinary } from '@/utils/cloudinary';
import { useEffect, useMemo, useRef } from 'react';
import { initValue } from './initValue';
import { TypographyP } from '@/components/libraries/shadcn/TypographyP';
import { TypographyH1 } from '@/components/libraries/shadcn/TypographyH1';
import { TypographyH2 } from '@/components/libraries/shadcn/TypographyH2';
import { TypographyH3 } from '@/components/libraries/shadcn/TypographyH3';
import { TypographyBlockquote } from '@/components/libraries/shadcn/TypographyBlockquote';
import { TypographyLink } from '@/components/libraries/shadcn/TypographyLink';

import {
  AccordionList,
  AccordionListItem,
  AccordionListItemContent,
  AccordionListItemHeading,
} from '@/components/libraries/shadcn/Accordion';
import { TableRow, Table as TableShadcn, TableDataCell } from '@/components/libraries/shadcn/Table';

const getPlugins = () => [
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
  ,
  HeadingThree.extend({
    renders: {
      'heading-three': TypographyH3,
    },
  }),
  ,
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
  NumberedList,
  BulletedList,
  TodoList,
  Divider.extend({
    elementProps: {
      divider: (props) => ({
        ...props,
        color: 'hsl(240 3.7% 15.9%)',
      }),
    },
  }),
  Callout,
  Code,
  Embed,
  Image.extend({
    options: {
      async onUpload(file) {
        const data = await uploadToCloudinary(file, 'image');

        return {
          src: data.secure_url,
          alt: 'cloudinary',
          sizes: {
            width: data.width,
            height: data.height,
          },
        };
      },
    },
  }),
  Video.extend({
    options: {
      onUpload: async (file) => {
        const data = await uploadToCloudinary(file, 'video');
        return {
          src: data.secure_url,
          alt: 'cloudinary',
          sizes: {
            width: data.width,
            height: data.height,
          },
        };
      },
      onUploadPoster: async (file) => {
        const image = await uploadToCloudinary(file, 'image');
        return image.secure_url;
      },
    },
  }),
  File.extend({
    options: {
      onUpload: async (file) => {
        const response = await uploadToCloudinary(file, 'auto');
        return {
          src: response.secure_url,
          format: response.format,
          name: response.name,
          size: response.bytes,
        };
      },
    },
  }),
];

const TOOLS = {
  ActionMenu: {
    render: DefaultActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
  LinkTool: {
    render: DefaultLinkToolRender,
    tool: LinkTool,
  },
};

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

function WithShadcnUILibrary() {
  const editor = useMemo(() => createYooptaEditor(), []);
  const selectionRef = useRef(null);

  const plugins = useMemo(() => getPlugins(), []);

  return (
    <div
      className="md:py-[100px] md:pl-[200px] md:pr-[80px] px-[20px] pt-[80px] pb-[40px] flex justify-center"
      ref={selectionRef}
    >
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        tools={TOOLS}
        marks={MARKS}
        selectionBoxRoot={selectionRef}
        value={initValue}
        autoFocus
      />
    </div>
  );
}

export default WithShadcnUILibrary;
```

```tsx
export const initValue = {
  '53427170-b6c8-4729-9893-1f12628cd66a': {
    id: '53427170-b6c8-4729-9893-1f12628cd66a',
    value: [
      {
        id: '0d7d3629-46e1-46bc-a933-add6c06b578e',
        type: 'heading-one',
        children: [
          {
            text: 'The Joke Tax Chronicles',
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'HeadingOne',
    meta: {
      order: 0,
      depth: 0,
    },
  },
  '1221892f-90a2-4c44-8d93-b119a8a19572': {
    id: '1221892f-90a2-4c44-8d93-b119a8a19572',
    value: [
      {
        id: 'cf504aed-66e8-45f2-8f67-8d31764f8a01',
        type: 'paragraph',
        children: [
          {
            text: 'Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money.',
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'Paragraph',
    meta: {
      order: 1,
      depth: 0,
    },
  },
  '399571b8-acf3-42ea-887c-ebfe4a1b98c9': {
    id: '399571b8-acf3-42ea-887c-ebfe4a1b98c9',
    value: [
      {
        id: '81b615d9-5182-49c0-a045-1e8a603bcd4a',
        type: 'heading-two',
        children: [
          {
            text: "The King's Plan",
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'HeadingTwo',
    meta: {
      order: 2,
      depth: 0,
    },
  },
  '359cea0d-8aa3-44ab-8719-90685e489079': {
    id: '359cea0d-8aa3-44ab-8719-90685e489079',
    value: [
      {
        id: '6a58ffaf-4d10-46e3-b084-90d4228abbbb',
        type: 'paragraph',
        children: [
          {
            text: 'The king thought long and hard, and finally came up with',
          },
          {
            text: ' ',
          },
          {
            id: '61d6f5ca-b859-4bb4-a2fe-c5f20cb0d6d9',
            type: 'link',
            props: {
              url: 'https://ui.shadcn.com/docs/components/typography#',
              target: '_blank',
              rel: 'noopener noreferrer',
              title: 'a brilliant plan',
              nodeType: 'inline',
            },
            children: [
              {
                text: 'a brilliant plan',
              },
            ],
          },
          {
            text: ': he would tax the jokes in the kingdom.',
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'Paragraph',
    meta: {
      order: 3,
      depth: 0,
    },
  },
  'ed0a78b2-a2ef-4ff5-8ad8-3e27d24fdb40': {
    id: 'ed0a78b2-a2ef-4ff5-8ad8-3e27d24fdb40',
    value: [
      {
        id: 'ca568dbe-c480-4ab5-bee8-f8999fae6edc',
        type: 'blockquote',
        children: [
          {
            text: '"After all," he said, "everyone enjoys a good joke, so it\'s only fair that they should pay for the privilege."',
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'Blockquote',
    meta: {
      order: 4,
      depth: 0,
    },
  },
  '1712f063-16a1-4f0f-b6ad-ddccb29ecc0b': {
    id: '1712f063-16a1-4f0f-b6ad-ddccb29ecc0b',
    value: [
      {
        id: '9cf1235f-3189-47d6-8595-5563ad776cd8',
        type: 'heading-three',
        children: [
          {
            text: 'The Joke Tax',
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'HeadingThree',
    meta: {
      order: 5,
      depth: 0,
    },
  },
  '9c8c5a3c-356b-41a4-a0fe-1ad5bd556b66': {
    id: '9c8c5a3c-356b-41a4-a0fe-1ad5bd556b66',
    value: [
      {
        id: '7b20be77-e24a-4444-b5a3-deff2a2c829c',
        type: 'paragraph',
        children: [
          {
            text: "The king's subjects were not amused. They grumbled and complained, but the king was firm:",
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'Paragraph',
    meta: {
      order: 6,
      depth: 0,
    },
  },
  '2b886d7e-dcd1-40ab-815d-1a077c746d88': {
    id: '2b886d7e-dcd1-40ab-815d-1a077c746d88',
    value: [
      {
        id: '399301e4-3b36-46b2-b156-b7ce08f83e24',
        type: 'bulleted-list',
        children: [
          {
            text: '1st level of puns: 5 gold coins',
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'BulletedList',
    meta: {
      order: 7,
      depth: 0,
      align: 'left',
    },
  },
  '310c7683-c1c8-4381-bd29-0c647804c82a': {
    id: '310c7683-c1c8-4381-bd29-0c647804c82a',
    value: [
      {
        id: 'f18a231a-180c-45c3-980e-ebd38ad286df',
        type: 'bulleted-list',
        children: [
          {
            text: '2nd level of jokes: 10 gold coins',
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'BulletedList',
    meta: {
      order: 8,
      depth: 0,
      align: 'left',
    },
  },
  '67a290ef-4146-4b7e-95f3-cda8d0deac64': {
    id: '67a290ef-4146-4b7e-95f3-cda8d0deac64',
    value: [
      {
        id: '8589a577-3b1d-4d7d-b151-b659dbd6650f',
        type: 'bulleted-list',
        children: [
          {
            text: '3rd level of one-liners : 20 gold coins',
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'BulletedList',
    meta: {
      order: 9,
      depth: 0,
      align: 'left',
    },
  },
  '206144af-2a75-49b2-8df1-cd12cd3e2497': {
    id: '206144af-2a75-49b2-8df1-cd12cd3e2497',
    value: [
      {
        id: '4c931e98-c7eb-4365-9c8a-26c7e3994a66',
        type: 'paragraph',
        children: [
          {
            text: "As a result, people stopped telling jokes, and the kingdom fell into a gloom. But there was one person who refused to let the king's foolishness get him down: a court jester named Jokester.",
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'Paragraph',
    meta: {
      order: 10,
      depth: 0,
    },
  },
  '9bd66990-0b94-42cb-8e8c-4b8dfdb40bd9': {
    id: '9bd66990-0b94-42cb-8e8c-4b8dfdb40bd9',
    value: [
      {
        id: '71efd4cd-d591-4cad-9361-52d29ac188c3',
        type: 'heading-three',
        children: [
          {
            text: "Jokester's Revolt",
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'HeadingThree',
    meta: {
      order: 11,
      depth: 0,
    },
  },
  'dc924aaa-b73b-4e13-8083-13d0f47d2256': {
    id: 'dc924aaa-b73b-4e13-8083-13d0f47d2256',
    value: [
      {
        id: 'f3ceb191-831a-4c39-8328-9a5fa5c95d11',
        type: 'paragraph',
        children: [
          {
            text: "Jokester began sneaking into the castle in the middle of the night and leaving jokes all over the place: under the king's pillow, in his soup, even in the royal toilet. The king was furious, but he couldn't seem to stop Jokester.",
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'Paragraph',
    meta: {
      order: 12,
      depth: 0,
    },
  },
  'd31ebe4c-fd73-4d4c-8b6e-24abe4caa3da': {
    id: 'd31ebe4c-fd73-4d4c-8b6e-24abe4caa3da',
    value: [
      {
        id: '361efadc-5791-4baa-8ccf-83fd8183ea81',
        type: 'paragraph',
        children: [
          {
            text: "And then, one day, the people of the kingdom discovered that the jokes left by Jokester were so funny that they couldn't help but laugh. And once they started laughing, they couldn't stop.",
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'Paragraph',
    meta: {
      order: 13,
      depth: 0,
    },
  },
  '645a06e3-07ed-48af-93da-b5735f9bdd0b': {
    id: '645a06e3-07ed-48af-93da-b5735f9bdd0b',
    value: [
      {
        id: 'bfdfd085-00d5-4fd9-88c7-ac7bfe0968cd',
        type: 'heading-three',
        children: [
          {
            text: "The People's Rebellion",
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'HeadingThree',
    meta: {
      order: 14,
      depth: 0,
    },
  },
  '6abc3c64-2187-4031-b43f-7865de13c704': {
    id: '6abc3c64-2187-4031-b43f-7865de13c704',
    value: [
      {
        id: 'fc1c0b63-19d3-420a-b1d3-96206eab2f8b',
        type: 'paragraph',
        children: [
          {
            text: 'The people of the kingdom, feeling uplifted by the laughter, started to tell jokes and puns again, and soon the entire kingdom was in on the joke.',
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'Paragraph',
    meta: {
      order: 15,
      depth: 0,
    },
  },
  'ff553cfd-b5e9-45f9-b06b-65173b814bea': {
    id: 'ff553cfd-b5e9-45f9-b06b-65173b814bea',
    value: [
      {
        id: 'b32acb81-06cb-4566-92cc-a8cca33aa6d2',
        type: 'table',
        children: [
          {
            id: '07f9eafc-6c21-4ad1-9885-2c97362764d3',
            type: 'table-row',
            children: [
              {
                id: 'd2f67ccc-1db2-4a3e-a8cc-1a6303ebb472',
                type: 'table-data-cell',
                children: [
                  {
                    text: "King's Treasury",
                  },
                ],
                props: {
                  asHeader: true,
                  width: 200,
                },
              },
              {
                id: 'b77c242d-6b3e-4f9e-959e-d9c452271115',
                type: 'table-data-cell',
                children: [
                  {
                    text: "People's happiness",
                  },
                ],
                props: {
                  asHeader: true,
                  width: 200,
                },
              },
            ],
          },
          {
            id: 'f1f4041f-b903-4cb7-9ff1-c964dd129a26',
            type: 'table-row',
            children: [
              {
                id: '149fbec5-d86f-4385-a245-e82449449027',
                type: 'table-data-cell',
                children: [
                  {
                    text: 'Empty',
                  },
                ],
                props: {
                  asHeader: false,
                  width: 200,
                },
              },
              {
                id: '8e1ea510-b988-437c-b279-a554dcc3cdb9',
                type: 'table-data-cell',
                children: [
                  {
                    text: 'Overflowing',
                  },
                ],
                props: {
                  asHeader: false,
                  width: 200,
                },
              },
            ],
          },
          {
            id: '26ed6723-2bd7-439b-bf8e-da3f937422e6',
            type: 'table-row',
            children: [
              {
                id: 'c13bd9bc-51bd-40d9-b45b-dc151f88a1f4',
                type: 'table-data-cell',
                children: [
                  {
                    text: 'Modest',
                  },
                ],
                props: {
                  asHeader: false,
                  width: 200,
                },
              },
              {
                id: '5482195b-2da5-4bab-a229-de709098117f',
                type: 'table-data-cell',
                children: [
                  {
                    text: 'Satisfied',
                  },
                ],
                props: {
                  asHeader: false,
                  width: 200,
                },
              },
            ],
          },
          {
            id: '33e63f70-b096-4f25-95c0-8252cf4140e3',
            type: 'table-row',
            children: [
              {
                id: '0236212c-45e6-4404-acd3-267f6f11a084',
                type: 'table-data-cell',
                children: [
                  {
                    text: 'Full',
                  },
                ],
                props: {
                  asHeader: false,
                  width: 200,
                },
              },
              {
                id: '92984544-63e5-470c-b064-a113500edd3a',
                type: 'table-data-cell',
                children: [
                  {
                    text: 'Ecstatic',
                  },
                ],
                props: {
                  asHeader: false,
                  width: 200,
                },
              },
            ],
          },
        ],
        props: {
          headerRow: true,
          headerColumn: false,
        },
      },
    ],
    type: 'Table',
    meta: {
      order: 17,
      depth: 0,
    },
  },
  '36adc32b-a4df-4154-9dbe-49b8e7be87d7': {
    id: '36adc32b-a4df-4154-9dbe-49b8e7be87d7',
    value: [
      {
        id: '8b06bd7b-90e8-44f2-a7c6-fd51aaf0af36',
        type: 'paragraph',
        children: [
          {
            text: 'The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke tax. Jokester was declared a hero, and the kingdom lived happily ever after.',
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'Paragraph',
    meta: {
      order: 18,
      depth: 0,
    },
  },
  'efe2c73b-9ce3-4a33-8f74-4d2b15319c3c': {
    id: 'efe2c73b-9ce3-4a33-8f74-4d2b15319c3c',
    value: [
      {
        id: 'bf334602-04ce-4210-b521-5e04b3a4eaf0',
        type: 'paragraph',
        children: [
          {
            text: 'The moral of the story is: never underestimate the power of a good laugh and always be careful of bad ideas.',
          },
        ],
        props: {
          nodeType: 'block',
        },
      },
    ],
    type: 'Paragraph',
    meta: {
      order: 19,
      depth: 0,
    },
  },
  '0567ee93-c16f-499f-8815-a090ac276fdc': {
    id: '0567ee93-c16f-499f-8815-a090ac276fdc',
    value: [
      {
        id: '3e57e3db-660d-4fb5-8e4b-2d57c33f8b36',
        type: 'accordion-list',
        children: [
          {
            id: '2c58d4b7-3daf-46b3-b9d3-69b6bb3ee5d0',
            type: 'accordion-list-item',
            children: [
              {
                id: '6e70baf0-299e-4f9e-b05e-310562a5126c',
                type: 'accordion-list-item-heading',
                children: [
                  {
                    text: 'What the best football club?',
                  },
                ],
                props: {
                  nodeType: 'block',
                },
              },
              {
                id: 'b8f0fe33-9673-4fa5-bc73-4b20735ea7ed',
                type: 'accordion-list-item-content',
                children: [
                  {
                    text: 'Chelsea FC is the best football club in the world',
                  },
                ],
                props: {
                  nodeType: 'block',
                },
              },
            ],
            props: {
              nodeType: 'block',
              isExpanded: true,
            },
          },
          {
            id: '73e4fecf-ae44-4d49-9e34-69429f43ef9c',
            type: 'accordion-list-item',
            children: [
              {
                id: '709e96db-c8bc-47f2-976b-f9436f6b304d',
                type: 'accordion-list-item-heading',
                children: [
                  {
                    text: 'Is it styled?',
                  },
                ],
                props: {
                  nodeType: 'block',
                },
              },
              {
                id: '6358786d-f99d-4d5c-8ff7-51e247b4eed3',
                type: 'accordion-list-item-content',
                children: [
                  {
                    text: "Yes. It comes with default styles that matches the other components' aesthetic.",
                  },
                ],
                props: {
                  nodeType: 'block',
                },
              },
            ],
            props: {
              nodeType: 'block',
              isExpanded: true,
            },
          },
          {
            id: 'fa465ec4-c4cc-4237-ba0a-9bfc7a6498da',
            type: 'accordion-list-item',
            children: [
              {
                id: '0cc1fc61-5b9d-4047-a1ad-08990efeec81',
                type: 'accordion-list-item-heading',
                children: [
                  {
                    text: 'Is it animated?',
                  },
                ],
                props: {
                  nodeType: 'block',
                },
              },
              {
                id: '4bfe30c3-3f4a-46d5-93dd-065bb901b4e0',
                type: 'accordion-list-item-content',
                children: [
                  {
                    text: 'Yes. It`s animated by default, but you can disable it if you prefer',
                  },
                ],
                props: {
                  nodeType: 'block',
                },
              },
            ],
            props: {
              nodeType: 'block',
              isExpanded: true,
            },
          },
        ],
      },
    ],
    type: 'Accordion',
    meta: {
      order: 16,
      depth: 0,
    },
  },
};
```
