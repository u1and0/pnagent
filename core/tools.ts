import type { ZodObject } from "npm:zod@3.24.2";
import { fetchPNSearch } from "./fetcher.ts";
import {
  buildHistorySearchUrl,
  buildProjectSearchUrl,
  buildStockSearchUrl,
} from "../utils/urlBuilder.ts";
import type {
  HistorySearchParams,
  ProjectSearchParams,
  StockSearchParams,
} from "../utils/types.ts";
import {
  HistorySearchSchema,
  ProjectSearchSchema,
  StockSearchSchema,
} from "../utils/types.ts";

abstract class SearchTool<T extends ZodObject<any>> {
  abstract name: string;
  abstract description: string;
  abstract parameters: T;

  protected abstract buildUrl(params: T["_input"]): URL;
  protected abstract getDefaultSelect(): string[];

  async execute(params: T["_input"]): Promise<string> {
    const url = this.buildUrl(params);
    console.error("URL:", decodeURIComponent(url.toString()));

    const json = await fetchPNSearch(url, { timeout: 100000, retries: 3 });
    return JSON.stringify(json, null, 2);
  }
}

export class HistorySearchTool extends SearchTool<typeof HistorySearchSchema> {
  name = "HistorySearch";
  description = "ユーザーの入力を部品発注履歴検索用URLに変換して結果を返す";
  parameters = HistorySearchSchema;

  protected getDefaultSelect(): string[] {
    return ["製番", "工事名称", "品番", "品名", "型式"];
  }

  protected buildUrl(params: HistorySearchParams): URL {
    return buildHistorySearchUrl(params, this.getDefaultSelect());
  }
}

export class StockSearchTool extends SearchTool<typeof StockSearchSchema> {
  name = "StockSearch";
  description = "ユーザーの入力を部品在庫検索用URLに変換して結果を返す";
  parameters = StockSearchSchema;

  protected getDefaultSelect(): string[] {
    return ["品番", "品名", "型式", "在庫数", "在庫単価"];
  }

  protected buildUrl(params: StockSearchParams): URL {
    return buildStockSearchUrl(params, this.getDefaultSelect());
  }
}

export class ProjectSearchTool extends SearchTool<typeof ProjectSearchSchema> {
  name = "ProjectSearch";
  description = "ユーザーの入力を製番検索用URLに変換して結果を返す";
  parameters = ProjectSearchSchema;

  protected getDefaultSelect(): string[] {
    return ["製番", "製番名称", "受注・試作番号", "納期"];
  }

  protected buildUrl(params: ProjectSearchParams): URL {
    return buildProjectSearchUrl(params, this.getDefaultSelect());
  }
}
