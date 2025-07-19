/* PNSearch エンドポイントへのfetch処理関連 */
import type { FetchOptions, FetchResult } from "../utils/types.ts";

/**
 * PNSearch APIエンドポイントへのfetchメイン関数
 * 実質はfetchWithTimeout()でタイムアウト付きフェッチを行って
 * エラーハンドリングやJSONを処理して値を返す
 * @param url GETメソッドへのURL
 * @param options fetch用のオプションで、タイムアウトやリトライ回数など
 * @return Promise<FetchResult<T>> JSONを返す
 */
export async function fetchPNSearch<T = any>(
  url: URL,
  options: FetchOptions = {},
): Promise<FetchResult<T>> {
  const { timeout = 10000, retries = 0 } = options;
  const decodedURL = decodeURIComponent(url.toString());

  try {
    const response = await fetchWithTimeout(url, timeout);

    // Handle 204 No Content separately, as it has no body.
    if (response.status === 204) {
      return {
        url: decodedURL,
        result: "HTTP 204: No Content",
        success: response.ok,
      };
    }

    const responseText = await response.text();
    // For all other responses, try to parse the JSON body.
    try {
      const jsonResult = JSON.parse(responseText);
      return { url: decodedURL, result: jsonResult, success: response.ok };
    } catch (error) {
      // This will catch errors if the response is not valid JSON.
      console.error("Failed to parse JSON:", error);
      return {
        url: decodedURL,
        result:
          `HTTP ${response.status}: ${response.statusText}. Failed to parse response as JSON. Body: ${responseText}`,
        success: false, // It's a failure if we expected JSON and didn't get it.
      };
    }
  } catch (error) {
    return await handleFetchError(error, decodedURL, url, {
      ...options,
      retries,
    });
  }
}

/** タイムアウト付きfetch */
async function fetchWithTimeout(url: URL, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "Accept": "application/json" },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * fetch時にエラー出た場合の処理
 * タイムアウトやネットワークエラーで失敗した場合リトライする
 */
async function handleFetchError<T>(
  error: any,
  decodedURL: string,
  url: URL,
  options: FetchOptions,
): Promise<FetchResult<T>> {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return {
        url: decodedURL,
        result: `Request timeout after ${options.timeout}ms`,
        success: false,
      };
    }
    if (
      options.retries && options.retries > 0 &&
      (error.name === "TypeError" || error.name === "NetworkError")
    ) {
      console.warn(
        `Retrying request to ${decodedURL}, attempts remaining: ${options.retries}`,
      );
      return await fetchPNSearch(url, {
        ...options,
        retries: options.retries - 1,
      });
    }
  }
  console.error("Fetch error:", error);
  const message = error instanceof Error ? error.message : String(error);
  return { url: decodedURL, result: `Fetch error: ${message}`, success: false };
}
