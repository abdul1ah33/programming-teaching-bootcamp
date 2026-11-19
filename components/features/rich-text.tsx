import Markdoc, { type Node } from '@markdoc/markdoc';
import React from 'react';

/** Renders rich text written in the admin (Markdoc). Links to other sites open in a new tab. */
export function RichText({ node, className = '' }: { node: Node; className?: string }) {
  const content = Markdoc.transform(node, {
    nodes: {
      link: {
        render: 'a',
        attributes: { href: { type: String }, title: { type: String } },
        transform(n, config) {
          const href = String(n.attributes.href ?? '');
          const external = /^https?:\/\//.test(href);
          return new Markdoc.Tag(
            'a',
            { href, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) },
            n.transformChildren(config),
          );
        },
      },
    },
  });
  return <div className={`prose-journey ${className}`}>{Markdoc.renderers.react(content, React)}</div>;
}
