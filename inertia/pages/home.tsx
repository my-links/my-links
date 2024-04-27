import { InferPageProps } from '@adonisjs/inertia/types';
import ContentLayout from '~/components/layouts/content_layout';
import useUser from '~/hooks/use_user';
import type AppsController from '../../app/controllers/apps_controller';

export default function Home(_: InferPageProps<AppsController, 'index'>) {
  const { isAuthenticated, user } = useUser();

  return (
    <ContentLayout>
      <div className="container">
        <div className="title">AdonisJS x Inertia x React</div>

        <span>
          Learn more about AdonisJS and Inertia.js by visiting the{' '}
          <a href="https://docs.adonisjs.com/guides/inertia">AdonisJS documentation</a>.
        </span>

        <span>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</span>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </ContentLayout>
  );
}
