import ContentLayout from '~/components/layouts/content_layout';
import PATHS from '../../app/constants/paths';

export default function LoginPage() {
  return (
    <ContentLayout>
      <a href={PATHS.AUTH.GOOGLE}>Continue with Google</a>
    </ContentLayout>
  );
}
