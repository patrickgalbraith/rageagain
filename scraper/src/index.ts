import { reindex } from "./DataIndexGenerator"
import { findMissingPlaylists } from "./FindMissingPlaylists"
import { scrapeLatest } from "./RageScraper"
import { scrapeTracklist } from "./RageTracklistScraper"

(async () => {
  //const result = await findMissingPlaylists()


  await scrapeLatest()
  await reindex()



  // const html = await getArchivePageHTML(2002, 1)
  // const result = extractArchiveData(html)

  // console.log(result)




  //const result = await scrapePlaylist('https://www.abc.net.au/rage/playlist/sunday-night-2-august-2020-on-abc-1/12512306')
  //const result = await scrapePlaylist('https://www.abc.net.au/rage/playlist/friday-night-30th-june-2017-on-abc/9645500')

  //console.log(JSON.stringify(result, null, 2))
})()