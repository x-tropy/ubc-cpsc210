/**
 * 角色生命值。属性全部是操作，没有 hp 或 maxHp 字段，
 * 所以外部无法直接读取或修改底层数字。
 */
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type Health = {
    /** 受到 amount 点伤害，生命值最低降到 0。amount 为负数时返回错误。 */
    damage(amount: number): Result<Health, string>;
    /** 恢复 amount 点生命值，最高升到 maxHp。amount 为负数时返回错误。 */
    heal(amount: number): Result<Health, string>;
    /** 返回当前生命值。 */
    getHp(): number;
    /** 当前生命值大于 0 时返回 true。 */
    isAlive(): boolean;
};

/**
 * 创建一个生命值对象，保证 0 <= hp <= maxHp。
 *
 * @param {number} maxHp 生命值上限，必须至少为 1
 * @param {number} hp 当前生命值，必须在 0 到 maxHp 之间
 * @returns {Result<Health, string>} 成功时返回满足不变式的 Health；
 * 请求无效时返回 ok: false 和错误信息
 */
export function makeHealth(maxHp: number, hp: number): Result<Health, string> {
    if (maxHp < 1) {
        return { ok: false, error: "Max HP must be at least 1" };
    }
    if (hp < 0 || hp > maxHp) {
        return { ok: false, error: "HP must be between 0 and max HP" };
    }

    return {
        ok: true,
        value: {
            damage(amount: number): Result<Health, string> {
                if (amount < 0) {
                    return {
                        ok: false,
                        error: "Damage amount must not be negative",
                    };
                }
                // 伤害不会让生命值低于 0
                return makeHealth(maxHp, Math.max(0, hp - amount));
            },
            heal(amount: number): Result<Health, string> {
                if (amount < 0) {
                    return {
                        ok: false,
                        error: "Heal amount must not be negative",
                    };
                }
                // 治疗不会让生命值超过 maxHp
                return makeHealth(maxHp, Math.min(maxHp, hp + amount));
            },
            getHp(): number {
                return hp;
            },
            isAlive(): boolean {
                return hp > 0;
            },
        },
    };
}

/**
 * 创建一个满血的新角色。
 *
 * @param {number} maxHp 生命值上限，必须至少为 1
 * @returns {Result<Health, string>} 成功时返回满血的 Health；
 * maxHp 小于 1 时返回错误
 */
export function newCharacter(maxHp: number): Result<Health, string> {
    return makeHealth(maxHp, maxHp);
}
