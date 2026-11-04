import type { Dirent } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * One entry directly inside a directory: either a file or a subdirectory,
 * together with its full path.
 */
export type Entry = { kind: "file"; path: string } | { kind: "dir"; path: string };

/**
 * Lists the entries directly inside a directory, tagging each as a file or a
 * subdirectory. Given: it wraps Node's directory reader.
 *
 * @param dir the directory to list.
 * @returns the directory's immediate entries, each tagged "file" or "dir".
 */
export async function listEntries(dir: string): Promise<Entry[]> {
	const entries: Dirent[] = await readdir(dir, { withFileTypes: true });
	return entries.map(
		(entry: Dirent): Entry =>
			entry.isDirectory()
				? { kind: "dir", path: join(dir, entry.name) }
				: { kind: "file", path: join(dir, entry.name) },
	);
}

/**
 * Finds the path of every recording file anywhere under a directory, descending
 * into subdirectories. Given: read it once to see `await` inside recursion and
 * `Promise.all` waiting for every subfolder at once, then leave it alone.
 *
 * Precondition: `root` is an existing directory.
 *
 * @param root the directory to search.
 * @returns the path of every file beneath `root`, at any depth (empty if none).
 */
export async function listReadingFiles(root: string): Promise<string[]> {
	const entries = await listEntries(root);
	const files = entries.filter((entry) => entry.kind === "file").map((entry) => entry.path);
	const dirs = entries.filter((entry) => entry.kind === "dir").map((entry) => entry.path);
	const nested = await Promise.all(dirs.map((dir) => listReadingFiles(dir)));
	return files.concat(nested.flat());
}

//----- readDay ------//

/**
 * Reads one day's recording file and returns its temperatures in order. A blank
 * line marks a missing reading and is skipped, so a file with gaps yields fewer
 * than 24 temperatures.
 *
 * Precondition: `path` points to an existing recording file (not a directory).
 * If it does not, the returned promise rejects with the error `readFile` raised.
 *
 * Error-handling:
 *  - none. this function trusts the precondition on `path`.
 *
 * @param path the recording file to read.
 * @returns the temperatures recorded that day, in file order.
 */
export async function readDay(path: string): Promise<number[]> {
	const text = await readFile(path, "utf8");
	return text.split("\n").filter((line) => line !== "").map((line) => Number(line)); // 空行会先被过滤掉，然后进行格式转换
}
