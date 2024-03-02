/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from 'vitest';
import {
  buildRefs,
  getOuterRefs,
  hasTypeCollision,
  reconstruct,
} from '../newSetter.js';
import { split } from '../parsePath.js';

test('only root key', () => {
  // const dotPath = split('a')[0];
  // const ref = {};

  const ref1: any[] = [];
  const dotPath1 = split('[][]')[0];

  console.log(getOuterRefs(ref1, dotPath1));
  console.log(buildRefs(ref1, dotPath1));
  console.log(reconstruct(ref1, dotPath1));
  expect(hasTypeCollision(getOuterRefs(ref1, dotPath1), dotPath1)).toBe(true);

  // expect(dottedPathToTree(ref, dotPath)).toEqual({
  //   a: {},
  // });
});

// test('only array index', () => {
//   const dotPath = split('[0]')[0];
//   const ref = [] as unknown[];
//   expect(dottedPathToTree(ref, dotPath)).toEqual([{}]);
// });
