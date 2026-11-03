Activity Tasks: Error Handling in a File Import Pipeline
This activity practices Chapter 8, as well as provides provides extra practice with handling the file system.

You are building a tiny file-import pipeline for sensor event logs. Here's a user story:

As the operator of a sensor network, I want event-log files imported and summarized even when some lines or files are malformed, so that a single bad record neither corrupts the summary nor hides the failure.

Each log file contains one event per line in this format:

<timestamp>|<level>|<message>

where <level> must be one of INFO, WARN, or ERROR.

Files:

src/importer.ts
test/importer.test.ts
data/incoming/* (input fixtures).
data/archive/ (output location).
General Notes
You may want to refer to the Node documentation for additional file-handling APIs.

While all the functions you implement have fixed argument/return types, you may have to mark some of them async.

TASK 1: Basics of Throwing and Catching While Parsing
In this task, you will practice the basics of throwing (and catching and re-throwing) errors, by implementing the basics of the log parser. You will also practice writing tests for functions that throw errors.

Implement parseEventLine in importer.ts:
/**
 * Parses one event line in the format:
 *   <timestamp>|<level>|<message>
 * into an EventRecord. Checks that <level> is one of the
 * legal levels. Does not check the format of <timestamp>
 * or <message>.
 *
 * @param line the line to parse into an EventRecord
 * @returns an EventRecord containing the timestamp, level, and message logged.
 * @throws {Error} "malformed event line: <line>" when fields are missing or
 * level is not INFO/WARN/ERROR.
 */
export function parseEventLine(line: string): EventRecord {
	throw new Error("TODO");
}

Add any additional tests necessary for parseEventLine to importer.test.ts.

implement parseLog in importer.ts:

/**
 * Parses a whole log file content (one event per line).
 * Ignores empty lines.
 *
 * @param content log file contents as a single string.
 * @returns an array of EventRecord, one for each non-empty
 * @throws {Error} when any non-empty line is malformed, with
 * message "line <n>: malformed".
 */
export function parseLog(content: string): EventRecord[] {
	throw new Error("TODO");
}

Hint: you may find template strings' "string interpolation" feature useful. These allow you to write things like:

const x: number = 3;
const msg: string = `my number: ${x}` // will be "my number: 3"

Add any additional tests necessary for parseLog to importer.test.ts.
Done when: malformed lines fail fast and valid lines parse correctly.

TASK 2: Basics of Error Propagation
In these tasks, you will practice propagating errors from callee to caller when the caller cannot meaningfully recover from the callee's error. (Done correctly, this propagation might seem too simple to be given to you as practice: as an ungraded thought exercise, contrast this with how you would have handled the situation if the callee had returned a Result type.)

Implement readLogFile in importer.ts:
/**
 * Reads a log file from disk.
 *
 * @param path the fully-qualified filename of a log file
 * @returns the contents of the file `path` as a string
 * @throws {Error} any fs/promises read error (e.g. ENOENT).
 */
export function readLogFile(path: string): Promise<string> {
	throw new Error("TODO");
}

Hint: it's simpler than you might think.

(Optional) Implement any additional tests for readLogFile.

Implement loadEventsFromFile in importer.ts:

/**
 * Loads and parses events from one file.
 *
 * @param path the fully-qualified filename of a log file
 * @returns the contents of the file as EventRecord[] (each non-empty
 * log line as an EventRecord)
 * @throws {Error} read errors from readLogFile and parse errors from parseLog.
 */
export function loadEventsFromFile(path: string): Promise<EventRecord[]> {
	throw new Error("TODO");
}

Implement any additional tests for loadEventsFromFile.
Done when: a missing input file causes the call to throw to its caller.

TASK 2.5: An Error Propagation Anti-Pattern
loadEventsLenient is currently following a software design anti-pattern. It "swallows" errors by catching them and simply returning a feasible return value. So its caller has no idea whether there were no events at the path or whether the path did not exist.

Write tests for loadEventsLenient that ensure it propagates file-not-found errors rather than silently swallowing them.

Refactor loadEventsLenient in importer.ts so it doesn't silently swallow errors:

/**
 * Anti-pattern starter: this function swallows all errors and hides failures.
 *
 * Refactor this so it does not silently convert failures into empty results.
 */
export async function loadEventsLenient(path: string): Promise<EventRecord[]> {
	try {
		return await loadEventsFromFile(path);
	} catch {
		return [];
	}
}

