import { join } from "node:path";
import { checkError, checkExpect, describe, test } from "@ubccpsc/210-toolkit";
import {
	EventRecord,
	formatSummary,
	type ImportSummary,
	loadEventsFromFile,
	loadEventsLenient,
	parseEventLine,
	parseLog,
	readLogFile,
	summarizeEvents,
} from "../src/importer";

const incoming = join("data", "incoming");
const archive = join("data", "archive");
void incoming;
void archive;

describe("parseEventLine", () => {
	test(
		"parseEventLine parses one valid line",
		checkExpect(() => parseEventLine("2026-01-01T10:00:00Z|INFO|boot"), {
			timestamp: "2026-01-01T10:00:00Z",
			level: "INFO",
			message: "boot",
		}),
	);

	test(
		"accepts WARN",
		checkExpect(() => parseEventLine("t|WARN|m").level, "WARN"),
	);

	test(
		"accepts ERROR",
		checkExpect(() => parseEventLine("t|ERROR|m").level, "ERROR"),
	);

	test(
		"throws when a field is missing",
		checkError(() => parseEventLine("2026-10-01T08:00|INFO")),
	);

	test(
		"throws when there are no separators",
		checkError(() => parseEventLine("just some text")),
	);

	test(
		"throws on an unknown level",
		checkError(() => parseEventLine("2026-10-01T08:00|DEBUG|hello")),
	);
});

describe("parseLog ignores blank lines and keeps order", () => {
	test(
		"returns two parsed entries",
		checkExpect(() => {
			const content = ["2026-01-01T10:00:00Z|INFO|boot", "", "2026-01-01T10:05:00Z|WARN|low battery"].join("\n");
			return parseLog(content).length;
		}, 2),
	);
	test(
		"keeps WARN as the second entry",
		checkExpect(() => {
			const content = ["2026-01-01T10:00:00Z|INFO|boot", "", "2026-01-01T10:05:00Z|WARN|low battery"].join("\n");
			return parseLog(content)[1].level;
		}, "WARN"),
	);
	test(
		"parses every valid line",
		checkExpect(() => parseLog("t1|INFO|a\nt2|WARN|b").length, 2),
	);

	test(
		"skips empty lines",
		checkExpect(() => parseLog("t1|INFO|a\n\nt2|ERROR|b\n").length, 2),
	);

	test(
		"empty content gives no events",
		checkExpect(() => parseLog(""), []),
	);

	test(
		"throws when a line is malformed",
		checkError(() => parseLog("t1|INFO|a\nbad line\nt3|WARN|c")),
	);
});

describe("readLogFile", () => {
	test(
		"reading day1.log results in a string with 3 lines",
		checkExpect(async () => {
			const content: string = await readLogFile("./data/incoming/day1.log");
			return content.split("\n").length;
		}, 3),
	);
	// TODO: any additional tests for readLogFile, if you like.
});

describe("loadEventsFromFile", () => {
	test(
		"reading day1.log yields 2 events",
		checkExpect(async () => {
			const ers: EventRecord[] = await loadEventsFromFile("./data/incoming/day1.log");
			return ers.length;
		}, 2),
	);

	test(
		"throws when the file does not exist",
		checkError(async () => await loadEventsFromFile("data/incoming/does-not-exist.log")),
	);

	test(
		"throws when a line is malformed",
		checkError(async () => await loadEventsFromFile("data/incoming/bad.log")),
	);
});

describe("loadEventsLenient", () => {
	test(
		"throws when the file does not exist",
		checkError(async () => await loadEventsLenient("data/incoming/does-not-exist.log")),
	);

	test(
		"throws when a line is malformed",
		checkError(async () => await loadEventsLenient("data/incoming/bad.log")),
	);
});

describe("summarizeEvents", () => {
	test(
		"summarizeEvents counts warnings and errors",
		checkExpect(
			() =>
				summarizeEvents([
					{ timestamp: "t1", level: "INFO", message: "a" },
					{ timestamp: "t2", level: "WARN", message: "b" },
					{ timestamp: "t3", level: "ERROR", message: "c" },
				]),
			{ totalEvents: 3, warnings: 1, errors: 1 },
		),
	);
});

describe("formatSummary", () => {
	test(
		"formatSummary renders one field per line",
		checkExpect(() => {
			const summary: ImportSummary = {
				totalFiles: 2,
				totalEvents: 4,
				warnings: 1,
				errors: 1,
			};
			return formatSummary(summary);
		}, "files=2\nevents=4\nwarnings=1\nerrors=1"),
	);
});

// TODO: add tests for writeSummaryFile
