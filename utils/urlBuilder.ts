/* Tool で使用するURLを構築する関数 */
import {
  APIV1,
  DEFAULT_ASC,
  DEFAULT_DISTINCT,
  DEFAULT_LIMIT,
  SEARCHABLE_HISTORY_FIELD,
  SEARCHABLE_PROJECT_FIELD,
  SEARCHABLE_STOCK_FIELD,
} from "./constants.ts";
import type {
  HistoryField,
  HistorySearchParams,
  ProjectField,
  ProjectSearchParams,
  StockField,
  StockSearchParams,
} from "./types.ts";

/**
 * 在庫検索APIのURLの構築
 * @param params  zodに従うLLMが指定するパラメータ
 * @param defaultSelect selectが一つも示されなかった場合のデフォルト値
 * @return URL GETメソッドに使うURL
 */
export function buildStockSearchUrl(
  params: StockSearchParams,
  defaultSelect: StockField[],
): URL {
  const url = new URL(`${APIV1}/filter/stock`);
  addSearchParams(url, params, SEARCHABLE_STOCK_FIELD);

  const fieldsToSelect = params.select && params.select.length > 0
    ? params.select
    : defaultSelect;
  addSelectParams(url, fieldsToSelect);

  // orderbyは必ず含める必要がある。
  // selectで選ばれたものの中から選ばれなければならない
  // defaultSelectによりparams.selectは必ず一個以上の要素がある
  url.searchParams.set("orderby", params.orderby ?? fieldsToSelect[0]);
  url.searchParams.set("limit", String(params.limit ?? DEFAULT_LIMIT));
  url.searchParams.set("asc", String(params.asc ?? DEFAULT_ASC));
  url.searchParams.set("distinct", String(params.distinct ?? DEFAULT_DISTINCT));

  return url;
}

/**
 * 発注履歴検索APIのURLの構築
 * @param params  zodに従うLLMが指定するパラメータ
 * @param defaultSelect selectが一つも示されなかった場合のデフォルト値
 * @return URL GETメソッドに使うURL
 */
export function buildHistorySearchUrl(
  params: HistorySearchParams,
  defaultSelect: HistoryField[],
): URL {
  const url = new URL(`${APIV1}/filter/history`);
  addSearchParams(url, params, SEARCHABLE_HISTORY_FIELD);

  const fieldsToSelect = params.select && params.select.length > 0
    ? params.select
    : defaultSelect;
  addSelectParams(url, fieldsToSelect);

  // orderbyは必ず含める必要がある。
  // selectで選ばれたものの中から選ばれなければならない
  // defaultSelectによりparams.selectは必ず一個以上の要素がある
  url.searchParams.set("orderby", params.orderby ?? fieldsToSelect[0]);
  url.searchParams.set("limit", String(params.limit ?? DEFAULT_LIMIT));
  url.searchParams.set("asc", String(params.asc ?? DEFAULT_ASC));
  url.searchParams.set("distinct", String(params.distinct ?? DEFAULT_DISTINCT));

  return url;
}

/**
 * 製番検索APIのURLの構築
 * @param params  zodに従うLLMが指定するパラメータ
 * @param defaultSelect selectが一つも示されなかった場合のデフォルト値
 * @return URL GETメソッドに使うURL
 */
export function buildProjectSearchUrl(
  params: ProjectSearchParams,
  defaultSelect: ProjectField[],
): URL {
  const url = new URL(`${APIV1}/filter/project`);
  addSearchParams(url, params, SEARCHABLE_PROJECT_FIELD);

  const fieldsToSelect = params.select && params.select.length > 0
    ? params.select
    : defaultSelect;
  addSelectParams(url, fieldsToSelect);

  // orderbyは必ず含める必要がある。
  // selectで選ばれたものの中から選ばれなければならない
  // defaultSelectによりparams.selectは必ず一個以上の要素がある
  url.searchParams.set("orderby", params.orderby ?? fieldsToSelect[0]);
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
  selectFields: HistoryField[] | StockField[] | ProjectField[],
) {
  selectFields.forEach((field) => {
    url.searchParams.append("select", field);
  });
}
