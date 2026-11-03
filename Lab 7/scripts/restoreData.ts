import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.argv[2] ?? "data";

// 空字符串代表缺失的读数（空行）
const files: Record<string, (number | "")[]> = {
	// 22 个读数 + 2 个空行，总和 31
	"2024/12/31.txt": [
		0, 0, -1, "", -1, -1, 0, 1, 2, 4, 5, 5, 6, 6, 5, "", 4, 3, 1, 0, -1, -2, -2, -3,
	],
	// 22 个读数 + 2 个空行，总和 53（读数来自测试期望值）
	"2025/01/01.txt": [
		-2, -2, -3, -2, -2, -1, "", 1, 2, 3, 4, 6, 6, 7, 7, 7, 6, "", 6, 5, 3, 2, 1, -1,
	],
	// 24 个读数，总和 72，平均值 3（读数来自测试期望值）
	"2025/01/02.txt": [
		-1, -2, -3, -3, -3, -2, -1, 0, 1, 3, 5, 6, 7, 8, 9, 9, 9, 8, 7, 6, 5, 3, 1, 0,
	],
	// 24 个读数，总和 120，平均值 5
	"2025/02/14.txt": [
		2, 1, 1, 0, 0, 1, 3, 5, 7, 9, 10, 10, 10, 10, 10, 9, 7, 6, 5, 4, 3, 3, 2, 2,
	],
};

// 先清空整个目录，去掉被污染的虚拟数据
rmSync(root, { recursive: true, force: true });

for (const [name, values] of Object.entries(files)) {
	const path = join(root, name);
	mkdirSync(dirname(path), { recursive: true });
	// 不加末尾换行，保证文件恰好 24 行
	writeFileSync(path, values.join("\n"));
}

console.log(`已重建 "${root}"，共 ${Object.keys(files).length} 个文件`);
