(async () => {
	const request = await fetch("https://sdtream.sonnydata.fr");
	const text = await request.text();

	const faviconPath = findFaviconPath(text);
	if (!faviconPath) {
		return console.log("Unable to find favicon path");
	}

	if (isBase64Image(faviconPath)) {
		console.log("base64, convert it to buffer");
		const buffer = convertBase64ToBuffer(faviconPath);
		return console.log(buffer);
	}

	const pathWithoutFile = popLastSegment(request.url);
	console.log("pathWithoutFile", pathWithoutFile);

	const result = buildFaviconUrl(faviconPath, pathWithoutFile);
	console.log(result);
})();

function findFaviconPath(text) {
	const regex = /rel=['"](?:shortcut )?icon['"] href=['"]([^?'"]+)[?'"]/i;
	const found = text.match(regex);
	if (!found) {
		return console.warn("nothing, exit");
	}

	const faviconPath = found?.[1];
	return faviconPath || null;
}

function popLastSegment(url = "") {
	const { href } = new URL(url);
	const pathWithoutFile = href.split("/");
	pathWithoutFile.pop();
	return pathWithoutFile.join("/") || "";
}

function buildFaviconUrl(faviconPath, pathWithoutFile) {
	if (faviconPath.startsWith("http")) {
		console.log("startsWith http, result", faviconPath);
		return faviconPath;
	} else if (faviconPath.startsWith("/")) {
		console.log("startsWith /, result", pathWithoutFile + faviconPath);
		return pathWithoutFile + faviconPath;
	} else {
		console.log("else, result", pathWithoutFile + "/" + faviconPath);
		return pathWithoutFile + "/" + faviconPath;
	}
}

function isBase64Image(data) {
	return data.startsWith("data:image/");
}

function convertBase64ToBuffer(base64 = "") {
	return new Buffer.from(base64, "base64");
}
