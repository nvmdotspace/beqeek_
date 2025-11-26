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
    return true; // Allow cursor to move before mention
  }

  canInsertTextAfter(): boolean {
    return true; // Allow cursor to move after mention
  }
}

/**
 * Create a mention node with Slack-like format
 * Text content will be `<@userId|name>` for storage, but display as `@name`
 */
export function $createMentionNode(mentionName: string, userId?: string): MentionNode {
  // Store as Slack-like format: <@userId|name>
  const textContent = userId ? `<@${userId}|${mentionName}>` : `@${mentionName}`;
  const mentionNode = new MentionNode(mentionName, userId, textContent);
  mentionNode.setMode('segmented').toggleDirectionless();
  return $applyNodeReplacement(mentionNode);
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode;
}
