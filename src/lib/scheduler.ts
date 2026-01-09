/**
 * 다음 발행 가능한 슬롯(09, 15, 21 KST / 00, 06, 12 UTC)을 계산합니다.
 * 기준 시간(base)보다 미래의 첫 슬롯을 반환합니다.
 */
export function getNextSlot(base: Date): Date {
    // 기준 시간에 1분을 더해서, 정확히 같은 시간이면 다음 슬롯으로 넘어가도록 함
    const t = new Date(base.getTime() + 60 * 1000);
    const h = t.getUTCHours();

    const d = new Date(t);
    d.setUTCMinutes(0, 0, 0);
    d.setUTCSeconds(0, 0);
    d.setUTCMilliseconds(0);

    if (h < 6) {
        d.setUTCHours(6); // Next is 06:00 UTC (15:00 KST)
    } else if (h < 12) {
        d.setUTCHours(12); // Next is 12:00 UTC (21:00 KST)
    } else {
        // Next is 00:00 UTC (09:00 KST) next day
        d.setUTCDate(d.getUTCDate() + 1);
        d.setUTCHours(0);
    }
    return d;
}
