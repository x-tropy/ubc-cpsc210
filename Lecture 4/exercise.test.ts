import { test, checkExpect, assertOk } from "@ubccpsc/210-toolkit";
import { makeHealth, newCharacter } from "./exercise";

// ---------- makeHealth ----------
test("makeHealth 创建合法的生命值", () => {
  const h = assertOk(makeHealth(10, 7));
  checkExpect(() => h.getHp(), 7);
  checkExpect(() => h.isAlive(), true);
});

test("makeHealth 拒绝无效请求", () => {
  checkExpect(() => makeHealth(10, -1).ok, false);
  checkExpect(() => makeHealth(10, 11).ok, false);
  checkExpect(() => makeHealth(0, 0).ok, false);
});

// ---------- damage ----------
test("damage 减少生命值", () => {
  const h = assertOk(makeHealth(10, 7));
  const after = assertOk(h.damage(3));
  checkExpect(() => after.getHp(), 4);
});

test("damage 最低停在 0，角色死亡", () => {
  const h = assertOk(makeHealth(10, 7));
  const after = assertOk(h.damage(100));
  checkExpect(() => after.getHp(), 0);
  checkExpect(() => after.isAlive(), false);
});

test("damage 拒绝负数", () => {
  const h = assertOk(makeHealth(10, 7));
  checkExpect(() => h.damage(-5).ok, false);
});

// ---------- heal ----------
test("heal 增加生命值", () => {
  const h = assertOk(makeHealth(10, 7));
  const after = assertOk(h.heal(2));
  checkExpect(() => after.getHp(), 9);
});

test("heal 最高停在 maxHp", () => {
  const h = assertOk(makeHealth(10, 7));
  const after = assertOk(h.heal(100));
  checkExpect(() => after.getHp(), 10);
});

test("heal 拒绝负数", () => {
  const h = assertOk(makeHealth(10, 7));
  checkExpect(() => h.heal(-5).ok, false);
});

// ---------- newCharacter ----------
test("newCharacter 以满血开始", () => {
  const c = assertOk(newCharacter(20));
  checkExpect(() => c.getHp(), 20);
  checkExpect(() => c.isAlive(), true);
});

test("newCharacter 拒绝无效的 maxHp", () => {
  checkExpect(() => newCharacter(0).ok, false);
});

// ---------- 不可变性 ----------
test("damage 不会修改原对象", () => {
  const h = assertOk(makeHealth(10, 7));
  assertOk(h.damage(3));
  checkExpect(() => h.getHp(), 7);
});
