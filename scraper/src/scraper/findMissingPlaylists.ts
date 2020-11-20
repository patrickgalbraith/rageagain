import fs from 'fs'
import { promisify } from "util"
import * as chrono from 'chrono-node'
import { DATA_INDEX_PATH } from "../Constants"
import { ArchivePlaylist, DataIndex } from '../Types'
import { scrapeMonth } from './scrapeMonthlyArchives'

const readFile = promisify(fs.readFile)

/**
 * Finds the latest playlist in the index.json and
 * then attempts to scrape any new playlists.
 */
const findMissingPlaylists = async () => {
  const result: ArchivePlaylist[] = []
  const index: DataIndex = JSON.parse(await readFile(DATA_INDEX_PATH, 'utf8'))

  if (!index)
    throw new Error('Failed to find index.json at ' + DATA_INDEX_PATH)

  if (!index.playlists.length)
    throw new Error('No playlists found in index.json at ' + DATA_INDEX_PATH)

  const latestPlaylist = index.playlists[index.playlists.length - 1]

  let currentDate = chrono.parseDate(latestPlaylist.date)

  // We use a for loop here to limit the number of possible
  // requests in a single run, and to prevent any infinite
  // loop if for some reason the external server returns
  // a valid response for any request (which isn't likely
  // but stranger things have happened).
  for (let i = 0; i <= 40; i++) {
    const playlists = await scrapeMonth(currentDate.getFullYear(), currentDate.getMonth() + 1)

    if (!playlists.length)
      break

    const missingPlaylists = playlists.filter(
      res => !index.playlists.some(p => p.url === res.url))

    result.push(...missingPlaylists)

    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
  }

  return result
}

export default findMissingPlaylists