Done when: a missing input file causes loadEventsLenient to throw.

TASK 3: Graceful Local Recovery
In this task, you will practice handling some errors and propagating others. You will also practice using operations that interact with the file system other than readFile. You may want to refer to the Node documentation for additional file-handling APIs. (And you're welcome to use a search engine to search for things like "creating a directory in typescript"---but we suggest using functions from the Node promises API linked previously.)

Implement writeSummaryFile in importer.ts:
/**
 * Writes a summary report to file.
 *
 * If writing fails because a parent directory is missing (ENOENT), creates the
 * directory and retries once. Re-throws all other errors.
 *
 * @param reportPath the path to write the summary report to
 * @param summary the ImportSummary to write
 * @throws {Error} non-ENOENT write errors.
 */
export function writeSummaryFile(reportPath: string, summary: ImportSummary): Promise<void> {
	// TODO: you may want to look at the helpers above.
	throw new Error("TODO");
}

Write tests for writeSummaryFile.
Done when: writing to a not-yet-created report directory succeeds.

(UNGRADED) TASK 4: Keeping the Happy Path Clean
This is a "stretch" task, and ungraded. You can return to it when you're ready for more practice with handling exceptions, and the file system. stretch.test.ts contains two tests for this function, which you can choose to expand.

In this task, you will see another example (beyond Task 2) of how exceptions allow us to keep the "happy path" (non-erroneous path) of code cleaner.

Implement importLogs in importer.ts:
/**
 * Loads a list of log files and writes a summary report of all files if
 * all files are valid log files.
 *
 * Stops at the first failing log file and passes the error up unchanged;
 * in this case no summary report will be written
 *
 * @param filePaths a list of log files to import and summarize
 * @param reportPath the path to which to write a report.
 * @throws {Error} first read/parse/write failure encountered.
 */
export function importLogs(filePaths: string[], reportPath: string): Promise<ImportSummary> {
	throw new Error("TODO");
}

Check that the importLogs tests in stretch.test.ts pass. Write any additional tests, if you like.
Done when: success path reads as sequence: load -> count -> write.

(UNGRADED) TASK 5: Boundary Handling
This is a "stretch" task, and ungraded. You can return to it when you're ready for more practice with handling exceptions, and the file system. stretch.test.ts contains one test for this function, which you can choose to expand.

In this task, you will practice handling errors at a function which should not throw errors, but should be able to report the presence of errors. We have seen two ways of reporting data at caller/callee boundaries: exceptions (which the caller must catch), and via return values. This function shows us an alternate design, where the function takes in a report function, which serves as the boundary between importer.ts and its caller.

If you find this alternate design difficult to think about, you could start by refactoring runImportJob to return a boolean that represents success/failure.

Implement runImportJob in importer.ts:

Check that the importLogs test in stretch.test.ts pass. Write any additional tests, if you like.

Done when: callers get either a real summary or a clear failure report.

Advanced Tips on Testing with the Filesystem
This is slightly advanced material, provided for reference. It is not within scope of Chapter 8.

If you found it tedious to write tests interacting with the file system, you may want to acquaint yourself with memfs.

Here's a piece of code (using Chapter 9-style tests) from a codebase we may have you build on later in the course showing use of memfs for testing:

import { expect } from "chai";
import { marked } from "marked";
import { vol } from "memfs";
import { beforeEach, describe, test, vi } from "vitest";
import { EditableFile, ImageFile, PDFFile } from "../../../src/server/data/file.js";

vi.mock("node:fs");
vi.mock("node:fs/promises");

// Crucial; reset the volume before each use
beforeEach(() => {
	vol.reset();
});

describe("Editable files", () => {
	test("render an editable file", async () => {
		// models a filesystem with a single file at path
		// "/workspace/x-no-cpsc-210/my_stuff.md", with the contents
		// "# Hello\n\n World!"
		vol.fromJSON({
			"/workspace/x-no-cpsc-210/my_stuff.md": "# Hello\n\n World!",
		});
		const someMarkdown: EditableFile = new EditableFile("my_stuff.md", "/workspace/x-no-cpsc-210", "CPSC 210");
		const htmlOut: string = wrapMarkdownHtml(await marked.parse("# Hello\n\n World!"));
		expect(await someMarkdown.getHtml()).to.equal(htmlOut);
	});
);