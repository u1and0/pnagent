export const BASEURL = Deno.env.get("PNSEARCH_BASE") || "http://localhost:8080";
export const APIV1 = `${BASEURL}/api/v1`;
export const DEFAULT_LIMIT = 50;
export const DEFAULT_ASC = false;
export const DEFAULT_DISTINCT = false;

export const SELECTABLE_STOCK_FIELD = [
  "品番",
  "品名",
  "型式",
  "在庫数",
  "単位",
  "在庫単価",
  "備考",
] as const;

export const SELECTABLE_PARTS_MASTER_FIELD = [
  "品番",
  "品名",
  "型式",
  "単位",
  "検区",
  "諸口品",
  "メーカ",
  "備考",
] as const;

export const SEARCHABLE_STOCK_FIELD = [
  "品番",
  "品名",
  "型式",
  "備考",
] as const;

export const SEARCHABLE_PARTS_MASTER_FIELD = [
  ...SEARCHABLE_STOCK_FIELD,
  "メーカ",
] as const;

export const SELECTABLE_HISTORY_FIELD = [
  "製番",
  "製番枝番",
  "工事名称",
  "部品表行番号",
  "レベル",
  "出庫指示番号",
  "品番",
  "品名",
  "型式",
  "手配数量",
  "出庫数量",
  "受入数量",
  "発注数量",
  "原価計上数量",
  "単位",
  "部品表作成日",
  "手配納期",
  "出庫処理日",
  "受入日",
  "発注納期",
  "仕入先",
  "発注単価",
  "原価計上単価",
  "発注額",
  "原価計上額",
  "装置名",
  "号機",
  "メーカ",
  "備考",
  "発注処理者",
  "発注番号",
  "検区",
  "諸口品",
] as const;

export const SEARCHABLE_HISTORY_FIELD = [
  "製番",
  "工事名称",
  "出庫指示番号",
  "品番",
  "品名",
  "型式",
  "装置名",
  "号機",
  "メーカ",
  "仕入先",
] as const;

export const SELECTABLE_PROJECT_FIELD = [
  "製番",
  "製番枝番",
  "製番名称",
  "受注・試作番号",
  "納期",
  "備考",
] as const;

export const SEARCHABLE_PROJECT_FIELD = [
  "製番",
  "製番名称",
  "受注・試作番号",
] as const;
