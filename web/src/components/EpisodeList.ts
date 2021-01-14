import { IndexedPlaylist } from "../Types"
import { getDayOfWeek, getDayAndMonth } from "../lib/DateHelpers"
import { esc } from "../lib/Util"

export default function render(_playlists: IndexedPlaylist[]) {
  const playlists = _playlists.slice().reverse()

  const $el = $(document.createDocumentFragment())

  let prevYear: number | null = null

  for (const playlist of playlists) {
    const date = new Date(Date.parse(playlist.date))

    // @TODO - original code added one day to date if
    //         timeslot is morning, check if still required

    const year = date.getFullYear()

    if (prevYear != year) {
      $el.append(`
        <div class="clearfix"></div>
        <a name="episode-${year}"></a>
        <h2><span>${year}</span></h2>`)

      prevYear = year
    }

    const id = playlist.path.replace('.json', '')

    $el.append(`<p>
        <a href="#/episode/${esc(id)}/1"
           class="playlist"
           data-playlist_id="${esc(id)}"
           ${playlist.special ? `rel="tooltip" title="${esc(playlist.special)}" data-placement="top"` : ''}
        >
          <span style="color:#BBB; font-family:monospace;">${getDayOfWeek(date)}</span>
          ${getDayAndMonth(date)}
          ${playlist.special ? '<span class="label label-info">s</span>' : ''}
        </a>
      </p>`)
  }

  return $el
}