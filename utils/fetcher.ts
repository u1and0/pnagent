import type { FetchOptions, FetchResult } from "../types.ts";

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

export async function fetchPNSearch<T = any>(
  url: URL,
  options: FetchOptions = {},
): Promise<FetchResult<T>> {
  const { timeout = 10000, retries = 0 } = options;
  const decodedURL = decodeURIComponent(url.toString());

  try {
    const response = await fetchWithTimeout(url, timeout);

    if (!response.ok || response.status === 204) {
      return {
        url: decodedURL,
        result: `HTTP ${response.status}: ${response.statusText}`,
        success: false,
      };
    }

    const jsonResult = await response.json();
    return { url: decodedURL, result: jsonResult, success: true };
  } catch (error) {
    return await handleFetchError(error, decodedURL, url, {
      ...options,
      retries,
    });
  }
}
