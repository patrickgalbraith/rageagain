const fs = require('fs')
const util = require('util')
const db = require('mysql-promise')()

const writeFile = util.promisify(fs.writeFile)
const fileExists = util.promisify(fs.exists)
const mkdir = util.promisify(fs.mkdir)

// Before running update these values
db.configure({
  host: 'localhost',
  port: 53306,
  user: 'web',
  password: 'web',
  database: 'rageagain'
}, require('mysql2'))

const exportPlaylist = async (playlist) => {
  let [tracks] = await db.query(`
    SELECT *
    FROM tracks
    WHERE playlist_id = ?
    ORDER BY id ASC`,
    [playlist.id])

  const year = playlist.date.getFullYear()
  const month = (playlist.date.getMonth() + 1).toString().padStart(2, '0')
  const day = playlist.date.getDate().toString().padStart(2, '0')

  const dir = `./data/${year}/${month}/`

  let path = dir + day

  const data = {
    title: playlist.title,
    special: playlist.special,
    timeslot: playlist.timeslot,
    date: `${year}-${month}-${day}`,
    url: playlist.url,
    tracks: processCountdownTracks(tracks.map(track => ({
      artist: track.artist,
      song: track.track,
      label: track.label ? track.label : null,
      timeslot: track.timeslot
    })))
  }

  if (playlist.timeslot)
    path += '_' + playlist.timeslot

  if (await fileExists(path + '.json')) {
    let suffix = 2

    while (await fileExists(path + '_' + suffix + '.json'))
      ++suffix

    path += '_' + suffix
  } else {
    await mkdir(dir, { recursive: true })
  }

  path += '.json'

  console.log('  + File: ' + path)

  await writeFile(path, JSON.stringify(data, null, 2))
}

/**
 * Replaces the number in front of countdown
 * tracks e.g. "1. Example" will replace "1."
 * @param {*} tracks
 */
const processCountdownTracks = (tracks) => {
  // How many detections before we know
  // this tracklist contains a countdown
  const threshold = 4

  let thresholdReached = false
  let numDetected = 0

  for (let index = 0; index < tracks.length; index++) {
    const track = tracks[index]
    const regex = /^([0-9]+). (.*)/gm
    const result = regex.exec(track.song)

    if (thresholdReached && result) {
      track.song = result[2].trim()
      track.countdown = +result[1]
    } else if (!thresholdReached && result) {
      numDetected++

      if (numDetected >= threshold) {
        thresholdReached = true
        index -= threshold
      }
    } else {
      numDetected = 0
      thresholdReached = false
    }
  }

  return tracks
}

const getPlaylists = async () => {
  const [results] = await db.query('SELECT * FROM playlists')
  return results
}

const run = async () => {
  const playlists = await getPlaylists()

  for (let playlist of playlists) {
    console.log('Exporting playlist ' + playlist.id)
    await exportPlaylist(playlist)
  }
}

run().then(() => {
  console.log('FINISHED')
})