import { test, checkExpect } from "@ubccpsc/210-toolkit";
import { parkingFee } from "./exercise";

// 等价类代表
test("0 小时属于免费类，费用为 0",
  checkExpect(() => parkingFee(0), { ok: true, value: 0 }));

test("4 小时属于计费类，费用为 12",
  checkExpect(() => parkingFee(4), { ok: true, value: 12 }));

test("12 小时属于封顶类，费用为 24",
  checkExpect(() => parkingFee(12), { ok: true, value: 24 }));

// 边界值
test("1 小时是免费时段的末端，费用为 0",
  checkExpect(() => parkingFee(1), { ok: true, value: 0 }));

test("2 小时是第一个收费小时，费用为 4",
  checkExpect(() => parkingFee(2), { ok: true, value: 4 }));

test("6 小时是封顶前一小时，费用为 20",
  checkExpect(() => parkingFee(6), { ok: true, value: 20 }));

test("7 小时刚好达到封顶，费用为 24",
  checkExpect(() => parkingFee(7), { ok: true, value: 24 }));

test("8 小时超过封顶点，费用仍为 24",
  checkExpect(() => parkingFee(8), { ok: true, value: 24 }));

// 错误输入：返回 ok: false，而不是抛出错误
test("负数小时返回 ok: false",
  checkExpect(() => parkingFee(-1).ok, false));

test("非整数小时返回 ok: false",
  checkExpect(() => parkingFee(1.5).ok, false));
