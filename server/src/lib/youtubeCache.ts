import scraper from "../third-party/youtube-scrape"

export type CachedResponse = {
  v: number,             // Version
  ts: number,            // Timestamp
  data: scraper.Response // Response Data
}

/**
 * Uploads data to Cloudflare KV storage with specified key.
 * @param key Storage key
 * @param data Data object
 */
export const set = (key: string, data: scraper.Response): Promise<void> => {
  const wrappedData = {
    v: 1,
    ts: Date.now(),
    data
  }

  return YOUTUBE_REQUESTS.put(key, JSON.stringify(wrappedData))
}

/**
 * Returns data from Cloudflare KV storage with specified key
 * or returns null if not found.
 * @param key Storage key
 */
export const get = (key: string): Promise<CachedResponse | null> =>
  YOUTUBE_REQUESTS.get<CachedResponse>(key, 'json')