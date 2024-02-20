/* eslint-disable  */
import { expectError, expectNotType, expectType } from "tsd";
import LeafPath, { Refs } from "./LeafPath.js";
import { OriginalEntries } from "../changes/Changeable.js";
import Fragment from "./Fragment.js";
import { Primitive } from "./Leaves.js";

declare function check<T extends object, U extends LeafPath<T> = LeafPath<T>>(
  path: U,
): U;

// Inheritance
class X {
  name!: string;
}
interface Y {
  id: number;
}
class Z extends X implements Y {
  id!: number;
}
expectNotType<any>(check<Z>("id"));
expectNotType<any>(check<Z>("name"));

// The paths of the union is the union of the paths of each union element
type DistributivePathUnion<
  T extends object,
  U extends Fragment<T> = Fragment<T>,
  _UNION extends Refs<T | U> = Refs<T> | Refs<U>,
> = T;

// object not marked `as const` can interpolate indices
expectNotType<any>(check<typeof ob1>("objects[30].id"));
const ob1 = {
  objects: [
    {
      id: 2,
    },
  ],
  numbers: [1, 2, 3],
};

// functions are not valid
class Test {
  name!: string;
  other!: [string, number];
  get prop() {
    return true;
  }
  myFunction() {}
}
expectNotType<any>(check<Test>("other[1]"));
expectError(check<Test>("myFunction"));

// LeafPath<Fragment> <=> LeafPath<ChangeableFragment> <=> LeafPath<ChangeableEntry>
// No intellisense for OriginalEntries' fields
type Fragm = {
  leaf: number;
  arr: number[];
  ob1: Record<string, string>;
  ob2: Record<number, string>;
};
interface Changeable extends Fragm {
  original: OriginalEntries<Fragm>;
}
expectType<LeafPath<Fragm>>(
  check<Fragm & OriginalEntries<Fragm> & Changeable>("leaf"),
);
expectType<LeafPath<Fragm>>(check<Changeable>("leaf"));
expectType<LeafPath<Fragm>>(
  check<Changeable["original"]>("leaf" as LeafPath<Changeable>),
);

// Non-as-const array
const obInArr = [1, "2", { id: "123" }],
  arrInOb = {
    leaf: "value",
    obj: {
      leaf: "value",
      obj: {} as Record<string, unknown>,
      arr: [] as unknown[],
    },
    arr: ["value", {} as Record<string, unknown>, [] as unknown[]],
    arr2: [1, 2, 3],
  };
expectNotType<`${any}` | `[${number}].id`>(check<typeof obInArr>("[0].id"));
expectError(check<typeof arrInOb>("obj"));
expectError(check<typeof arrInOb>("obj.obj"));
expectError(check<typeof arrInOb>("obj.arr"));
expectError(check<typeof arrInOb>("arr"));

// Mix of leaves and trees inside array
type LeafTreeArray = (
  | Primitive
  | Record<string, Primitive>
  | Record<number, Primitive>
  | Primitive[]
)[];
type expected =
  | `[${number}]`
  | `[${number}].${string}`
  | `[${number}].${number}`
  | `[${number}][${number}]`;
expectType<expected>(check<LeafTreeArray>("[1]"));

// empty array or object
type M = ["value", {}, []];
expectType<"[0]">(check<M>("[0]"));
type N = { leaf: "value"; list: []; ob: {} };
expectType<"leaf">(check<N>("leaf"));

// arrays inside objects
type Bug = { values: number[] };
expectType<`values[${number}]`>(check<Bug>("values[0]"));

// Record type inside object
// this can be messed up by ChangeableEntries' definition
type Records = {
  strings: Record<string, string>;
  numbers: Record<number, number>;
};
expectType<`strings${string}` | `numbers.${number}`>(
  check<Records>("strings.other"),
);
