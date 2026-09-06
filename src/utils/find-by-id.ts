interface Identifiable {
  readonly id: string;
}


export function findById<
  T extends Identifiable
>(
  items: readonly T[],
  id: string
): T | undefined {

  return items.find(
    (item) => item.id === id
  );
}