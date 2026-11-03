import { checkExpect, describe, test } from "@ubccpsc/210-toolkit/testing";
import { readDay } from "../archive";
import { get } from "../testClient";

// These tests are written for you. Read them as the specification: each one
// names a request and the exact response it expects. They fail with a 501
// until you replace the stub they exercise, and they pass when you are done.
//
// Every thunk is `async` and `await`s the call inside it. `get` starts a fresh
// service on data/ for every call, so no test can interfere with another.

const TEMPS_2025JAN01 = [-2, -2, -3, -2, -2, -1, 1, 2, 3, 4, 6, 6, 7, 7, 7, 6, 6, 5, 3, 2, 1, -1];
const TEMPS_2025JAN02 = [-1, -2, -3, -3, -3, -2, -1, 0, 1, 3, 5, 6, 7, 8, 9, 9, 9, 8, 7, 6, 5, 3, 1, 0];

describe("TASK 1: readDay", () => {
	test(
		"reads a complete day's temperatures, in order",
		checkExpect(async () => await readDay("data/2025/01/02.txt"), TEMPS_2025JAN02),
	);
	test(
		"skips the blank lines of a day with missing readings",
		checkExpect(async () => await readDay("data/2025/01/01.txt"), TEMPS_2025JAN01),
	);
});

describe("TASK 2: GET /archive/:year/:month/:day", () => {
	test(
		"serves one day's temperatures",
		checkExpect(async () => await get("/archive/2025/01/02"), { status: 200, body: TEMPS_2025JAN02 }),
	);
	test(
		"serves a day with missing readings, blanks skipped",
		checkExpect(async () => await get("/archive/2025/01/01"), { status: 200, body: TEMPS_2025JAN01 }),
	);
	test(
		"is a 404 for a date the archive has no recording for",
		checkExpect(async () => (await get("/archive/2025/01/03")).status, 404),
	);
	test(
		"is a 404 for a month that does not exist",
		checkExpect(async () => (await get("/archive/2025/03/01")).status, 404),
	);
});

describe("TASK 3: GET /archive/days?below=N", () => {
	// Daily averages, in date order: 2024/12/31 is 1.41, 2025/01/01 is 2.41, 2025/01/02 is 3, 2025/02/14 is 5.
	test(
		"lists the days colder than the threshold, in date order",
		checkExpect(async () => await get("/archive/days?below=2.5"), {
			status: 200,
			body: ["2024/12/31", "2025/01/01"],
		}),
	);
	test(
		"does not list a day whose average is exactly the threshold",
		checkExpect(async () => (await get("/archive/days?below=3")).body, ["2024/12/31", "2025/01/01"]),
	);
	test(
		"is an empty 200 when no day qualifies",
		checkExpect(async () => await get("/archive/days?below=-10"), { status: 200, body: [] }),
	);
});

describe("TASK 4: GET /archive/average", () => {
	test(
		"averages every reading in the archive",
		checkExpect(async () => await get("/archive/average"), { status: 200, body: 3 }),
	);
});

// STRETCH: GET /archive/months. Not graded; uncomment once listMonths is
// written. The expected averages are exact fractions of the shipped files:
// December pools 31 over 22 readings, January 125 over 46, February 120 over 24.

describe("STRETCH: GET /archive/months", () => {
	test(
		"summarises each month of the archive, in date order",
		checkExpect(async () => await get("/archive/months"), {
			status: 200,
			body: [
				{ month: "2024/12", days: 1, average: 31 / 22, coldest: "2024/12/31" },
				{ month: "2025/01", days: 2, average: 125 / 46, coldest: "2025/01/01" },
				{ month: "2025/02", days: 1, average: 5, coldest: "2025/02/14" },
			],
		}),
	);
});
