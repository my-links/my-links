import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "node-html-parser";
import { createReadStream } from "node:fs";
import { resolve } from "node:path";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0";

interface Favicon {
  buffer: Buffer;
  url: string;
  type: string;
  size: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const urlParam = (req.query?.url as string) || "";
  if (!urlParam) {
    throw new Error("URL is missing");
  }

  const { origin, href } = new URL(urlParam);

  const faviconRequestUrl = origin + "/favicon.ico";
  try {
    return sendImage(res, await getFavicon(faviconRequestUrl));
  } catch (error) {
    const errorMessage =
      error?.message || "Unable to retrieve favicon from favicon.ico url";
    console.error("[Favicon]", `[first: ${faviconRequestUrl}]`, errorMessage);
  }

  const requestDocument = await makeRequest(href);
  const documentAsText = await requestDocument.text();
  try {
    const faviconPath = findFaviconPath(documentAsText);
    if (!faviconPath) {
      throw new Error("Unable to find favicon path");
    }

    if (isBase64Image(faviconPath)) {
      console.log(
        "[Favicon]",
        `[first: ${faviconRequestUrl}]`,
        "base64, convert it to buffer",
      );
      const buffer = convertBase64ToBuffer(faviconPath);
      return sendImage(res, {
        buffer,
        type: "image/x-icon",
        size: buffer.length,
        url: faviconPath,
      });
    }

    const { href } = new URL(requestDocument.url);
    const finalUrl = href + faviconPath;

    const favicon = await downloadImageFromUrl(finalUrl);
    if (!isImage(favicon.type)) {
      throw new Error("Favicon path does not return an image");
    }

    return sendImage(res, favicon);
  } catch (error) {
    const errorMessage = error?.message || "Unable to retrieve favicon";
    console.log("[Favicon]", `[second: ${faviconRequestUrl}]`, errorMessage);

    const readStream = createReadStream(
      resolve(process.cwd(), "./public/empty-image.png"),
    );
    res.writeHead(206);
    readStream.pipe(res);
  }
}

async function makeRequest(url: string) {
  const headers = new Headers();
  headers.set("User-Agent", USER_AGENT);

  return await fetch(url, { headers, redirect: "follow" });
}

async function downloadImageFromUrl(url: string): Promise<Favicon> {
  const request = await makeRequest(url);
  if (!request.ok) {
    throw new Error("Request failed");
  }

  const blob = await request.blob();
  return {
    buffer: Buffer.from(await blob.arrayBuffer()),
    url: request.url,
    type: blob.type,
    size: blob.size,
  };
}

function sendImage(res: NextApiResponse, { buffer, type, size }: Favicon) {
  res.setHeader("Content-Type", type);
  res.setHeader("Content-Length", size);
  res.send(buffer);
}

const rels = [
  "icon",
  "shortcut icon",
  "apple-touch-icon",
  "apple-touch-icon-precomposed",
  "apple-touch-startup-image",
  "mask-icon",
  "fluid-icon",
];

function findFaviconPath(text: string) {
  const document = parse(text);
  const favicon = Array.from(document.getElementsByTagName("link")).find(
    (element) =>
      rels.includes(element.getAttribute("rel")) &&
      element.getAttribute("href"),
  );

  if (!favicon) {
    throw new Error("No link/href attribute found");
  }

  return favicon.getAttribute("href");
}

function isImage(type: string) {
  return type.includes("image");
}

function isBase64Image(data: string) {
  return data.startsWith("data:image/");
}

function convertBase64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}

async function getFavicon(url: string): Promise<Favicon> {
  if (!url) throw new Error("Missing URL");

  const { origin } = new URL(url);
  const favicon = await downloadImageFromUrl(url);
  if (!isImage(favicon.type) || favicon.size === 0) {
    throw new Error("Favicon path does not return an image");
  }

  return favicon;
}
