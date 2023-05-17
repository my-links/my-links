export function groupItemBy(array: any[], property: string) {
  const hash = {};
  const props = property.split(".");

  for (const item of array) {
    const key = props.reduce((acc, prop) => acc && acc[prop], item);
    const hashKey = key !== undefined ? key : "catégories";

    if (!hash[hashKey]) {
      hash[hashKey] = [];
    }

    hash[hashKey].push(item);
  }

  return hash;
}
