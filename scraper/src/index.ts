import { reindex } from "./lib/DataIndexer"
import { scrapeLatest } from "./scraper"

(async () => {
  await reindex()
  await scrapeLatest()
  await reindex()
})()