export const removeDuplicates = (array, propName) =>
  Array.from(
    array.reduce((acc, cur) => acc.set(cur[propName], cur), new Map()).values()
  );
