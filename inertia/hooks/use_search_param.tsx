import { usePage } from '@inertiajs/react';

const useSearchParam = (urlParam: string) => {
	const { url } = usePage();
	const urlParams = url.split('?');
	urlParams.shift();

	const urlSearchParam = new URLSearchParams(urlParams.join(''));
	return urlSearchParam.get(urlParam);
};

export default useSearchParam;
