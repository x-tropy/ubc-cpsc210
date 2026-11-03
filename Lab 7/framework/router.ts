// src/framework/router.ts

/** 一个 HTTP 请求：只保留处理函数需要的部分。 */
export type HttpRequest = {
	/** 路径参数，例如模式 "/archive/:year" 匹配 "/archive/2025" 得到 { year: "2025" }。 */
	params: Record<string, string>;
	/** 查询参数，例如 "?below=2.5" 得到 { below: "2.5" }，值始终是字符串。 */
	query: Record<string, string>;
};

/** 一个 HTTP 响应：状态码加上响应主体。 */
export type HttpResponse = {
	status: number;
	body: unknown;
};

/** 处理函数：接收请求和服务，返回响应的 Promise。 */
export type Handler<S> = (request: HttpRequest, service: S) => Promise<HttpResponse>;

/** 一条路由：HTTP 方法、路径模式和对应的处理函数。 */
export type Route<S> = {
	method: "GET";
	pattern: string;
	handler: Handler<S>;
};

/**
 * 创建一个成功的响应。
 *
 * @param status 状态码，例如 200。
 * @param body 响应主体。
 * @returns { status, body }。
 */
export function respond(status: number, body: unknown): HttpResponse {
	return { status, body };
}

/** respond 的别名，对应 README 中提到的 success(...)。 */
export const success = respond;

/**
 * 创建一个失败的响应，主体为 { error: message }。
 *
 * @param status 状态码，例如 404。
 * @param message 错误信息。
 * @returns { status, body: { error: message } }。
 */
export function fail(status: number, message: string): HttpResponse {
	return { status, body: { error: message } };
}

/**
 * 尚未实现的处理函数所返回的桩响应：一个 501 响应的 Promise。
 *
 * @param name 尚未实现的功能名称。
 * @returns 一个解析为 501 响应的 Promise。
 */
export function notImplemented(name: string): Promise<HttpResponse> {
	return Promise.resolve(fail(501, `${name} is not implemented`));
}

/**
 * 尝试用模式匹配路径，成功则返回路径参数，失败返回 undefined。
 * 按 "/" 分段后逐段比较，以 ":" 开头的段是参数，其余段必须完全相等。
 * 因此 "/archive/days" 与 "/archive/:year/:month/:day" 不会冲突（段数不同）。
 */
function matchPattern(pattern: string, path: string): Record<string, string> | undefined {
	const patternParts = pattern.split("/").filter((part) => part !== "");
	const pathParts = path.split("/").filter((part) => part !== "");
	if (patternParts.length !== pathParts.length) {
		return undefined;
	}
	const params: Record<string, string> = {};
	for (let i = 0; i < patternParts.length; i++) {
		const expected = patternParts[i] ?? "";
		const actual = pathParts[i] ?? "";
		if (expected.startsWith(":")) {
			params[expected.slice(1)] = decodeURIComponent(actual);
		} else if (expected !== actual) {
			return undefined;
		}
	}
	return params;
}

/**
 * 把一个 GET 请求分发给第一条匹配的路由。
 *
 * @param routes 路由表。
 * @param service 传给处理函数的服务。
 * @param url 请求的路径，可以带查询参数，例如 "/archive/days?below=2.5"。
 * @returns 处理函数的响应；没有匹配的路由时返回 404 和 "no route matches"。
 */
export function dispatchGet<S>(routes: Route<S>[], service: S, url: string): Promise<HttpResponse> {
	const parsed = new URL(url, "http://localhost");
	const query = Object.fromEntries(parsed.searchParams);
	for (const route of routes) {
		if (route.method !== "GET") {
			continue;
		}
		const params = matchPattern(route.pattern, parsed.pathname);
		if (params !== undefined) {
			return route.handler({ params, query }, service);
		}
	}
	return Promise.resolve(fail(404, `no route matches ${parsed.pathname}`));
}
