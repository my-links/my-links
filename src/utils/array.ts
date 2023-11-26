import { i18n } from 'next-i18next';

export function groupItemBy(array: any[], property: string) {
  const hash = {};
  const props = property.split('.');

  for (const item of array) {
    const key = props.reduce((acc, prop) => acc && acc[prop], item);
    const hashKey =
      key !== undefined ? key : i18n.t('common:category.categories');

    if (!hash[hashKey]) {
      hash[hashKey] = [];
    }

    hash[hashKey].push(item);
  }

  return hash;
}
