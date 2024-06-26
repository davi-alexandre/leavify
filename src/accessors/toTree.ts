import _ from 'lodash';
import { set } from './accessors.js';
import { Primitive } from '@typings';

/** Create a new object from a list of path-value entries  */

export default function toTree(
  leaves: readonly (readonly [string, Primitive])[],
): object | undefined {
  if (_.isEmpty(leaves)) return undefined;
  const [firstPath] = leaves[0];
  const tree: object = firstPath.startsWith('[') ? [] : {};
  for (const [path, value] of leaves) {
    set(tree, [path, value]);
  }
  return tree;
}
