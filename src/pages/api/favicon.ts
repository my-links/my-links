import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "node-html-parser";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.54";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const urlParam = (req.query?.url as string) || "";
  if (!urlParam) {
    throw new Error("URL's missing");
  }

  const urlRequest = urlParam + "/favicon.ico";
  try {
    const { favicon, type, size } = await downloadImageFromUrl(
      urlRequest + "/favicon.ico"
    );
    console.log("[Favicon]", `[first: ${urlRequest}]`, "request");
    if (size === 0) {
      throw new Error("Empty favicon");
    }
    if (!isImage(type)) {
      throw new Error("Favicon path does not return an image");
    }
    return sendImage({
      content: favicon,
      res,
      type,
      size,
    });
  } catch (error) {
    const errorMessage = error?.message || "Unable to retrieve favicon";
    console.error("[Favicon]", `[first: ${urlRequest}]`, errorMessage);
  }

  try {
    console.log("[Favicon]", `[second: ${urlRequest}]`, "new request");
    const requestDocument = await makeRequest(urlRequest);
    const text = await requestDocument.text();

    const faviconPath = findFaviconPath(text);
    if (!faviconPath) {
      throw new Error("Unable to find favicon path");
    }

    if (isBase64Image(faviconPath)) {
      console.log("base64, convert it to buffer");
      const buffer = convertBase64ToBuffer(faviconPath);
      return sendImage({
        content: buffer,
        res,
        type: "image/x-icon",
        size: buffer.length,
      });
    }

    const pathWithoutFile = popLastSegment(requestDocument.url);
    const finalUrl = buildFaviconUrl(faviconPath, pathWithoutFile);

    const { favicon, type, size } = await downloadImageFromUrl(finalUrl);
    if (!isImage(type)) {
      throw new Error("Favicon path does not return an image");
    }

    return sendImage({
      content: favicon,
      res,
      type,
      size,
    });
  } catch (error) {
    const errorMessage = error?.message || "Unable to retrieve favicon";
    console.log("[Favicon]", `[second: ${urlRequest}]`, errorMessage);
    res.status(404).send({ error: errorMessage });
  }
}

async function makeRequest(url: string) {
  const headers = new Headers();
  headers.set("User-Agent", USER_AGENT);

  const request = await fetch(url, { headers, redirect: "follow" });
  return request;
}

async function downloadImageFromUrl(url: string): Promise<{
  favicon: Buffer;
  url: string;
  type: string;
  size: number;
}> {
  const request = await makeRequest(url);
  const blob = await request.blob();

  return {
    favicon: Buffer.from(await blob.arrayBuffer()),
    url: request.url,
    type: blob.type,
    size: blob.size,
  };
}

function sendImage({
  content,
  res,
  type,
  size,
}: {
  content: Buffer;
  res: NextApiResponse;
  type: string;
  size: number;
}) {
  res.setHeader("Content-Type", type);
  res.setHeader("Content-Length", size);
  res.send(content);
}

const selectors = [
  "link[rel='icon']",
  "link[rel='shortcut icon']",
  "link[rel='apple-touch-icon']",
  "link[rel='apple-touch-icon-precomposed']",
  "link[rel='apple-touch-startup-image']",
  "link[rel='mask-icon']",
  "link[rel='fluid-icon']",
];

function findFaviconPath(text) {
  const document = parse(text);
  const links = document.querySelectorAll(selectors.join(", "));
  const link = links.find(
    (link) => !link.getAttribute("href").startsWith("data:image/")
  );
  if (!link || !link.getAttribute("href")) {
    throw new Error("No link/href attribute found");
  }

  return link.getAttribute("href");
}

function popLastSegment(url = "") {
  const { href } = new URL(url);
  const pathWithoutFile = href.split("/");
  pathWithoutFile.pop();
  return pathWithoutFile.join("/") || "";
}

function buildFaviconUrl(faviconPath, pathWithoutFile) {
  if (faviconPath.startsWith("http")) {
    return faviconPath;
  } else if (faviconPath.startsWith("/")) {
    return pathWithoutFile + faviconPath;
  } else {
    return pathWithoutFile + "/" + faviconPath;
  }
}

function isImage(type: string) {
  return type.includes("image");
}

function isBase64Image(data) {
  return data.startsWith("data:image/");
}

function convertBase64ToBuffer(base64 = ""): Buffer {
  const buffer = Buffer.from(base64, "base64");
  return buffer;
}
