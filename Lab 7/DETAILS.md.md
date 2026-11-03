## What You Are Building

Three endpoints over the archive in `data/`:

| Request | Answer |
|---|---|
| `GET /archive/2025/01/01` | `200` with that day's temperatures as a JSON array, or `404` when there is no recording for that date |
| `GET /archive/days?below=2.5` | `200` with the labels of the days whose average is below 2.5, e.g. `["2024/12/31", "2025/01/01"]` |
| `GET /archive/average` | `200` with the average of every reading in the archive, as a number |
| `GET /archive/months` | `200` with one summary per month, in date order. This is the **stretch task**; the three rows above are the graded ones. |

All the information for these `GET` requests is in the request string (they have no body).  

The one failure, the `404`, should return with a body of the form `{ "error": "some message" }`; the wording of the message is up to you.



## The framework in five minutes

A web service answers requests. The framework takes a request apart and hands your handler a plain record; a handler turns that record into a response record.

**What arrives.** For the request `GET /archive/2025/01/01?below=2`, matched by the route pattern `/archive/:year/:month/:day`, your handler receives:

```ts
{
  method: "GET",
  path: "/archive/2025/01/01",
  params: { year: "2025", month: "01", day: "01" },   // one entry per :name in the pattern
  query: { below: "2" },                                // the part after "?", as strings
  body: undefined,                                       // a GET has no body
}
```

So `request.params.year` is the string `"2025"`, and `request.query.below` is the string `"2"`. Query parameters always arrive as strings (or `undefined` when not sent); converting them is the handler's job. In Task 3 you can trust that `below` is present and numeric.

**What you return.** A response is `{ status, body }`. Two helpers build them:

```ts
respond(200, [1, 2, 3])          // { status: 200, body: [1, 2, 3] }
fail(404, "no recording for ...") // { status: 404, body: { error: "no recording for ..." } }
```

**The handler signature.** Every handler in `src/handlers.ts` looks like this:

```ts
export function getDay(request: HttpRequest, service: ArchiveService): Promise<HttpResponse>
```

It returns a promise of a response, because it has to wait for a file, and the framework `await`s it. In each handler you'll add `async`, `await` the file work, and return `respond(...)` or `fail(...)`.

**How a request reaches your code.** `src/routes.ts` is a table of three rows. `dispatch` tries them in order; the first pattern that matches wins and its handler is called. You don't edit this table, and you never take a URL apart yourself: the fields above are already filled in when your handler runs.

```text
your test ──► get("/archive/2025/01/01") ──► dispatch ──► routes.ts ──► getDay(request, service) ──► { status, body }
```


## Finding Your Way Around

| File | Yours? | Description |
|---|---|---|
| `src/archive.ts` | **Task 1** | `readDay`, which you write. `listEntries` and `listReadingFiles` are given and finished. |
| `src/handlers.ts` | **Tasks 2 and 3** | The request handlers. `getAverage` is finished; read it first. `getDay` and `listDaysBelow` are stubs that answer `501 not implemented` until you replace them. `listMonths` is a third stub, for the stretch task. |
| `src/service.ts` | given | `ArchiveService`, the record every handler receives: the archive root and the list of every recording file, in date order. Also two path helpers, `dayPath` and `dayLabel`. |
| `src/routes.ts` | given | The route table: four lines mapping a path pattern to a handler. The fourth is the stretch endpoint, routed for you. |
| `src/framework/testClient.ts` | given | `get(path)`, which your tests call. It starts the service and performs one request, with no network involved. |
| `src/framework/router.ts` | given, leave closed | The request and response types, and `dispatch`, which turns a URL into a handler call. |
| `src/framework/server.ts` | given, leave closed | The real HTTP listener, used by `pnpm tsx src/start.ts`. Your tests never touch it. |
| `src/start.ts` | given, leave closed | Starts the real server on `data/`, or on `archive/` if you ask, so you can `curl` it. |
| `test/archive.test.ts` | given, complete | Ten tests covering the three graded rows of the table above, plus a commented-out block for the stretch task. |

When working in code you didn't write:

- Start from the file you have to change. Open `src/handlers.ts`; the comment at the top, the finished `getAverage`, and the two `TODO`s say what each function must do.
- In `src/service.ts`, read the exported names and their doc comments and stop there. You need `service.files`, `dayPath`, and `dayLabel`; how `startService` builds the list doesn't matter today.
- Treat `src/framework/` as a library. The next section covers the four things you need from it. You shouldn't need to open `router.ts` or `server.ts`.
- Run the tests after every change. They're already written, so `pnpm test` tells you exactly where you are.


## Read a finished handler

Before writing a handler (Tasks 2 and 3), read `getAverage` in `src/handlers.ts`. It's the simplest of the three and it has every part yours will need:

```ts
export async function getAverage(_request: HttpRequest, service: ArchiveService): Promise<HttpResponse> {
	const days = await Promise.all(service.files.map((file) => readDay(file)));
	return respond(200, mean(days.flat()));
}
```

- The signature is the one every handler has: request and service in, a promise of a response out. This one reads nothing from the request, so the parameter is named `_request`.
- It's `async` because of the `await` on the next line. `service.files.map(readDay)` starts every file read at once and gives an array of promises; `Promise.all` waits for all of them and returns their results in the same order. `days` is an array of arrays, one list of temperatures per file.
- `days.flat()` joins them into one list, `mean` averages it, and `respond(200, ...)` wraps the number as `{ status: 200, body: 3 }`.

The comments in the file say the same thing line by line. Your two handlers add one idea each: `getDay` reads from `request.params` and has a failure case; `listDaysBelow` reads from `request.query` and filters what `Promise.all` returns.

## Try it for real

After you've completed all the tasks, you can run the web service! Start it by running in the workspace root:

```text
pnpm tsx src/start.ts
```

This serves the four-day `data/` archive. The stretch task has instructions to serve the larger one.

Then in a second terminal:

```text
curl http://localhost:3000/archive/average
curl http://localhost:3000/archive/2025/01/01
curl "http://localhost:3000/archive/days?below=2"
curl -i http://localhost:3000/archive/2025/01/03
```

`-i` shows the status line, so you can see your `404`. Stop the server with Ctrl-C. Nothing you wrote changes between the tests and `curl`; only how the request arrives differs.
