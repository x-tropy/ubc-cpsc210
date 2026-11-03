type Mode = "walk" | "bus" | "train" | "bike";

export type Journey = Arrived | Leg;
type Arrived = { kind: "arrived" };
type Leg = { kind: "leg"; mode: Mode; minutes: number; rest: Journey };

export function totalMinutes(journey: Journey): number {
    switch (journey.kind) {
        case "arrived":
            return 0; // 没有更多路段，耗时为 0
        case "leg":
            return journey.minutes + totalMinutes(journey.rest); // 当前路段加上其余部分
    }
}

export function usesTransit(journey: Journey): boolean {
    switch (journey.kind) {
        case "arrived":
            return false; // 没有路段，自然没有乘坐公共交通
        case "leg":
            return (
                journey.mode === "bus" ||
                journey.mode === "train" ||
                usesTransit(journey.rest) // 当前路段不是，就继续检查其余部分
            );
    }
}
