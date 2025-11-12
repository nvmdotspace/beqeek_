import { useEffect, useState, type ReactNode } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { evaluate, type EvaluateOptions } from '@mdx-js/mdx';

type MDXProps = Record<string, unknown>;
type ReactMDXContent = (props: MDXProps) => ReactNode;
type Runtime = Pick<EvaluateOptions, 'jsx' | 'jsxs' | 'Fragment'>;

const runtime = { jsx, jsxs, Fragment } as Runtime;

export interface CommentPreviewProps {
  /** MDX source code to render */
  source: string;
  /** Optional className for styling */
  className?: string;
}

/**
 * CommentPreview - Renders MDX content from comment text
 * Supports markdown formatting, links, code blocks, etc.
 * React 19 compatible with latest @mdx-js/mdx
 */
export function CommentPreview({ source, className }: CommentPreviewProps) {
  const [MdxContent, setMdxContent] = useState<ReactMDXContent>(() => () => null);

  useEffect(() => {
    evaluate(source, runtime).then((r) => {
      setMdxContent(() => r.default);
    });
  }, [source]);

  return (
    <div className={className}>
      <MdxContent />
    </div>
  );
}
