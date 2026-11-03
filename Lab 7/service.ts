import { join, relative, sep } from "node:path";
import { listReadingFiles } from "./archive";

/**
 * 一个档案服务：档案根目录，加上其中每个记录文件的路径。
 */
export type ArchiveService = {
	/** 档案的根目录，例如 "data" 或 "archive"。 */
	root: string;
	/** 档案中每个记录文件的路径，按日期顺序排列（最早的在前）。 */
	files: string[];
};

/**
 * 为根目录 `root` 创建一个档案服务。
 *
 * Precondition: `root` 是一个已存在的目录。
 *
 * @param root 档案的根目录。
 * @returns 一个 ArchiveService，其 files 已按日期排序。
 */
export async function createArchiveService(root: string): Promise<ArchiveService> {
	const files = await listReadingFiles(root);
	// 年、月、日都是补零的数字，所以按文本排序就是日期顺序。
	// 先复制再排序，避免修改原数组。
	const sorted = files.filter((file) => file.endsWith(".txt")).toSorted();
	return { root, files: sorted };
}

/**
 * 把年、月、日拼成档案中对应记录文件的路径，
 * 例如 ("data", "2025", "01", "01") 得到 "data/2025/01/01.txt"。
 * 不检查该文件是否存在。
 *
 * @param service 档案。
 * @param year 年份，例如 "2025"。
 * @param month 月份，例如 "01"。
 * @param day 日期，例如 "01"。
 * @returns 该日期记录文件的路径。
 */
export function dayPath(service: ArchiveService, year: string, month: string, day: string): string {
	return join(service.root, year, month, `${day}.txt`);
}

/**
 * 从记录文件的路径中提取标签 "YYYY/MM/DD"，
 * 例如 "data/2025/01/01.txt" 得到 "2025/01/01"。
 *
 * Precondition: `file` 位于 `service.root` 之下，且以 ".txt" 结尾。
 *
 * @param service 档案。
 * @param file 记录文件的路径。
 * @returns 该文件对应的日期标签。
 */
export function dayLabel(service: ArchiveService, file: string): string {
	return relative(service.root, file).split(sep).join("/").replace(/\.txt$/, "");
}
