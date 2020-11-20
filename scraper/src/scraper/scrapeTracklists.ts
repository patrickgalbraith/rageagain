import cheerio from 'cheerio'
import { militaryTime } from '../lib/DateHelpers'
import downloadPage from '../lib/downloadPage'
import { parseTrackString, stripParens } from '../lib/StringParsers'
import { PlaylistTrack } from '../Types'

export const scraperV1 = ($: cheerio.Root, $article: cheerio.Cheerio): PlaylistTrack[] => {
  const tracks: PlaylistTrack[] = []

  const $ps = $article.children('p')

  if (!$ps.length)
    console.warn('Failed to find any P tags')

  $ps.toArray().forEach(p => {
    const $p = $(p)
    const timeslot = $p.text().trim()

    if (!(/am|pm$/gi.test(timeslot)))
      return

    const items = $p.next().children()
    let $item = items.filter('strong').first()

    while ($item.length) {
      const artist = $item.text().trim()
      const song = $item.next('em').text().trim()
      const label = stripParens($item.next('em')[0].nextSibling.data?.trim())

      tracks.push({
        artist,
        song,
        label,
        timeslot: militaryTime(timeslot) ?? ''
      })

      $item = $item.nextAll('strong').first()
    }
  })

  return tracks
}

export const scraperV2 = ($: cheerio.Root, $article: cheerio.Cheerio): PlaylistTrack[] => {
  const tracks: PlaylistTrack[] = []
  const $headings = $article.find('h2')

  const findLabel = (nodes: cheerio.Element[]) => {
    nodes = nodes.reverse()
    const node = nodes.find(n => n.type == 'text' && /\(.*\)/.test(n.data?.trim() ?? ''))
    return stripParens(node?.data?.trim())
  }

  $headings.toArray().forEach(heading => {
    const $heading = $(heading)
    const timeslot = $heading.text().trim()

    if (!(/am|pm$/gi.test(timeslot)))
      return

    const $lis = $heading.next('ul').children('li')

    if (!$lis.length)
      console.warn('Failed to find any items for timeslot: ' + timeslot)

    $lis.toArray().forEach(li => {
      const $li = $(li)
      let artist = $li.find('strong').text().trim()
      let song = $li.find('em').text().trim()

      // Find last non-empty child text node
      let label = findLabel($li[0].children)

      // Fallback to text parser for some older pages.
      // For an example of a page that needs this see:
      // https://www.abc.net.au/rage/playlist/friday-night-4-may-2018-on-abc/9758698
      if (!artist || !song) {
        const result = parseTrackString($li.text())

        artist = result.artist
        song = result.song
        label = result.label
      }

      tracks.push({
        artist,
        song,
        label,
        timeslot: militaryTime(timeslot) ?? ''
      })
    })
  })

  return tracks
}

export const scrapeTracklist = async (tracklistUrl: string): Promise<PlaylistTrack[]> => {
  const html = await downloadPage(tracklistUrl)

  if (!html)
    throw new Error('Failed to download playlist at ' + tracklistUrl)

  const $ = cheerio.load(html)
  const $article = $('.article-text')

  if (!$article.length)
    throw new Error('Failed to find article body for ' + tracklistUrl)

  const $headings = $article.find('h2')

  // Newer pages use H2 tags to seperate timeslots
  if ($headings.length) {
    console.log('Using scraperV2...')
    return scraperV2($, $article)
  } else {
    console.log('Using scraperV1...')
    return scraperV1($, $article)
  }
}