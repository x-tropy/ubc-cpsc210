// The imports below are everything the finished handlers need; some are unused
// until you write the bodies.
import { trim } from "zod";
import { readDay } from "./archive";
import { fail, type HttpRequest, type HttpResponse, notImplemented, respond } from "./framework/router";
import { type ArchiveService, dayLabel, dayPath } from "./service";

// Serving a Weather Archive. The three endpoints are specified in README.md;
// routes.ts maps each path to one of the functions below.
//
// A handler receives the request record and the service, and returns a
// response. Every handler in this file waits on a file, so every one of them
// is (or ends up) `async`. Two are stubs: each returns notImplemented(...),
// a promise of a 501 response, until you replace it. The only change you make
// to a signature is adding `async` in front of `function` when you write the
// first `await` in its body.
//
// What a handler reads from `request` (see README.md, "The framework"):
//   request.params.year   the :year segment of the matched pattern, a string
//   request.query.below   a query parameter, arriving as a string
// What a handler returns:
//   respond(200, body)    a success carrying `body`
//   fail(404, message)    a failure carrying { error: message }

/** The mean of a non-empty list of numbers. Given. */
export function mean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

//----- getAverage (given: a finished handler to read first) ------//

/**
 * GET /archive/average: the average temperature across every recording in the
 * archive.
 *
 * Precondition: the archive holds at least one recording (with none, the
 * average would be 0 / 0).
 *
 * Error-handling:
 *   - none, this function trusts its precondition.
 *
 * @param _request the request; this endpoint reads nothing from it.
 * @param service the archive.
 * @returns 200 with the average as a number.
 */
export async function getAverage(_request: HttpRequest, service: ArchiveService): Promise<HttpResponse> {
    // service.files is the path of every recording file. Mapping readDay over
    // it starts every read at once and gives an array of promises; Promise.all
    // waits for all of them and returns their results in the same order, so
    // `days` is an array of arrays: one list of temperatures per file.
    const days = await Promise.all(service.files.map((file) => readDay(file)));

    // flat() joins the per-file lists into one list of every reading, and the
    // body of the response is the plain number mean() returns. respond() wraps
    // it as { status: 200, body: <that number> }.
    return respond(200, mean(days.flat()));
}

//----- getDay ------//

/**
 * GET /archive/:year/:month/:day
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
export async function getDay(request: HttpRequest, service: ArchiveService): Promise<HttpResponse> {
    const { year, month, day } = request.params;
    const path = dayPath(service, year, month, day);
    if (!service.files.includes(path)) {
        return fail(404, `No recording for ${year}/${month}/${day}`);
    }
    return respond(200, await readDay(path));
}

//----- listDaysBelow ------//

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
export async function listDaysBelow(request: HttpRequest, service: ArchiveService): Promise<HttpResponse> {
    // For the request GET /archive/days?below=2.5, request.query.below is the
    // string "2.5". Number() converts it from a string to a number; no checking
    // because we trust the precondition.
    const below = Number(request.query.below);
    const labels: string[] = []; // 一张空名单

    for (const file of service.files) {
        // 每一个文件（每一天）
        const temps = await readDay(file); //   读出这天的温度
        const average = mean(temps); //   算这天的平均
        if (average < below) {
            //   够冷吗？
            labels.push(dayLabel(service, file));
        }

        return respond(200, labels);
    }
}

//----- listMonths (STRETCH) ------//

/** One row of the GET /archive/months answer. */
export type MonthSummary = {
    /** The month as "year/month", e.g. "2025/01". */
    month: string;
    /** How many days of that month the archive holds. */
    days: number;
    /** The mean of every reading in the month, pooled as getAverage pools them. */
    average: number;
    /** The label of the day with the lowest daily mean; the earliest on a tie. */
    coldest: string;
};

/**
 * GET /archive/months: one summary per month present in the archive, in date
 * order. See README.md, STRETCH.
 *
 * @param _request the request; this endpoint reads nothing from it.
 * @param service the archive.
 * @returns 200 with a MonthSummary for each month (possibly none).
 */
export function listMonths(_request: HttpRequest, service: ArchiveService): Promise<HttpResponse> {
    // TODO (STRETCH): read every file with Promise.all, pair each day's
    // temperatures with its label, group the days by the first seven characters
    // of the label ("2025/01"), then summarise each group. Delete the line
    // below once `service` is used.

    void service; // To make the linter happy. Delete this line once you use `service`
    return notImplemented("listMonths"); // stub
}
