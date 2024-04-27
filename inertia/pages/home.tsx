import { InferPageProps } from '@adonisjs/inertia/types';
import { Head } from '@inertiajs/react';
import useUser from '~/hooks/use_user';
import type AppsController from '../../app/controllers/apps_controller';

export default function Home(_: InferPageProps<AppsController, 'index'>) {
  const { isAuthenticated, user } = useUser();

  return (
    <>
      <Head title="Homepage" />

      <div className="container">
        <div className="title">AdonisJS x Inertia x React</div>

        <span>
          Learn more about AdonisJS and Inertia.js by visiting the{' '}
          <a href="https://docs.adonisjs.com/guides/inertia">AdonisJS documentation</a>.
        </span>

        <span>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</span>
        <span>
          {isAuthenticated ? <a href="/auth/logout">Logout</a> : <a href="/auth/login">Login</a>}
        </span>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </>
  );
}
