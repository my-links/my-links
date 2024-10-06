export const isImage = (type: string) => type.includes('image');

export const isBase64Image = (data: string) => data.startsWith('data:image/');

export const convertBase64ToBuffer = (base64: string) =>
	Buffer.from(base64, 'base64');
