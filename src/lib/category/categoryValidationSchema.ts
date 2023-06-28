import { number, object, string } from "yup";

const CategorieBodySchema = object({
  name: string()
    .trim()
    .required("Category name's required")
    .max(128, "Category name's too long"),
}).typeError("Missing request Body");

const CategorieQuerySchema = object({
  cid: number().required(),
});

export { CategorieBodySchema, CategorieQuerySchema };
