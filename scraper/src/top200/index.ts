import fs from 'fs'
import glob from 'fast-glob'
import path from 'path'
import normalize from 'normalize-path'
import { promisify } from 'util'
import { DATA_DIRECTORY } from '../Constants'
import { Playlist, PlaylistTrack } from '../Types'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

export const generateTop200 = async () => {
  const searchPath = normalize(path.join(DATA_DIRECTORY, './**/*.json'))
  const files = await glob([searchPath, '!**/index.json'])

  const tracks: Record<string, PlaylistTrack & { count: number }> = {}

  // Generate index data
  for (let file of files) {
    const fileData = await readFile(file, 'utf8')
    const playlist: Playlist = JSON.parse(fileData)

    playlist.tracks.forEach(track => {
      const key = `${track.artist.toLowerCase().trim()}::${track.song.toLowerCase().trim()}`
      const existingTrack = tracks[key]

      if (existingTrack && track.song) {
        existingTrack.count++
      } else {
        tracks[key] = {
          ...track,
          timeslot: null,
          count: 0
        }
      }
    })
  }

  const top200 = {
    title: 'Top 200',
    tracks: Object.values(tracks).sort((a, b) => {
      return a.count > b.count ? -1 : 1
    }).slice(0, 200)
  }

  await writeFile(path.join(DATA_DIRECTORY, 'top200.json'), JSON.stringify(top200))
}