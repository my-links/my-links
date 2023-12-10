import { number, object, string } from 'yup';

const CategoryBodySchema = object({
  name: string()
    .trim()
    .required('Category name is required')
    .max(128, 'Category name is too long'),
  nextId: number(),
}).typeError('Missing request Body');

const CategoryQuerySchema = object({
  cid: number().required(),
});

export { CategoryBodySchema, CategoryQuerySchema };
