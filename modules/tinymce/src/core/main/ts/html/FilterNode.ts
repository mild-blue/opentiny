import { Arr, Obj, Type } from '@ephox/katamari';

import { ParserArgs, ParserFilter } from '../api/html/DomParser';
import AstNode from '../api/html/Node';

interface FilterMatch {
  readonly filter: ParserFilter;
  readonly nodes: AstNode[];
}

export interface FilterMatches {
  readonly nodes: Record<string, FilterMatch>;
  readonly attributes: Record<string, FilterMatch>;
}

const traverse = (root: AstNode, fn: (node: AstNode) => void): void => {
  let node: AstNode | null | undefined = root;
  while ((node = node.walk())) {
    fn(node);
  }
};

// Test a single node against the current filters, and add it to any match lists if necessary
const matchNode = (nodeFilters: ParserFilter[], attributeFilters: ParserFilter[], node: AstNode, matches: FilterMatches): void => {
  const name = node.name;
  // Match node filters
  for (let ni = 0, nl = nodeFilters.length; ni < nl; ni++) {
    const filter = nodeFilters[ni];
    if (filter.name === name) {
      const match = matches.nodes[name];

      if (match) {
        match.nodes.push(node);
      } else {
        matches.nodes[name] = { filter, nodes: [ node ] };
      }
    }
  }

  // Match attribute filters
  if (node.attributes) {
    for (let ai = 0, al = attributeFilters.length; ai < al; ai++) {
      const filter = attributeFilters[ai];
      const attrName = filter.name;

      if (attrName in node.attributes.map) {
        const match = matches.attributes[attrName];

        if (match) {
          match.nodes.push(node);
        } else {
          matches.attributes[attrName] = { filter, nodes: [ node ] };
        }
      }
    }
  }
};

const findMatchingNodes = (nodeFilters: ParserFilter[], attributeFilters: ParserFilter[], node: AstNode): FilterMatches => {
  const matches: FilterMatches = { nodes: {}, attributes: {}};

  if (node.firstChild) {
    traverse(node, (childNode) => {
      matchNode(nodeFilters, attributeFilters, childNode, matches);
    });
  }

  return matches;
};

// Run all necessary node filters and attribute filters, based on a match set
const runFilters = (matches: FilterMatches, args: ParserArgs): void => {
  const run = (matchRecord: Record<string, FilterMatch>, filteringAttributes: boolean) => {
    Obj.each(matchRecord, (match) => {
      // match.nodes is never mutated, since the method is exported and we can't guarantee nobody else uses it
      let nodes = match.nodes;

      Arr.each(match.filter.callbacks, (callback) => {
        // Keep only the nodes that are still attached and still match the filter. Filter into a new array in one
        // pass: splicing nodes out one at a time would be quadratic when many were removed, e.g. the whitespace
        // text nodes of indented markup, which the whitespace cleaner removes after they were matched.
        nodes = Arr.filter(nodes, (node) => {
          const valueMatches = filteringAttributes ? node.attr(match.filter.name) !== undefined : node.name === match.filter.name;
          return valueMatches && Type.isNonNullable(node.parent);
        });

        if (nodes.length > 0) {
          callback(nodes, match.filter.name, args);
        }
      });
    });
  };

  run(matches.nodes, false);
  run(matches.attributes, true);
};

const filter = (nodeFilters: ParserFilter[], attributeFilters: ParserFilter[], node: AstNode, args: ParserArgs = {}): void => {
  const matches = findMatchingNodes(nodeFilters, attributeFilters, node);
  runFilters(matches, args);
};

export {
  matchNode,
  runFilters,
  filter,
  traverse // Exposed for testing.
};
