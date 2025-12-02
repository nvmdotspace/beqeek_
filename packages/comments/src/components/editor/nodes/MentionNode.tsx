/**
 * Custom Mention Node for Lexical editor
 * Enables @mentions with typeahead functionality
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
} from 'lexical';

import { $applyNodeReplacement, TextNode } from 'lexical';

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
    userId?: string;
  },
  SerializedTextNode
>;

function convertMentionElement(domNode: HTMLElement): DOMConversionOutput | null {
  const textContent = domNode.textContent;
  const mentionName = domNode.getAttribute('data-mention-name');
  const userId = domNode.getAttribute('data-user-id');

  if (mentionName) {
    // Use data attributes if available
    const node = $createMentionNode(mentionName, userId ?? undefined);
    return { node };
  }

  if (textContent !== null) {
    // Try to parse Slack-like format: <@userId|name>
    const match = textContent.match(/^<@([^|]+)\|([^>]+)>$/);
    if (match) {
      const parsedUserId = match[1];
      const parsedName = match[2];
      if (parsedName) {
        const node = $createMentionNode(parsedName, parsedUserId);
        return { node };
      }
    }
    // Fallback to just the text
    const node = $createMentionNode(textContent.replace(/^@/, ''));
    return { node };
  }

  return null;
}

export class MentionNode extends TextNode {
  __mention: string;
  __userId?: string;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mention, node.__userId, node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.mentionName, serializedNode.userId);
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  constructor(mentionName: string, userId?: string, text?: string, key?: NodeKey) {
    super(text ?? mentionName, key);
    this.__mention = mentionName;
    this.__userId = userId;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      userId: this.__userId,
      type: 'mention',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.className = 'mention';
    // Display as @name instead of <@userId|name>
    dom.textContent = `@${this.__mention}`;
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('data-lexical-mention', 'true');
    element.setAttribute('data-mention-name', this.__mention);
    if (this.__userId) {
      element.setAttribute('data-user-id', this.__userId);
    }
    // Export as Slack-like format: <@userId|name>
    element.textContent = this.__userId ? `<@${this.__userId}|${this.__mention}>` : `@${this.__mention}`;
    element.className = 'mention';
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-mention')) {
          return null;
        }
        return {
          conversion: convertMentionElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false; // Prevent editing inside mention
  }

  canInsertTextAfter(): boolean {
    return false; // Prevent editing inside mention
  }

  // Prevent splitting the mention node when pressing backspace/delete in the middle
  canBeTransformed(): boolean {
    return false;
  }
}

/**
 * Create a mention node
 * Text content is `@name` for display, Slack-like format `<@userId|name>` only in exportDOM
 */
export function $createMentionNode(mentionName: string, userId?: string): MentionNode {
  // Store display format as text content (what user sees and edits)
  const textContent = `@${mentionName}`;
  const mentionNode = new MentionNode(mentionName, userId, textContent);
  // Use 'token' mode to make mention behave as atomic unit (delete entire mention at once)
  mentionNode.setMode('token').toggleDirectionless();
  return $applyNodeReplacement(mentionNode);
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode;
}
