import { getAverage, getDay, listDaysBelow, listMonths } from "./handlers";
import type { Route } from "./framework/router";
import type { ArchiveService } from "./service";

export const routes: Route<ArchiveService>[] = [
	{ method: "GET", pattern: "/archive/average", handler: getAverage },
	{ method: "GET", pattern: "/archive/days", handler: listDaysBelow },
	{ method: "GET", pattern: "/archive/months", handler: listMonths },
	{ method: "GET", pattern: "/archive/:year/:month/:day", handler: getDay },
];
