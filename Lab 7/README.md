Activity: Serving a Weather Archive
This activity has 3 goals. The most important (sub-)goals are bolded:

Getting you practice with async/await.
Getting you practice with writing code in a larger code-base:
Navigating a code base;
Learning which operations exist in a code base; and
Composing existing operations to achieve a larger goal.
Familiarizing you with the web framework you will use in Labs 3, 4, (and possibly in Part 2 of your project).
Because the main goals are practicing async/await and composing operations, this README contains extensive hints, so you need not navigate the code-base yourself to find relevant operations. We recommend you do the activity with these hints.

If you want to practice navigating a larger codebase, you can ignore these hints. Note: this path will take you a long time. The section "Finding Your Way Around" in DETAILS.md describes the purpose of each file. DETAILS.md also describes the web framework this code uses.

Domain
Here's our user story:

As a climate researcher, I want to ask a small web service about an archive of weather recordings, so that I can pull one day's readings, find the cold days, or get the overall average without opening any files myself.

The weather archives in archive/ and data/ contains recordings for each day, so year/month/day.txt contains the recordings for the date year-month-day. Each day has one hourly reading per line. A full day is 24 lines. Lines will be blank when a reading never came in.

You'll test your code over the test archive in data:

data/
  2024/
    12/
      31.txt      // 22 readings (2 missing), average temp 1.41
  2025/
    01/
      01.txt      // 22 readings (2 missing), average temp 2.41
      02.txt      // 24 readings, average temp 3
    02/
      14.txt      // 24 readings, average temp 5

Over this data, the average temperature is exaxtly 3.

Files:

src/archive.ts — readDay (you build this); listEntries and listReadingFiles are given.
src/handlers.ts — the request handlers: getAverage is given and finished, getDay and listDaysBelow you build. listMonths is the stretch task.
test/archive.test.ts — your checkExpect tests, written for you this week.
Tests
You've already had plenty of practice writing tests, so in this activity we're giving you the tests directly (Yay?). You can find the tests in test/archive.test.ts

This code base builds a web service. You'll be finishing up the code to support a few web requests, notably some GET requests. In the tests, we have a get helper that dispatches the GET request directly:

test("serves one day's temperatures",
	checkExpect(async () => await get("/archive/2025/01/02"), { status: 200, body: TEMPS_2025JAN02 }));

test("is a 404 for a date the archive has no recording for",
	checkExpect(async () => (await get("/archive/2025/01/03")).status, 404));

Web requests return a {status, body}, where status is a number (that corresponds to a status code), and body is the data returned. You can create new requests with success(...) and fail(...): see the hints for task 2 & 3, or "The framework in five minutes" in DETAILS.md.

Note in the second test, we use (await get(...)).status to get the field status from the value returned by await. (The parentheses matter because a Promise does not have status.)

Before you've written any code, pnpm test should report that all 10 tests fail; this is intentional.

The commented-out block of tests at the bottom is for the stretch task; leave commented-out unless you want to do the stretch task.

Workflow
Work in order. The later tasks depend on the earlier ones.
After each task, run pnpm test. Check that the tests for the task pass and that nothing that passed before has broken.
For Tasks 2 and 3, if your tests fail with a 501 return code, that means the stub is still there. If the tests fail with a 404 with message no route matches, the path passed to get() has a typo.
TASK 1: Read one day
Fill in the body of readDay(path: string): Promise<number[]> in src/archive.ts.
/**
 * Reads one day's recording file and returns its temperatures in order. 
 * Missing readings (empty lines in the recording files) are skipped.
 * I.e., a file with missing readings yields fewer than 24 temperatures.
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
export function readDay(path: string): Promise<number[]> {
	// TODO (TASK 1): complete the function body, following the hints in README.md
	return Promise.reject(new Error("readDay is not implemented: " + path)); // stub
}

Hints:

you can trust that the file at path exists
you can trust that that file consist only of:
lines with a single number on them; or
empty lines
await readFile(path, "utf8") returns the contents of the file at path as a string.
a function that has an await needs to be marked async
async functions that return a Promise<T> automatically wrap return values of type T in a promise.
s.split("\n") returns the array of strings you get by splitting the string s at each occurrence of "\n" (the newline character)
a blank line will appear as "" in the array.
Number(s) converts a string into a number, i.e. Number(-3) === -3
Unfortunately Number("") === 0, which is probably not what you want to do with a blank line.
Done when: the two TASK 1 tests pass, and the TASK 4 test passes (getAverage calls readDay, but is otherwise done).

TASK 2: Serve one day
Fill in the body of getDay(request, service) in src/handlers.ts:
/**
 * Get one day's temperatures in order, skipping blank lines.
 * The day is encoded in `request`'s parameters.
 * 
 * Error-handling:
 * - return a response with status 404 if the requested day does not 
 *   exist in the archive
 *
 * @param request carries the year, month, and day as path parameters.
 * @param service the archive.
 * @returns 200 with the day's temperatures, or 404 with an error body when the
 *   archive has no recording for that date.
 */
export function getDay(request: HttpRequest, service: ArchiveService): Promise<HttpResponse> {
	// The route pattern is "/archive/:year/:month/:day", so the request
	// GET /archive/2025/01/01 is for the first day of 2025. 
	// request.params looks like: { year: "2025", month: "01", day: "01" }.
	// this syntax reads e.g. "2025", "01", and "01" into variables named 
	// `year`, `month`, and `day`
	const { year, month, day } = request.params;
	// turns the parameters into a file name: "data/2025/01/01.txt".
	const path: string = dayPath(service, year, month, day);

	// TODO (TASK 2): complete the function body, following the hints in README.md

	void path; // To make the linter happy. Delete this line once you use `path`

	return notImplemented("getDay"); // stub
}

