/* pnagent.tsで使用される Tool の定義を書く*/
import type { ZodObject } from "npm:zod@3.24.2";
import { fetchPNSearch, postPNSearch } from "./fetcher.ts";
import {
  buildHistorySearchUrl,
  buildPartsMasterSearchUrl,
  buildProjectSearchUrl,
  buildRequestsUrl,
  buildStockSearchUrl,
} from "../utils/urlBuilder.ts";
import type {
  HistoryField,
  HistorySearchParams,
  PartsMasterField,
  PartsMasterSearchParams,
  ProjectField,
  ProjectSearchParams,
  RequestToolParams,
  StockField,
  StockSearchParams,
} from "../utils/types.ts";
import {
  HistorySearchSchema,
  PartsMasterSearchSchema,
  ProjectSearchSchema,
  RequestToolSchema,
  StockSearchSchema,
} from "../utils/types.ts";

abstract class SearchTool<T extends ZodObject<any>> {
  abstract name: string;
  abstract description: string;
  abstract parameters: T;

  protected abstract buildUrl(params: T["_input"]): URL;

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
  protected readonly defaultSelect: HistoryField[] = ["製番", "品番"];

  protected buildUrl(params: HistorySearchParams): URL {
    return buildHistorySearchUrl(params, this.defaultSelect);
  }
}

export class StockSearchTool extends SearchTool<typeof StockSearchSchema> {
  name = "StockSearch";
  description = "ユーザーの入力を部品在庫検索用URLに変換して結果を返す";
  parameters = StockSearchSchema;
  protected readonly defaultSelect: StockField[] = ["品番"];

  protected buildUrl(params: StockSearchParams): URL {
    return buildStockSearchUrl(params, this.defaultSelect);
  }
}

export class PartsMasterSearchTool
  extends SearchTool<typeof PartsMasterSearchSchema> {
  name = "PartsMasterSearch";
  description = "ユーザーの入力を部品マスタ検索用URLに変換して結果を返す";
  parameters = PartsMasterSearchSchema;
  protected readonly defaultSelect: PartsMasterField[] = ["品番"];

  protected buildUrl(params: PartsMasterSearchParams): URL {
    return buildPartsMasterSearchUrl(params, this.defaultSelect);
  }
}

export class ProjectSearchTool extends SearchTool<typeof ProjectSearchSchema> {
  name = "ProjectSearch";
  description = "ユーザーの入力を製番検索用URLに変換して結果を返す";
  parameters = ProjectSearchSchema;
  protected readonly defaultSelect: ProjectField[] = ["製番"];

  protected buildUrl(params: ProjectSearchParams): URL {
    return buildProjectSearchUrl(params, this.defaultSelect);
  }
}

export class RequestTool extends SearchTool<typeof RequestToolSchema> {
  name = "requestTool";
  description =
    "POSTリクエストを送信して正しい要求票の形式であることをPNSearchに確認してもらうツール";
  parameters = RequestToolSchema;

  protected buildUrl(_params: RequestToolParams): URL {
    return buildRequestsUrl();
  }

  override async execute(params: RequestToolParams): Promise<string> {
    const url = this.buildUrl(params);
    console.error("URL:", decodeURIComponent(url.toString()));

    const sheet = {
      config: {
        validatable: true,
        sortable: true,
        overridable: true,
      },
      header: params.header,
      orders: params.orders,
    };

    const json = await postPNSearch(url, sheet as RequestToolParams, {
      timeout: 100000,
    });
    return JSON.stringify(json, null, 2);
  }
}
