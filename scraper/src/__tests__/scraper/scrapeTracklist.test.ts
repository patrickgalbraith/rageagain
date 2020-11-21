import { testParser } from "../../lib/ParserTestHelper"
import { scrapeTracklistHtml } from "../../scraper/scrapeTracklists"

describe('scraperV1', () => {
  it('correctly scrapes variation 1', () => {
    testParser('variation-1_sunday-night-29th-january-2017-on-abc',
      html => scrapeTracklistHtml(html))
  })
})

describe('scraperV2', () => {
  it('correctly scrapes variation 2', () => {
    testParser('variation-2_friday-night-4-may-2018-on-abc',
      html => scrapeTracklistHtml(html))
  })

  it('correctly scrapes variation 3', () => {
    testParser('variation-3_saturday-night-31-october-2020-on-abc-1',
      html => scrapeTracklistHtml(html))
  })
})