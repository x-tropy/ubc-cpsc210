import { readDay } from "./archive";
import { fail, type HttpRequest, type HttpResponse, respond } from "./framework/router";
import { type ArchiveService, dayLabel, dayPath } from "./service";

/** The mean of a non-empty list of numbers. Given. */
export function mean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

//----- getAverage (示例代码) ------//

export async function getAverage(_request: HttpRequest, service: ArchiveService): Promise<HttpResponse> {
    const days = await Promise.all(service.files.map((file) => readDay(file)));
    return respond(200, mean(days.flat()));
}

//----- getDay ------//

export async function getDay(request: HttpRequest, service: ArchiveService): Promise<HttpResponse> {
    const { year, month, day } = request.params;
    const path = dayPath(service, year, month, day);

    // service.files 是启动服务时扫描出来的所有文件路径
    if (!service.files.includes(path)) {
        return fail(404, `No recording for ${year}/${month}/${day}`);
    }
    return respond(200, await readDay(path));
}

//----- listDaysBelow ------//

export async function listDaysBelow(request: HttpRequest, service: ArchiveService): Promise<HttpResponse> {
    const below = Number(request.query.below);

    // 一次性读取所有文件；days[i] 对应 service.files[i]
    const days: number[][] = await Promise.all(service.files.map((file) => readDay(file)));

    const labels: string[] = [];
    for (let i = 0; i < service.files.length; i++) {
        const file = service.files[i];
        const temps = days[i]; // 某一天的所有读数
        if (file !== undefined && temps !== undefined && mean(temps) < below) {
            labels.push(dayLabel(service, file)); // dayLabel 把 data/2025/01/01.txt 变成 2025/01/01
        }
    }

    // return 必须放在循环外面
    return respond(200, labels);
}

//----- listMonths (STRETCH) ------//

export type MonthSummary = {
    month: string;
    days: number;
    average: number;
    coldest: string;
};

/** 一天的记录：标签加上当天的温度。 */
type DayRecord = { label: string; temps: number[] };

/**
 * 汇总一个月的数据。
 * 假设 days 非空，且已按日期顺序排列。
 */
function summarizeMonth(month: string, days: DayRecord[]): MonthSummary {
    // 只有严格更冷时才替换，所以并列时保留最早的一天
    const coldest = days.reduce((best, day) => (mean(day.temps) < mean(best.temps) ? day : best));
    return {
        month,
        days: days.length,
        average: mean(days.flatMap((day) => day.temps)),
        coldest: coldest.label,
    };
}

export async function listMonths(_request: HttpRequest, service: ArchiveService): Promise<HttpResponse> {
    // 1. 一次性读取所有文件，并把每天的温度与标签配对
    const temps = await Promise.all(service.files.map((file) => readDay(file)));
    const records: DayRecord[] = service.files.map((file, i) => ({
        label: dayLabel(service, file),
        temps: temps[i] ?? [],
    }));

    // 2. 按月份分组（累加器模式）
    const byMonth: Record<string, DayRecord[]> = {};
    for (const record of records) {
        const month = record.label.slice(0, 7); // "2025/01"
        (byMonth[month] ??= []).push(record);
    }

    // 3. 按日期顺序汇总每个月
    const summaries: MonthSummary[] = Object.keys(byMonth)
        .toSorted()
        .map((month) => summarizeMonth(month, byMonth[month] ?? []));

    return respond(200, summaries);
}
