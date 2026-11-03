import { describe, expect, test } from "vitest";
import { makeReactorCoolingSystem } from "../src/reactor";

// A worked example to model the pattern: build a fresh reactor, drive it into a
// known state, then assert one idea at a time so a failure points at its cause.
test("reports stable when cooling exceeds heat", () => {
	const reactor = makeReactorCoolingSystem(3, 300, 650);
	reactor.setPowerMw(200); // heat 24/min, cooling 54/min => net cooling
	const report = reactor.evaluateSafety();

	expect(report.status).to.equal("stable");
	expect(report.minutesToCritical).to.be.null;
	expect(report.shouldScram).to.be.false;
});

// Build a fresh reactor inside each test so tests stay independent.
// Replace each `test.todo` below with a real test (see the README tasks).

describe("TASK 1: partition inputs so every status is reached", () => {
	// evaluateSafety has four branches: emergency (temperature at or above critical - 20),
	// emergency (all pumps offline under power), warning (net heating), stable.
	test.todo("reports warning when heating is net positive");
	test.todo("reports emergency, with shouldScram true, when every pump is offline under power");
	test.todo("reports emergency at exactly critical - 20 (drive it there with tick)");
});

describe("TASK 2: partition the outputs", () => {
	test.todo("minutesToCritical is null when not heating");
	test.todo("minutesToCritical is the gap over the net heat, rounded up, when heating");
});

// TASK 3 applies to every test above and below: assert status, minutesToCritical,
// and shouldScram one at a time, not as one equality on the whole report.

describe("TASK 4: boundaries and rejected inputs", () => {
	// Temperatures come from power * 0.12, so use to.be.closeTo(x, delta), not to.equal.
	test.todo("accepts power at the 1000 MW boundary");
	test.todo("rejects invalid power, a pump index equal to pumpCount, and tick(minutes <= 0)");
	test.todo("tick moves the temperature by the net heat times the minutes");
	test.todo("tick never takes the temperature below 250");
});

describe("TASK 5: a stateful sequence", () => {
	test.todo("recovers to stable after an emergency cooldown, with power 0 and every pump online in the snapshot");
});

describe("STRETCH: reject an impossible reactor", () => {
	test.todo("accepts one pump and rejects zero");
	test.todo("accepts a start of exactly 250 and rejects 249");
	test.todo("accepts a critical temperature above the start and rejects one equal to it");
});

// STRETCH (not graded): tests you add for "Be the Mutant" (README) go in
// whichever block above they belong to. Undo every change to src/reactor.ts
// before you Save & Grade.
