import fs from 'fs'
import glob from 'fast-glob'
import path from 'path'
import normalize from 'normalize-path'
import { promisify } from 'util'
import { DataIndex, Playlist } from './Types'
import { DATA_DIRECTORY, DATA_INDEX_PATH } from './Constants'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

export const reindex = async (): Promise<DataIndex> => {
  const index: DataIndex = {
    playlists: []
  }

  console.log('Re-index started')

  const searchPath = normalize(path.join(DATA_DIRECTORY, './**/*.json'))
  const files = await glob([searchPath, '!**/index.json'])

  console.log(`Found ${files.length} playlist files in '${searchPath}'`)

  // Generate index data
  for (let file of files) {
    const fileData = await readFile(file, 'utf8')
    const playlist: Playlist = JSON.parse(fileData)

    index.playlists.push({
      special: playlist.special,
      timeslot: playlist.timeslot,
      date: playlist.date,
      path: normalize(path.relative(DATA_DIRECTORY, file)),
      url: playlist.url
    })
  }

  console.log(`Writing index to '${DATA_INDEX_PATH}'`)

  // Update index file
  await writeFile(DATA_INDEX_PATH, JSON.stringify(index, null, 2))

  console.log('Re-index finished')

  return index
}