export type HffSourceItem = {
  PRDLST_REPORT_NO: string;
  PRDLST_NM: string;
  BSSH_NM: string;
};

export function buildHffUpsertStatement(item: HffSourceItem) {
  return {
    sql: `INSERT INTO supplements
          (product_report_no, name, manufacturer)
          VALUES (?, ?, ?)
          ON CONFLICT(product_report_no) DO UPDATE SET
            name = excluded.name,
            manufacturer = excluded.manufacturer`,
    args: [
      item.PRDLST_REPORT_NO,
      item.PRDLST_NM,
      item.BSSH_NM,
    ],
  };
}
