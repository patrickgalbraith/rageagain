import { reindex } from "./indexer"
import { scrapeLatest } from "./scraper"

(async () => {
  await reindex()
  await scrapeLatest()
  await reindex()
})()