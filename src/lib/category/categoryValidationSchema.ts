import { number, object, string } from 'yup';

const CategoryBodySchema = object({
  name: string()
    .trim()
    .required('Category name is required')
    .max(128, 'Category name is too long'),
  description: string().trim().max(255, 'Category description is too long'),
  nextId: number().required().nullable(),
}).typeError('Missing request Body');

const CategoryQuerySchema = object({
  cid: number().required(),
});

export { CategoryBodySchema, CategoryQuerySchema };
