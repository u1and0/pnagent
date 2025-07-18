import {
  APIV1,
  DEFAULT_ASC,
  DEFAULT_DISTINCT,
  DEFAULT_LIMIT,
  SEARCHABLE_HISTORY_FIELD,
  SEARCHABLE_STOCK_FIELD,
} from "./constants.ts";
import type { HistorySearchParams, StockSearchParams } from "./types.ts";

export function buildStockSearchUrl(
  params: StockSearchParams,
  defaultSelect: string[],
): URL {
  const url = new URL(`${APIV1}/filter/stock`);
  addSearchParams(url, params, SEARCHABLE_STOCK_FIELD);
  addSelectParams(url, params.select, defaultSelect);

  url.searchParams.set("orderby", params.orderby ?? "品番");
  url.searchParams.set("limit", String(params.limit ?? DEFAULT_LIMIT));
  url.searchParams.set("asc", String(params.asc ?? DEFAULT_ASC));
  url.searchParams.set("distinct", String(params.distinct ?? DEFAULT_DISTINCT));

  return url;
}

export function buildHistorySearchUrl(
  params: HistorySearchParams,
  defaultSelect: string[],
): URL {
  const url = new URL(`${APIV1}/filter/history`);
  addSearchParams(url, params, SEARCHABLE_HISTORY_FIELD);
  addSelectParams(url, params.select, defaultSelect);

  url.searchParams.set("orderby", params.orderby ?? "製番");
  url.searchParams.set("limit", String(params.limit ?? DEFAULT_LIMIT));
  url.searchParams.set("asc", String(params.asc ?? DEFAULT_ASC));
  url.searchParams.set("distinct", String(params.distinct ?? DEFAULT_DISTINCT));

  return url;
}

/**
 * URLに検索パラメータを追加する
 * @param url URLオブジェクト
 * @param params 検索パラメータを含むオブジェクト
 * @param fields paramsから抽出するキーの配列
 */
function addSearchParams(
  url: URL,
  params: Record<string, any>,
  fields: readonly string[],
) {
  fields.forEach((field) => {
    if (params[field]) {
      url.searchParams.set(field, params[field]);
    }
  });
}

/**
 * URLにselectパラメータを追加する
 * @param url URLオブジェクト
 * @param select ユーザーが指定したselectの配列
 * @param defaultSelect デフォルトで含めるselectの配列
 */
function addSelectParams(
  url: URL,
  select: string[] | undefined,
  defaultSelect: string[],
) {
  const selectFields = new Set(defaultSelect);
  if (select) {
    select.forEach((field) => selectFields.add(field));
  }

  selectFields.forEach((field) => {
    url.searchParams.append("select", field);
  });
}
