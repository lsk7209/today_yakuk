/**
 * 다음 발행 가능한 슬롯(09, 15, 21 KST / 00, 06, 12 UTC)을 계산합니다.
 * 기준 시간(base)보다 미래의 첫 슬롯을 반환합니다.
 */
export function getNextSlot(base: Date): Date {
    const startOfDay = new Date(base);
    startOfDay.setUTCHours(0, 0, 0, 0);

    for (const hour of [0, 6, 12]) {
        const candidate = new Date(startOfDay);
        candidate.setUTCHours(hour);
        if (candidate.getTime() > base.getTime()) return candidate;
    }

    const nextDay = new Date(startOfDay);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    return nextDay;
}
