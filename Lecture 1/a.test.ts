import { test, checkExpect } from "@ubccpsc/210-toolkit";
import { letterGrade } from "./a.ts";

test("Score of 88 returns an A", checkExpect(() => letterGrade(88), "A"));
