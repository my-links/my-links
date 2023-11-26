import { number, object, string } from 'yup';

const CategoryBodySchema = object({
  name: string()
    .trim()
    .required("Category name's required")
    .max(128, "Category name's too long"),
}).typeError('Missing request Body');

const CategoryQuerySchema = object({
  cid: number().required(),
});

export { CategoryBodySchema, CategoryQuerySchema };
