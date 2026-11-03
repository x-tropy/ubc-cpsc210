import { readFile, writeFile } from "node:fs/promises";
import { test, checkExpect } from "@ubccpsc/210-toolkit";

/**
 * 统计日记文件的行数（即条目数）。
 * @param path 日记文件的路径
 * @returns 解析为文件行数的 Promise
 */
export async function lineCount(path: string): Promise<number> {
  const text = await readFile(path, "utf8");
  return text.split("\n").length;
}

/**
 * 备份日记：把 path 处文件的内容复制到 path + ".bak"。
 * 修改文件系统：创建（或覆盖）文件 path + ".bak"。
 * @param path 日记文件的路径
 */
export async function backUp(path: string): Promise<void> {
  // 必须先读完内容，才能写入备份
  const contents = await readFile(path, "utf8");
  await writeFile(path + ".bak", contents);
}

/**
 * 恢复日记：用 path + ".bak" 的内容替换 path 处的文件。
 * 修改文件系统：覆盖文件 path 的原有内容。
 * @param path 日记文件的路径
 */
export async function restore(path: string): Promise<void> {
  // 必须先读完备份，才能写回日记
  const backup = await readFile(path + ".bak", "utf8");
  await writeFile(path, backup);
}

// ---------- 测试 ----------
// 假设 entries.txt 内容为三行：
//   第一天
//   第二天
//   第三天
test(
  "lineCount 统计三行的文件",
  checkExpect(async () => await lineCount("entries.txt"), 3)
);

test(
  "backUp 之后备份文件的行数与原文件一致",
  checkExpect(async () => {
    await backUp("entries.txt");
    return await lineCount("entries.txt.bak");
  }, 3)
);

test(
  "restore 之后日记行数与备份一致",
  checkExpect(async () => {
    await backUp("entries.txt");
    await restore("entries.txt");
    return await lineCount("entries.txt");
  }, 3)
);
