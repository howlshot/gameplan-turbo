import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

const resolveRequestPath = (rootDir: string, requestUrl: string): string => {
  const url = new URL(requestUrl, "http://127.0.0.1");
  const pathname = decodeURIComponent(url.pathname);
  const normalizedPath = pathname === "/" ? "/index.html" : normalize(pathname);
  return resolve(join(rootDir, normalizedPath));
};

const isFileInsideRoot = (rootDir: string, filePath: string): boolean =>
  filePath.startsWith(resolve(rootDir));

const sendFile = (
  response: ServerResponse<IncomingMessage>,
  filePath: string
): void => {
  const extension = extname(filePath);
  const contentType = MIME_TYPES[extension] ?? "application/octet-stream";
  response.writeHead(200, {
    "Cache-Control": filePath.endsWith(".html") ? "no-store" : "public, max-age=31536000, immutable",
    "Content-Type": contentType
  });
  createReadStream(filePath).pipe(response);
};

export interface StaticServerHandle {
  close: () => Promise<void>;
  origin: string;
}

export const startStaticServer = async (rootDir: string): Promise<StaticServerHandle> =>
  new Promise((resolvePromise, reject) => {
    const server = createServer((request, response) => {
      if (!request.url) {
        response.writeHead(400).end("Bad request");
        return;
      }

      const requestedPath = resolveRequestPath(rootDir, request.url);
      const indexPath = resolve(rootDir, "index.html");

      if (!isFileInsideRoot(rootDir, requestedPath) || !existsSync(indexPath)) {
        response.writeHead(403).end("Forbidden");
        return;
      }

      const filePath =
        existsSync(requestedPath) && statSync(requestedPath).isFile()
          ? requestedPath
          : indexPath;

      sendFile(response, filePath);
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not determine static server address."));
        return;
      }

      resolvePromise({
        origin: `http://127.0.0.1:${address.port}`,
        close: async () =>
          new Promise((resolveClose, rejectClose) => {
            server.close((error) => {
              if (error) {
                rejectClose(error);
                return;
              }
              resolveClose();
            });
          })
      });
    });
  });
