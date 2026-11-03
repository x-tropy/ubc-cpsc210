// src/start.ts
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { dispatch, type HttpMethod } from "./framework/router";
import { routes } from "./routes";
import { startService } from "./service";

const METHODS: readonly string[] = ["GET", "POST", "PUT", "DELETE"];

/** 读取请求体；没有请求体时返回 undefined，不是合法 JSON 时返回原始字符串。 */
async function readBody(req: IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(chunk as Buffer);
    }
    const text = Buffer.concat(chunks).toString("utf8");
    if (text === "") {
        return undefined;
    }
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

/** 把一个 { status, body } 写成 JSON 响应。 */
function send(res: ServerResponse, status: number, body: unknown): void {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(body));
}

async function main(): Promise<void> {
    // 用法：pnpm tsx src/start.ts [档案目录] [端口]
    const root = process.argv[2] ?? "data";
    const port = Number(process.argv[3] ?? 3000);

    const service = await startService(root);

    const server = createServer((req, res) => {
        void (async () => {
            try {
                const method = req.method ?? "GET";
                if (!METHODS.includes(method)) {
                    send(res, 405, { error: `不支持的方法 ${method}` });
                    return;
                }
                const body = method === "GET" ? undefined : await readBody(req);
                const response = await dispatch(routes, service, method as HttpMethod, req.url ?? "/", body);
                send(res, response.status, response.body);
            } catch (error) {
                console.error(error);
                send(res, 500, { error: "服务器内部错误" });
            }
        })();
    });

    server.listen(port, () => {
        console.log(`正在为档案 "${root}"（共 ${service.files.length} 个文件）提供服务：http://localhost:${port}`);
    });
}

void main();
