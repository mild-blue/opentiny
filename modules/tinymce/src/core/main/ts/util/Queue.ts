export const concurrentQueue = async <Item, ReturnValue>(item: Item[], threads: number, fn: (item: Item, index: number, array: Item[]) => Promise<ReturnValue>) => {
  let i = 0;
  const result = Array(item.length) as ReturnValue[];
  await Promise.all([...Array(threads)].map(async () => {
    while (i < item.length) result[i] = await fn(item[i], i++, item)
  }));
  return result;
};
