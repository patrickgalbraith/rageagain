import { reindex } from "./indexer"
import { scrapeLatest } from "./scraper"
import { generateTop200 } from "./top200"

(async () => {
  console.log('Starting scrape...')

  await reindex()
  await scrapeLatest()
  await reindex()

  console.log('Generating top 200...')
  await generateTop200()

  console.log('Finished')
})()