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

    // LLMが指定したパラメータに応じてPOST dataを作成する。
    // LLMの指定がなければデフォルト値を充てる
    const sheet = {
      config: {
        validatable: true,
        sortable: true, // api/v1/requests
        overridable: true,
      },
      header: {
        発注区分: params.header.発注区分,
        製番: params.header.製番,
        製番名称: params.header.製番名称 || "",
        要求年月日: params.header.要求年月日,
        製番納期: params.header.製番納期 || "",
        ファイル名: params.header.ファイル名 || "testfile.xlsx",
        要求元: params.header.要求元 || "PNAgent",
        備考: params.header.備考 || "",
      },
      orders: params.orders.map((order) => ({
        Lv: order.Lv || 2, // 新しいConfirmでは不要
        品番: order.品番.toUpperCase(),
        品名: order.品名 || "",
        型式: order.型式 || "",
        在庫数: order.在庫数 || 0,
        数量: order.数量 || 1,
        単位: order.単位 || "",
        要望納期: order.要望納期,
        検区: order.検区 === undefined || order.検区 === null
          ? "20" // undefined(検区を指定しない)かnullの場合にデフォルト値20
          : order.検区, // 空文字は"検区なし"として許容する。
        装置名: order.装置名 || "",
        号機: order.号機 || "PNAgent",
        メーカ: order.メーカ || "",
        要望先: order.要望先 || "資材一任",
        予定単価: order.予定単価,
        金額: order.金額 || 0,
      })),
    };
    console.error("sheet:", sheet);
    // DEBUG
    // Deno.writeTextFile("error.log", JSON.stringify(sheet), { append: true });

    const json = await postPNSearch(url, sheet, { timeout: 100000 });
    return JSON.stringify(json, null, 2);
  }
}
