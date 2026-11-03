Activity Tasks: Verifying a Reactor Cooling System
As a safety engineer, I want a test suite that checks the reactor cooling system's safety report under every operating condition, so that I can trust its warnings before it is ever connected to real equipment.

In this activity the implementation is given: a makeReactorCoolingSystem factory whose state is hidden in a closure, as in Part 1. You write the test suite in test/reactor.test.ts, with Vitest's describe, test, and expect.

Focus on the chapter's techniques:

Specific assertions that report failures clearly.
Layered, field-by-field assertions on structured results.
Input and output partitioning.
Boundary and throw tests.
Files:

src/reactor.ts (given; the Domain Rules below state its contracts).
test/reactor.test.ts (write your suite here).
Domain Rules
makeReactorCoolingSystem(pumpCount, initialTempC, criticalTempC) builds one reactor cooling loop. Every reading below is per minute.

setPowerMw(p): power in megawatts, 0 to 1000 inclusive; anything else throws.
setPumpOnline(i, online): i from 0 to pumpCount - 1; anything else throws. Every pump starts online.
Heat in is power * 0.12. Cooling out is 18 per online pump. Net heat is the difference.
tick(minutes): temperature moves by net heat times minutes, and never falls below 250. minutes <= 0 throws.
evaluateSafety() reports:
status: "emergency" when the temperature is at or above criticalTempC - 20, or when every pump is offline and power is above 0; otherwise "warning" when net heat is positive; otherwise "stable".
shouldScram: true only in an emergency.
minutesToCritical: null when net heat is not positive; otherwise the gap to criticalTempC divided by net heat, rounded up.
activePumps and netCoolingPerMinute (cooling out minus heat in).
startEmergencyCooldown(): power becomes 0 and every pump comes online.
snapshot(): a copy of power, temperature, and the pump states.
These are the formulas in src/reactor.ts; you do not need to read its code to write the tests.

Workflow
Work only in test/reactor.test.ts.

Write one small test.
Run tests.
Expand partitions.
Add the stateful sequence test near the end.
Build a fresh reactor inside each test so tests stay independent, and name tests by behaviour, not implementation details.

TASK 1: Partition inputs by status
evaluateSafety has four branches: emergency (temperature at or above critical - 20), emergency (all pumps offline under power), warning (net heating), and stable. Write a test that reaches each one with a clearly different setup. For the temperature branch, drive the reactor to exactly critical - 20 with tick, since a boundary test is the only kind that tells >= from >. Hint: one online pump against 400 MW heats at 30 per minute, so from the default 300 the reactor reaches 630 after tick(11).

Done when: all three statuses are covered, including both ways to reach emergency, and the temperature boundary is tested exactly.

TASK 2: Partition the outputs
Test the distinct output categories: minutesToCritical is null when not heating and a number when heating; shouldScram is true only in an emergency. For the number case, pick a setup where the division does not come out even, so the assertion checks the rounding.

Done when: each output category has a direct assertion (use to.be.null for the null case), and the heating case asserts the exact rounded-up value.

TASK 3: Informative, layered assertions
For the structured safety report, assert one field at a time (status, then minutesToCritical, then shouldScram) rather than one big equality on the whole object, so the first failure names the fault.

Done when: a single wrong field would fail on that field's own assertion.

TASK 4: Boundaries and rejected inputs
Cover the boundaries and the throwing operations: power at exactly 1000 is accepted; power < 0 or > 1000 throws; an out-of-range pump index throws, including the index equal to pumpCount; tick(minutes <= 0) throws. Then cover tick itself: after tick(m) with m > 1, the temperature is the start plus net heat times m, and strong cooling over many minutes stops at 250. Temperatures come from power * 0.12, so use to.be.closeTo(x, delta), not to.equal, for temperature assertions.

Done when: every error condition uses expect(() => ...).to.throw(...), and tick has one assertion on the temperature it produces and one on the floor.

TASK 5: A stateful sequence
Add one test that performs a sequence: set power, disable pumps, tick, trigger emergency cooldown, tick again. Then assert the final snapshot (power is 0 and every pump is online) and the safety report.

Done when: this test would catch a cooldown that forgets to bring the pumps back, as well as a bug in ordering or mutation logic.

STRETCH: Be the Mutant
This task is not graded.

The grader scores your suite by running it against faulty copies of reactor.ts, each with one small change, and counting how many your tests catch. This task does the same by hand.

Make one small change to src/reactor.ts: change a >= to >, an 18 to 17, or delete the Math.max(250, ...) floor.
Run pnpm test. Which test fails? If none does, your suite has a gap: write the test that would catch the change, and check it fails now and passes once you undo the change.
Undo the change with git checkout -- src/reactor.ts, then run the tests again to confirm everything passes.
Repeat with a different change.
Undo every change before you Save & Grade. Any edit left in src/reactor.ts makes our reference tests fail against your copy, and the report will show it.

STRETCH: Reject an impossible reactor
This task is not graded.

makeReactorCoolingSystem refuses to build a reactor that could not exist. It throws when:

pumpCount is 0 or less;
initialTempC is below 250, the floor that tick never goes under;
criticalTempC is at or below initialTempC, which would put the reactor at or past critical before it starts.
Write a test for each rule, and test each boundary from both sides: one pump is accepted and zero is not, a start of exactly 250 is accepted and 249 is not, and a critical temperature one degree above the start is accepted and one equal to the start is not.

Our copy of the activity follows these rules, so these tests can stay in your file when you Save & Grade.