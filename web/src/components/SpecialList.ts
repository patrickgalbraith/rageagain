import { esc } from "../lib/Util"
import { IndexedPlaylist } from "../Types"

const formatSpecialTitle = (title: string) => {
  const toReplace = [
    'guest programs rage',
    'guest program rage',
    'guest programs',
    'guest program',
    'Guest Programs',
    'Grust Program'
  ]

  toReplace.forEach(str => {
    title = title.replace(str, '')
  })

  return title.charAt(0).toUpperCase() + title.substring(1, 30).trim()
}

export default function render(_playlists: IndexedPlaylist[]) {
  const playlists = _playlists.slice()
    .sort((a, b) => (a.special ?? '').localeCompare(b.special ?? ''))

  const $el = $(document.createDocumentFragment())

  for (const playlist of playlists) {
    if (!playlist.special || playlist.special.startsWith('New Music'))
      continue

    const id = playlist.path.replace('.json', '')

    $el.append(`<p>
        <a href="#/episode/${esc(id)}/1" class="playlist" data-playlist_id="${esc(id)}">
          ${esc(formatSpecialTitle(playlist.special))}
        </a>
      </p>`)
  }

  return $el
}