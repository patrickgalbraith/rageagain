import scraper, { isErrorResponse } from "../third-party/youtube-scrape"
import * as cache from "./youtubeCache"
import { MusicVideoHost, MusicVideoInfo, MusicVideoProvider, MusicVideoProviderSource } from "../types"

const search = async (query: string): Promise<scraper.Response> => {
  const cachedResponse = await cache.get(query)

  if (cachedResponse)
    return cachedResponse.data

  const response = await scraper.youtube(query)

  if (isErrorResponse(response))
    throw new Error(response.error)

  if (response && response.results.length)
    await cache.set(query, response)

  return response
}

const provider: MusicVideoProvider = async (artist: string, song: string): Promise<MusicVideoInfo[]> => {
  const finalResult: MusicVideoInfo[] = []
  const query = `${artist} - ${song} music video`
  const response = await search(query)

  response.results.forEach(result => {
    if (!result.video)
      return

    finalResult.push({
      source: MusicVideoProviderSource.ytscraper,
      host: MusicVideoHost.youtube,
      url: result.video.url,
      title: result.video.title
    })
  })

  return finalResult
}

export default provider