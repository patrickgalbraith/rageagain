import fs from 'fs'
import path from 'path'
import { promisify } from "util"
import { findMissingPlaylists } from "./FindMissingPlaylists"
import { Playlist } from "./Types"
import { DATA_DIRECTORY } from "./Constants"
import { scrapeTracklist } from "./RageTracklistScraper"
import { dateFormat } from "./Helpers"

const writeFile = promisify(fs.writeFile)
const fileExists = promisify(fs.exists)
const mkdir = promisify(fs.mkdir)

const writePlaylistFile = async (date: Date, playlist: Playlist) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  const dir = path.resolve(DATA_DIRECTORY, `./${year}/${month}/`)

  let filePath = dir + path.sep + day

  if (playlist.timeslot)
    filePath += '_' + playlist.timeslot

  if (await fileExists(filePath + '.json')) {
    let suffix = 2

    while (await fileExists(filePath + '_' + suffix + '.json'))
      ++suffix

    filePath += '_' + suffix
  } else {
    await mkdir(dir, { recursive: true })
  }

  filePath += '.json'

  await writeFile(filePath, JSON.stringify(playlist, null, 2))
}

export const scrapeLatest = async () => {
  console.log('Scrape started')

  const missingPlaylists = await findMissingPlaylists()

  console.log(`Found ${missingPlaylists.length} missing playlists`)

  for (const missingPlaylist of missingPlaylists) {
    try {
      const tracks = await scrapeTracklist(missingPlaylist.url)

      await writePlaylistFile(missingPlaylist.date, {
        title: missingPlaylist.title,
        special: missingPlaylist.special,
        timeslot: missingPlaylist.timeslot,
        date: dateFormat(missingPlaylist.date),
        url: missingPlaylist.url,
        tracks: tracks
      })
    } catch (e) {
      console.error('Failed to process playlist: ' + missingPlaylist.title + ' at ' + missingPlaylist.url)
    }
  }

  console.log('Scrape finished')
}