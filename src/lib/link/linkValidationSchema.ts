import { VALID_URL_REGEX } from "constants/url";
import { boolean, number, object, string } from "yup";

const LinkBodySchema = object({
  name: string()
    .trim()
    .required("Link name is required")
    .max(128, "Link name is too long"),
  url: string()
    .trim()
    .required("URl is required")
    .matches(VALID_URL_REGEX, "Invalid URL format"),
  categoryId: number().required("CategoryId must be a number"),
  favorite: boolean().default(() => false),
}).typeError("Missing request Body");

const LinkQuerySchema = object({
  lid: number().required(),
});

export { LinkBodySchema, LinkQuerySchema };
