/**
 * 根据停车的整小时数计算停车费。
 * 第一小时免费，之后每小时收 4 美元，总费用封顶 24 美元。
 *
 * 前置条件：hours 是整数，且 hours >= 0。
 * 后置条件：返回值在 0 到 24 之间（含）。
 *
 * @param hours 停车的整小时数
 * @returns 应付的停车费（美元）
 */

// function parkingFee(hours: number): number {
//   return -1; // 明显错误的值
// }

// function parkingFee(hours: number): number {
//   return Math.min(24, 4 * Math.max(0, hours - 1));
// }


// function parkingFee(hours: number): number {
//   assert(Number.isInteger(hours), "hours 必须是整数");
//   assert(hours >= 0, "hours 必须大于等于 0");
//   return Math.min(24, 4 * Math.max(0, hours - 1));
// }


type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * 根据停车的整小时数计算停车费。
 * 第一小时免费，之后每小时收 4 美元，总费用封顶 24 美元。
 *
 * 前置条件：无（输入可能来自读错票的售票机，因此不被信任）。
 * 后置条件：若 ok 为 true，则 value 在 0 到 24 之间（含）。
 *
 * 错误情况：若 hours 不是整数或小于 0，返回 ok: false，
 * 并在 error 中给出说明。
 *
 * @param hours 停车的整小时数
 * @returns 成功时为 { ok: true, value: 停车费 }，
 *          输入非法时为 { ok: false, error: 错误信息 }
 */
export function parkingFee(hours: number): Result<number, string> {
  if (!Number.isInteger(hours)) {
    return { ok: false, error: "hours 必须是整数" };
  }
  if (hours < 0) {
    return { ok: false, error: "hours 不能为负数" };
  }
  return { ok: true, value: Math.min(24, 4 * Math.max(0, hours - 1)) };
}
