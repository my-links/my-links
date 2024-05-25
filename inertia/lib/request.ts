import i18n from '~/i18n';

export async function makeRequest({
  method = 'GET',
  url,
  body,
  controller,
}: {
  method?: RequestInit['method'];
  url: string;
  body?: object | any[];
  controller?: AbortController;
}): Promise<any> {
  const request = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
    signal: controller ? controller.signal : undefined,
  });

  const data = await request.json();
  return request.ok
    ? data
    : Promise.reject(data?.error || i18n.t('common:generic-error'));
}
