import { useRouter } from 'next/router';

export default function useQueryParam(param: string) {
  const router = useRouter();
  const queryParam = (router.query[param] as string) || '';

  const clearQuery = () => {
    if (!!queryParam) {
      router.replace({
        query: undefined,
      });
    }
  };

  return {
    queryParam,
    clearQuery,
  };
}
