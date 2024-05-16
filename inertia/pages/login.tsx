import { route } from '@izzyjs/route/client';
import ContentLayout from '~/components/layouts/content_layout';

const LoginPage = () => (
  <ContentLayout>
    <a href={route('auth.google').url}>Continue with Google</a>
  </ContentLayout>
);
export default LoginPage;
