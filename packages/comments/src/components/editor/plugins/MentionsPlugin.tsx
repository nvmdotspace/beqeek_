/**
 * Mentions Plugin for Lexical editor
 * Enables @mentions with typeahead functionality
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { $createTextNode, $getSelection, $isRangeSelection, TextNode } from 'lexical';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import * as ReactDOM from 'react-dom';

import { $createMentionNode, MentionNode } from '../nodes/MentionNode.js';

export interface MentionUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

const PUNCTUATION = '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']';

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

const PUNC = DocumentMentionsRegex.PUNCTUATION;

const TRIGGERS = ['@'].join('');

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = '[^' + TRIGGERS + PUNC + '\\s]';

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  '(?:' +
  '\\.[ |$]|' + // E.g. "r. " in "Mr. Smith"
  ' |' + // E.g. " " in "Josh Duck"
  '[' +
  PUNC +
  ']|' + // E.g. "-' in "Salier-Hellendag"
  ')';

const LENGTH_LIMIT = 75;

const AtSignMentionsRegex = new RegExp(
  '(^|\\s|\\()(' + '[' + TRIGGERS + ']' + '((?:' + VALID_CHARS + VALID_JOINS + '){0,' + LENGTH_LIMIT + '})' + ')$',
);

// 50 ms debounce time
const SUGGESTION_LIST_LENGTH_LIMIT = 5;

function checkForAtSignMentions(
  text: string,
  minMatchLength: number,
): null | { leadOffset: number; matchingString: string; replaceableString: string } {
  let match = AtSignMentionsRegex.exec(text);

  if (match === null) {
    return null;
  }

  // The strategy ignores leading whitespace but we need to know it's
  // length to add it to the leadOffset
  const maybeLeadingWhitespace = match[1] || '';

  const matchingString = match[3] || '';
  if (matchingString.length >= minMatchLength) {
    return {
      leadOffset: match.index + maybeLeadingWhitespace.length,
      matchingString,
      replaceableString: match[2] || '',
    };
  }

  return null;
}

function getPossibleQueryMatch(
  text: string,
): null | { leadOffset: number; matchingString: string; replaceableString: string } {
  return checkForAtSignMentions(text, 1);
}

class MentionTypeaheadOption extends MenuOption {
  name: string;
  id: string;
  avatarUrl?: string;

  constructor(id: string, name: string, avatarUrl?: string) {
    super(name);
    this.name = name;
    this.id = id;
    this.avatarUrl = avatarUrl;
  }
}

function MentionsTypeaheadMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: MentionTypeaheadOption;
}) {
  let className = 'item';
  if (isSelected) {
    className += ' selected';
  }
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {option.avatarUrl && (
        <img
          src={option.avatarUrl}
          alt={option.name}
          className="w-6 h-6 rounded-full mr-2"
          style={{ display: 'inline-block' }}
        />
      )}
      <span className="text">{option.name}</span>
    </li>
  );
}

export interface MentionsPluginProps {
  users?: MentionUser[];
  onSearch?: (query: string) => Promise<MentionUser[]>;
}

export function MentionsPlugin({ users = [], onSearch }: MentionsPluginProps): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<MentionUser[]>(users);

  React.useEffect(() => {
    if (!editor.hasNodes([MentionNode])) {
      throw new Error('MentionsPlugin: MentionNode not registered on editor (initialConfig.nodes)');
    }
  }, [editor]);

  // Handle search
  React.useEffect(() => {
    if (queryString !== null && onSearch) {
      onSearch(queryString).then(setSearchResults);
    } else if (queryString !== null) {
      const filtered = users.filter((user) => user.name.toLowerCase().includes(queryString.toLowerCase()));
      setSearchResults(filtered);
    }
  }, [queryString, users, onSearch]);

  const options = useMemo(() => {
    return searchResults
      .slice(0, SUGGESTION_LIST_LENGTH_LIMIT)
      .map((user) => new MentionTypeaheadOption(user.id, user.name, user.avatarUrl));
  }, [searchResults]);

  const onSelectOption = useCallback(
    (selectedOption: MentionTypeaheadOption, nodeToReplace: TextNode | null, closeMenu: () => void) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(selectedOption.name, selectedOption.id);
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        mentionNode.select();
        closeMenu();
      });
    },
    [editor],
  );

  const checkForMentionMatch = useCallback((text: string) => {
    const mentionMatch = getPossibleQueryMatch(text);
    const slashMatch = null;
    return mentionMatch || slashMatch;
  }, []);

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) =>
        anchorElementRef.current && options.length
          ? ReactDOM.createPortal(
              <div className="typeahead-popover mentions-menu">
                <ul>
                  {options.map((option, i: number) => (
                    <MentionsTypeaheadMenuItem
                      index={i}
                      isSelected={selectedIndex === i}
                      onClick={() => {
                        setHighlightedIndex(i);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(i);
                      }}
                      key={option.key}
                      option={option}
                    />
                  ))}
                </ul>
              </div>,
              anchorElementRef.current,
            )
          : null
      }
    />
  );
}
