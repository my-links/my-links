import { NextApiRequest, NextApiResponse } from "next";
import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { downloadImageFromUrl, getFavicon, makeRequestWithUserAgent } from "lib/request";
import { Favicon } from "types/types";
import { buildFaviconUrl, findFaviconPath } from "lib/url";
import { convertBase64ToBuffer, isBase64Image, isImage } from "lib/image";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const urlParam = (req.query?.url as string) || "";
  if (!urlParam) {
    throw new Error("URL is missing");
  }

  const faviconRequestUrl = buildFaviconUrl(urlParam, "/favicon.ico");
  try {
    return sendImage(res, await getFavicon(faviconRequestUrl));
  } catch (error) {
    console.error("[Favicon]", `[first: ${faviconRequestUrl}]`, "Unable to retrieve favicon from favicon.ico url");
  }

  const requestDocument = await makeRequestWithUserAgent(urlParam);
  const documentAsText = await requestDocument.text();

  const faviconPath = findFaviconPath(documentAsText);
  if (!faviconPath) {
    console.error("[Favicon]", `[first: ${faviconRequestUrl}]`, "No link/href attribute found");
    console.log(documentAsText);
    return sendDefaultImage(res);
  }

  const finalUrl = buildFaviconUrl(requestDocument.url, faviconPath);
  try {
    if (!faviconPath) {
      throw new Error("Unable to find favicon path");
    }

    if (isBase64Image(faviconPath)) {
      console.log("[Favicon]", `[second: ${faviconRequestUrl}]`, "info: base64, convert it to buffer");
      const buffer = convertBase64ToBuffer(faviconPath);
      return sendImage(res, {
        buffer,
        type: "image/x-icon",
        size: buffer.length,
        url: faviconPath
      });
    }

    const finalUrl = buildFaviconUrl(requestDocument.url, faviconPath);
    const favicon = await downloadImageFromUrl(finalUrl);
    if (!isImage(favicon.type)) {
      throw new Error("Favicon path does not return an image");
    }

    console.log("[Favicon]", `[second: ${finalUrl}]`, "success: image found");
    return sendImage(res, favicon);
  } catch (error) {
    const errorMessage = error?.message || "Unable to retrieve favicon";
    console.log("[Favicon]", `[second: ${finalUrl}], error:`, errorMessage);
    return sendDefaultImage(res);
  }
}

function sendImage(res: NextApiResponse, { buffer, type, size }: Favicon) {
  res.setHeader("Content-Type", type);
  res.setHeader("Content-Length", size);
  res.send(buffer);
}

function sendDefaultImage(res: NextApiResponse) {
  const readStream = createReadStream(
    resolve(process.cwd(), "./public/empty-image.png")
  );
  res.writeHead(206);
  readStream.pipe(res);
}