Hints:

You can read getAverage to see an example handler.
You will want to call readDay, which you built in Part 1.
A function that calls an async function must be marked async as well.
Remember: readDay trusts that the file it is given exists in the archive, so you must check whether the file exists before calling readDay.
service.files is an array containing the path of every file in the archive
array.includes(item) returns true if item exists in array (you can also use find from L05)
to build a request with status code 404, use fail(404, "<error message>")
to build a successful request, use respond(200, data)
to return an array, data simply needs to be that array.
With the hints above, you should not need to import another function, or use try/catch (which we will cover in L08) to check if a file exists.

Done when: the four TASK 2 tests pass: a complete day, a day with gaps, and a 404 for both a missing day and a missing month.

TASK 3: Find the cold days
Fill in the body of listDaysBelow(request, service) in src/handlers.ts:
/**
 * GET /archive/days?below=N
 * Get the label of every day whose average temperature is strictly 
 * below N, in date order (earliest first). A label is "year/month/day", e.g.
 * "2025/01/01". 
 *
 * Precondition: the request carries `below`, and its value is a number.
 * 
 * Error-handling:
 *  - none. this function trusts its precondition. 
 *
 * @param request carries `below` as a query parameter.
 * @param service the archive.
 * @returns a request with 200 status code, and a body containing the
 * array of labels whose temperature is below N (can be empty).
 */
export function listDaysBelow(request: HttpRequest, service: ArchiveService): Promise<HttpResponse> {
	// For the request GET /archive/days?below=2.5, request.query.below is the
	// string "2.5". Number() converts it from a string to a number; no checking
	// because we trust the precondition.
	const below = Number(request.query.below);

	// TODO (TASK 3): complete the function body, following the hints in README.md

	void below; // To make the linter happy. Delete this line once you use `below`
	void service; // To make the linter happy. Delete this line once you use `service`
	
	return notImplemented("listDaysBelow"); // stub
}

Hints:

service.files contains all the file names. They are already in date order (earliest first).
Each filename in service.files is of the form "<archivename>/YYYY/MM/DD.txt"
the imported function dayLabel from service.ts extracts a label "YYYY/MM/DD" from a filename of the form "<archivename>/YYYY/MM/DD.txt"
You can use the same line from getAverage (example handler in the file) to get all the readings from each file:
const days: number[][] = await Promise.all(service.files.map((file) => readDay(file)));

remember map preserves order, so days[i] contains the readings for service.files[i].
Promise.all takes in an array of Promise<T> as input and returns T[] after all promises have resolved.
Remember: a function that awaits must be marked async.
mean(arr) returns the average of array arr
Done when: the three TASK 3 tests pass. All tests should pass now.

Conceptual question (not graded): why does getAverage's documentation mention a precondition on the archive, while listDaysBelow has no precondition on the archive?

STRETCH: Summarise the winter
This task is not graded. It uses archive/, ninety days of readings from December 1 to February 28, which is far too much to check by hand and exactly what a service is for.

GET /archive/months answers with one summary per month present in the archive, in date order:

month: the first seven characters of a day's label, e.g. "2025/01".
days: how many days of that month the archive holds.
average: the mean of every reading in the month, pooled the way getAverage pools the whole archive.
coldest: the label of the day with the lowest daily mean. On a tie, the earliest day.
listMonths in src/handlers.ts is the stub, its MonthSummary type is written for you, and routes.ts already sends /archive/months to it. The handler has the same shape as the two you wrote, with a grouping step in the middle:

Read every file at once, as getAverage does. Then pair each day's temperatures with its label from dayLabel, so you have one record per day; map over service.files with the index does it.
Group the days by month. Start from an empty record, const byMonth: Record<string, ...> = {}, and walk the days with for ... of, appending each one under its month. The record grows as you go: this is the accumulator pattern from State and Mutation.
Summarise each group. Object.keys(byMonth).toSorted() gives the months in date order, for the same reason service.files is: two-digit months sort as text into calendar order. map each month to its summary. days is a length, average is mean over the month's readings flattened together, and coldest is a reduce that keeps the day with the lowest mean so far, the running-best shape from highestReading in Lab 2. A helper that summarises one month keeps listMonths short.
Test it on data/ first. The block at the bottom of test/archive.test.ts is written for you; uncomment it. The four-day archive has one December day, two January days, and one February day, and the expected averages are exact fractions of the shipped readings: 31 over 22 for December, 125 over 46 for January, and 5 for February.

Then serve the winter and ask it:

pnpm tsx src/start.ts archive

On the ninety-day archive the answer looks like this, with the averages shortened here:

[
  { "month": "2024/12", "days": 31, "average": -1.25, "coldest": "2024/12/07" },
  { "month": "2025/01", "days": 31, "average": -4.57, "coldest": "2025/01/14" },
  { "month": "2025/02", "days": 28, "average": 1.54,  "coldest": "2025/02/02" }
]

curl http://localhost:3000/archive/months
curl "http://localhost:3000/archive/days?below=-5"
curl http://localhost:3000/archive/2025/02/28
curl -i http://localhost:3000/archive/2025/02/29

Which month was coldest, and on which day? Notice that nothing you wrote earlier needed a change for ninety files, or for the end of February: service.files already knows which days exist, and Promise.all reads ninety files the same way it read four.

One note even though the stretch isn't graded: our copy of the service has listMonths too, so the given stretch test passes against it. If you add your own tests for the stretch, they must pass against a correct implementation as well, or your test-strength score is blocked.