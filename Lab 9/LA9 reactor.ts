export type CoolingStatus = "stable" | "warning" | "emergency";

export type CoolingAssessment = {
	status: CoolingStatus;
	activePumps: number;
	netCoolingPerMinute: number;
	minutesToCritical: number | null;
	shouldScram: boolean;
};

export type ReactorSnapshot = {
	powerMw: number;
	coolantTempC: number;
	pumpOnline: boolean[];
};

/** The operations a reactor cooling system provides. */
export type ReactorCoolingSystem = {
	/**
	 * Sets reactor output power in megawatts.
	 * @throws {Error} when powerMw is outside [0, 1000].
	 */
	setPowerMw(powerMw: number): void;
	/**
	 * Marks a pump as online/offline by index.
	 * @throws {Error} when index is out of range.
	 */
	setPumpOnline(index: number, online: boolean): void;
	/** Returns the number of currently online pumps. */
	activePumpCount(): number;
	/**
	 * Advances thermal state by the given number of minutes.
	 * @throws {Error} when minutes <= 0.
	 */
	tick(minutes: number): void;
	/** Computes current safety status and SCRAM recommendation. */
	evaluateSafety(): CoolingAssessment;
	/** Forces emergency cooldown (zero power, all pumps online). */
	startEmergencyCooldown(): void;
	/** Returns a defensive snapshot of current reactor state. */
	snapshot(): ReactorSnapshot;
};

function assertValidConstruction(pumpCount: number, initialTempC: number, criticalTempC: number): void {
	if (pumpCount <= 0) {
		throw new Error("pumpCount must be positive");
	}
	if (initialTempC < 250) {
		throw new Error("initialTempC must be >= 250");
	}
	if (criticalTempC <= initialTempC) {
		throw new Error("criticalTempC must be greater than initialTempC");
	}
}

function assertPowerInRange(powerMw: number): void {
	if (powerMw < 0 || powerMw > 1000) {
		throw new Error("powerMw must be in [0, 1000]");
	}
}

function assertPumpIndexInRange(index: number, pumpCount: number): void {
	if (index < 0 || index >= pumpCount) {
		throw new Error("pump index out of range");
	}
}

function assertPositiveMinutes(minutes: number): void {
	if (minutes <= 0) {
		throw new Error("minutes must be > 0");
	}
}

function countActivePumps(pumpOnline: boolean[]): number {
	let count = 0;
	for (const online of pumpOnline) {
		if (online) {
			count = count + 1;
		}
	}
	return count;
}

function netHeatPerMinute(powerMw: number, activePumps: number): number {
	return powerMw * 0.12 - activePumps * 18;
}

function applyTick(coolantTempC: number, powerMw: number, activePumps: number, minutes: number): number {
	return Math.max(250, coolantTempC + netHeatPerMinute(powerMw, activePumps) * minutes);
}

function evaluateCoolingSafety(
	coolantTempC: number,
	criticalTempC: number,
	powerMw: number,
	pumpOnline: boolean[],
): CoolingAssessment {
	const activePumps = countActivePumps(pumpOnline);
	const netHeat = netHeatPerMinute(powerMw, activePumps);
	const netCoolingPerMinute = -netHeat;

	let status: CoolingStatus;
	let shouldScram = false;

	if (coolantTempC >= criticalTempC - 20) {
		status = "emergency";
		shouldScram = true;
	} else if (activePumps === 0 && powerMw > 0) {
		status = "emergency";
		shouldScram = true;
	} else if (netHeat > 0) {
		status = "warning";
	} else {
		status = "stable";
	}

	let minutesToCritical: number | null = null;
	if (netHeat > 0) {
		const gap = criticalTempC - coolantTempC;
		minutesToCritical = gap <= 0 ? 0 : Math.ceil(gap / netHeat);
	}

	return {
		status,
		activePumps,
		netCoolingPerMinute,
		minutesToCritical,
		shouldScram,
	};
}

/**
 * Builds a reactor cooling model used for verification practice. State (power,
 * coolant temperature, pumps) is hidden in the closure; the returned operations
 * are the only way to read or change it.
 *
 * Domain simplifications:
 * - heat added per minute: powerMw * 0.12
 * - heat removed per minute: activePumps * 18
 * - coolant temperature floor: 250C
 *
 * @throws {Error} when pumpCount <= 0, initialTempC < 250, or criticalTempC <= initialTempC.
 */
export function makeReactorCoolingSystem(
	pumpCount: number,
	initialTempC = 300,
	criticalTempC = 650,
): ReactorCoolingSystem {
	assertValidConstruction(pumpCount, initialTempC, criticalTempC);
	let powerMw = 0;
	let coolantTempC = initialTempC;
	let pumpOnline: boolean[] = new Array(pumpCount).fill(true);
	return {
		setPowerMw(newPowerMw: number): void {
			assertPowerInRange(newPowerMw);
			powerMw = newPowerMw;
		},
		setPumpOnline(index: number, online: boolean): void {
			assertPumpIndexInRange(index, pumpOnline.length);
			pumpOnline[index] = online;
		},
		activePumpCount(): number {
			return countActivePumps(pumpOnline);
		},
		tick(minutes: number): void {
			assertPositiveMinutes(minutes);
			coolantTempC = applyTick(coolantTempC, powerMw, countActivePumps(pumpOnline), minutes);
		},
		evaluateSafety(): CoolingAssessment {
			return evaluateCoolingSafety(coolantTempC, criticalTempC, powerMw, pumpOnline);
		},
		startEmergencyCooldown(): void {
			powerMw = 0;
			pumpOnline = new Array(pumpOnline.length).fill(true);
		},
		snapshot(): ReactorSnapshot {
			return { powerMw, coolantTempC, pumpOnline: [...pumpOnline] };
		},
	};
}
