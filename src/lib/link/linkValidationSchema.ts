import { boolean, number, object, string } from 'yup';
import { isValidHttpUrl } from '../url';

const LinkBodySchema = object({
  name: string()
    .trim()
    .required('Link name is required')
    .max(128, 'Link name is too long'),
  description: string().trim().max(255, 'Link description is too long'),
  url: string()
    .trim()
    .required('URl is required')
    .test('test_url', 'Invalid URL format', (value) => isValidHttpUrl(value)),
  categoryId: number().required('CategoryId must be a number'),
  favorite: boolean().default(() => false),
}).typeError('Missing request Body');

const LinkQuerySchema = object({
  lid: number().required(),
});

export { LinkBodySchema, LinkQuerySchema };
