import i18n from '~/i18n';

export function groupItemBy(array: any[], property: string) {
  const hash: any = {};
  const props = property.split('.');

  for (const item of array) {
    const key = props.reduce((acc, prop) => acc && acc[prop], item);
    const hashKey =
      key !== undefined ? key : i18n.t('common:collection.collections');

    if (!hash[hashKey]) {
      hash[hashKey] = [];
    }

    hash[hashKey].push(item);
  }

  return hash;
}

// Thanks S/O
export function arrayMove<T>(
  arr: T[],
  previousIndex: number,
  nextIndex: number
): T[] {
  const arrayCopy = [...arr];
  const [removedElement] = arrayCopy.splice(previousIndex, 1);

  if (nextIndex >= arr.length) {
    // Pad the array with undefined elements if needed
    const padding = nextIndex - arr.length + 1;
    arrayCopy.push(...new Array(padding).fill(undefined));
  }

  arrayCopy.splice(nextIndex, 0, removedElement);
  return arrayCopy;
}

export const sortByCreationDate = <T extends { createdAt: any }>(arr: T[]) =>
  arr.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
