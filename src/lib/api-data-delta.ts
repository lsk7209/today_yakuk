export type BaselineRecord = {
  routeType: string;
  entityId: string;
  contentHash: string;
};

export type CurrentRecord = BaselineRecord & {
  title: string;
  missingFields: string;
};

export type DeltaKind = "new" | "changed" | "missing";

export type DeltaRecord = CurrentRecord & {
  kind: DeltaKind;
};

export function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value);
  return values;
}

export const recordKey = (record: Pick<BaselineRecord, "routeType" | "entityId">) =>
  `${record.routeType}:${record.entityId}`;

export function classifyDelta(
  baseline: BaselineRecord[],
  current: CurrentRecord[],
): DeltaRecord[] {
  const baselineByKey = new Map(baseline.map((record) => [recordKey(record), record]));
  const currentByKey = new Map(current.map((record) => [recordKey(record), record]));
  const deltas: DeltaRecord[] = [];

  for (const record of current) {
    const previous = baselineByKey.get(recordKey(record));
    if (!previous) deltas.push({ ...record, kind: "new" });
    else if (previous.contentHash !== record.contentHash) deltas.push({ ...record, kind: "changed" });
  }

  for (const record of baseline) {
    if (!currentByKey.has(recordKey(record))) {
      deltas.push({ ...record, title: "", missingFields: "", kind: "missing" });
    }
  }

  return deltas.sort((a, b) => recordKey(a).localeCompare(recordKey(b)));
}
