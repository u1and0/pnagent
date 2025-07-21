import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildConfirmURL,
  buildHistorySearchUrl,
  buildProjectSearchUrl,
  buildStockSearchUrl,
} from "./urlBuilder.ts";
import type {
  HistoryField,
  HistorySearchParams,
  ProjectField,
  ProjectSearchParams,
  StockField,
  StockSearchParams,
} from "./types.ts";
import { BASEURL } from "./constants.ts";

Deno.test("buildStockSearchUrl with minimal parameters", () => {
  const params: StockSearchParams = { "品番": "PN12345" };
  const defaultSelect = ["品番", "品名"] as StockField[];
  const url = buildStockSearchUrl(params, defaultSelect);
  assertEquals(
    decodeURIComponent(url.toString()),
    `${BASEURL}/api/v1/filter/stock?品番=PN12345&select=品番&select=品名&orderby=品番&limit=50&asc=false&distinct=false`,
  );
});

Deno.test("buildStockSearchUrl with all parameters", () => {
  const params: StockSearchParams = {
    "品番": "PN12345",
    "品名": "Test Parts",
    "型式": "Model-X",
    "備考": "Note",
    select: ["在庫数", "単位"],
    orderby: "在庫数",
    limit: 50,
    asc: false,
    distinct: true,
  };
  const defaultSelect = ["品番", "品名"] as StockField[];
  const url = buildStockSearchUrl(params, defaultSelect);
  assertEquals(
    decodeURIComponent(url.toString().replace(/\+/g, " ")),
    `${BASEURL}/api/v1/filter/stock?品番=PN12345&品名=Test Parts&型式=Model-X&備考=Note&select=在庫数&select=単位&orderby=在庫数&limit=50&asc=false&distinct=true`,
  );
});

Deno.test("buildStockSearchUrl with custom select overriding default", () => {
  const params: StockSearchParams = {
    "品番": "PN12345",
    select: ["品番", "在庫単価"],
  };
  const defaultSelect = ["品番", "品名"] as StockField[];
  const url = buildStockSearchUrl(params, defaultSelect);
  assertEquals(
    decodeURIComponent(url.toString()),
    `${BASEURL}/api/v1/filter/stock?品番=PN12345&select=品番&select=在庫単価&orderby=品番&limit=50&asc=false&distinct=false`,
  );
});

Deno.test("buildHistorySearchUrl with minimal parameters", () => {
  const params: HistorySearchParams = { "製番": "PJ12345" };
  const defaultSelect = ["製番", "工事名称"] as HistoryField[];
  const url = buildHistorySearchUrl(params, defaultSelect);
  assertEquals(
    decodeURIComponent(url.toString()),
    `${BASEURL}/api/v1/filter/history?製番=PJ12345&select=製番&select=工事名称&orderby=製番&limit=50&asc=false&distinct=false`,
  );
});

Deno.test("buildHistorySearchUrl with all parameters", () => {
  const params: HistorySearchParams = {
    "製番": "PJ12345",
    "工事名称": "Test Project",
    "品番": "PN54321",
    select: ["発注数量", "発注単価"],
    orderby: "発注納期",
    limit: 10,
    asc: true,
    distinct: true,
  };
  const defaultSelect = ["製番", "工事名称"] as HistoryField[];
  const url = buildHistorySearchUrl(params, defaultSelect);
  assertEquals(
    decodeURIComponent(url.toString().replace(/\+/g, " ")),
    `${BASEURL}/api/v1/filter/history?製番=PJ12345&工事名称=Test Project&品番=PN54321&select=発注数量&select=発注単価&orderby=発注納期&limit=10&asc=true&distinct=true`,
  );
});

Deno.test("buildProjectSearchUrl with minimal parameters", () => {
  const params: ProjectSearchParams = { "製番": "PRJ001" };
  const defaultSelect = ["製番", "製番名称"] as ProjectField[];
  const url = buildProjectSearchUrl(params, defaultSelect);
  assertEquals(
    decodeURIComponent(url.toString()),
    `${BASEURL}/api/v1/filter/project?製番=PRJ001&select=製番&select=製番名称&orderby=製番&limit=50&asc=false&distinct=false`,
  );
});

Deno.test("buildProjectSearchUrl with all parameters", () => {
  const params: ProjectSearchParams = {
    "製番": "PRJ001",
    "製番名称": "New System",
    "受注・試作番号": "ORD-001",
    select: ["納期", "備考"],
    orderby: "納期",
    limit: 20,
    asc: true,
    distinct: true,
  };
  const defaultSelect = ["製番", "製番名称"] as ProjectField[];
  const url = buildProjectSearchUrl(params, defaultSelect);
  assertEquals(
    decodeURIComponent(url.toString().replace(/\+/g, " ")),
    `${BASEURL}/api/v1/filter/project?製番=PRJ001&製番名称=New System&受注・試作番号=ORD-001&select=納期&select=備考&orderby=納期&limit=20&asc=true&distinct=true`,
  );
});

Deno.test("buildConfirmURL with valid input", () => {
  const sha256 =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const expectedUrl = new URL("index", BASEURL);
  expectedUrl.searchParams.set("hash", sha256);
  expectedUrl.hash = "#requirement-tab";

  const resultUrl = buildConfirmURL(sha256);
  assertEquals(resultUrl.href, expectedUrl.href);
});

Deno.test("buildConfirmURL with empty string", () => {
  const sha256 = "";
  const expectedUrl = new URL("index", BASEURL);
  expectedUrl.searchParams.set("hash", sha256);
  expectedUrl.hash = "#requirement-tab";

  const resultUrl = buildConfirmURL(sha256);
  assertEquals(resultUrl.href, expectedUrl.href);
});
