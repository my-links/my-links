const BASE64_MARKER = ';base64';

export function decodeDataUri(dataUri: string): Buffer | undefined {
	const separatorIndex = dataUri.indexOf(',');
	if (separatorIndex === -1) {
		return undefined;
	}

	const header = dataUri.slice(0, separatorIndex).toLowerCase();
	const payload = dataUri.slice(separatorIndex + 1);

	if (header.endsWith(BASE64_MARKER)) {
		return Buffer.from(payload, 'base64');
	}

	return decodePercentEncoded(payload);
}

function decodePercentEncoded(payload: string): Buffer | undefined {
	try {
		return Buffer.from(decodeURIComponent(payload), 'utf8');
	} catch {
		return undefined;
	}
}
