import { routes } from "../routes";
import { type ArchiveService, startService } from "../service";
import { dispatch, type HttpResponse } from "./router";

/**
 * NOTE: You will not need to modify this file.
 *
 * The test client runs the service in-process and calls handlers directly
 * through `dispatch`, so a test checks status codes and bodies without any
 * HTTP. `get` is all this activity needs: it starts a service on the archive,
 * performs one GET, and returns the response record.
 *
 *   const response = await get("/archive/2025/jan/01");
 *   response.status   // 200
 *   response.body     // [-2, -2, -3, ...]
 */
export type TestClient = {
	/** GET `path`, which may carry a query string: "/archive/days?below=2". */
	get: (path: string) => Promise<HttpResponse>;
};

/**
 * Starts a client on the archive rooted at `root`. Lab 3 uses this form
 * directly; here you will normally call `get` instead.
 *
 * @param root the archive directory.
 * @returns a client whose `get` dispatches to the handlers in routes.ts.
 */
export async function startTestClient(root: string): Promise<TestClient> {
	const service = await startService(root);
	return {
		get: (path: string): Promise<HttpResponse> => dispatch(routes, service, "GET", path, undefined),
	};
}

/**
 * Performs one GET against a fresh service on the archive. Every call starts
 * its own service, so tests cannot interfere with one another.
 *
 * @param path the path to GET, e.g. "/archive/average".
 * @param root the archive directory (defaults to the workspace's data/).
 * @returns the handler's response: { status, body }.
 */
export async function get(path: string, root: string = "data"): Promise<HttpResponse> {
	const client = await startTestClient(root);
	return client.get(path);
}
