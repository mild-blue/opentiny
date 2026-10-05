import { describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { assert } from 'chai';

import { ParserFilter } from 'tinymce/core/api/html/DomParser';
import AstNode from 'tinymce/core/api/html/Node';
import { runFilters, traverse } from 'tinymce/core/html/FilterNode';

describe('atomic.tinymce.core.html.FilterNode', () => {
  it('TINY-6945: new traverse should work like old recursive traverse', () => {
    const results: string[] = [];

    const body = new AstNode('body', 11);

    const child1 = new AstNode('child1', 1);
    body.append(child1);
    const child1Sibling = new AstNode('child1Sibling', 1);
    body.append(child1Sibling);

    const child2 = new AstNode('child2', 1);
    child1.append(child2);

    const child3 = new AstNode('child3', 1);
    child2.append(child3);
    const child3Sibling = new AstNode('child3Sibling', 1);
    child2.append(child3Sibling);

    const expected = [
      'child1',
      'child2',
      'child3',
      'child3Sibling',
      'child1Sibling'
    ];

    // TEST STRUCTURE:
    // body
    // |
    // child1 --- child1Sibling
    // |
    // child2
    // |
    // child3 --- child3Sibling

    traverse(body, (node) => results.push(node.name));

    assert.deepEqual(results, expected, 'old result should be identical to new one');
  });

  it('TINY-6945: traverse should not go in `Maximum call stack size exceeded` if there are a lot of elements', () => {
    const body = new AstNode('body', 11);
    Arr.range(15000, () => {
      body.append(new AstNode('p', 1));
    });

    traverse(body, Fun.noop);
  });

  it('runFilters passes each callback only the attached nodes that still match, in order', () => {
    const body = new AstNode('body', 11);
    const nodes = Arr.map([ 'a', 'b', 'c', 'd', 'e', 'f' ], (id) => {
      const node = AstNode.create('p', { id, title: id });
      body.append(node);
      return node;
    });
    nodes[1].remove();
    nodes[3].name = 'div';
    nodes[4].attr('title', null);

    const getIds = (matched: AstNode[]) => Arr.map(matched, (node) => node.attr('id'));
    const seenByNodeFilter: Array<Array<string | undefined>> = [];
    const nodeFilter: ParserFilter = {
      name: 'p',
      callbacks: [
        (matched) => {
          seenByNodeFilter.push(getIds(matched));
          matched[0].remove();
        },
        (matched) => {
          seenByNodeFilter.push(getIds(matched));
        }
      ]
    };
    const seenByAttributeFilter: Array<Array<string | undefined>> = [];
    const attributeFilter: ParserFilter = {
      name: 'title',
      callbacks: [ (matched) => seenByAttributeFilter.push(getIds(matched)) ]
    };

    const matchedNodes = Arr.from(nodes);
    runFilters({
      nodes: { p: { filter: nodeFilter, nodes: matchedNodes }},
      attributes: { title: { filter: attributeFilter, nodes: matchedNodes }}
    }, {});

    assert.deepEqual(seenByNodeFilter, [[ 'a', 'c', 'e', 'f' ], [ 'c', 'e', 'f' ]]);
    assert.deepEqual(seenByAttributeFilter, [[ 'c', 'd', 'f' ]]);
    assert.lengthOf(matchedNodes, 6, 'The match list itself should not be mutated');
  });
});
