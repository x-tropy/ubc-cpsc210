import { test, checkExpect } from "@ubccpsc/210-toolkit";
import { totalMinutes, usesTransit, Journey} from "./exercise";

// 测试用例 1
const home: Journey = { kind: "arrived" };

// 测试用例 2
const commute: Journey = {
    kind: "leg",
    mode: "walk",
    minutes: 5,
    rest: {
        kind: "leg",
        mode: "bus",c
        minutes: 20,
        rest: {
            kind: "leg",
            mode: "walk",
            minutes: 3,
            rest: { kind: "arrived" },
        },
    },
};


test("journey functions", () => {
    checkExpect(() => totalMinutes(commute), 28);
    checkExpect(() => usesTransit(commute), true);
});
