import cheerio from 'cheerio'
import * as chrono from 'chrono-node'
import downloadPage from '../lib/downloadPage'
import { ArchivePlaylist } from '../Types'

/**
 * Downloads HTML of archive page.
 * @param year Year
 * @param month Month
 */
export const getArchiveHTML = async (year: number, month: number) => {
  const monthStr = month.toString().padStart(2, '0')
  const url = `https://www.abc.net.au/rage/playlist/pagination/search/archive/9471432?month=${year}-${monthStr}&view=findarchive.ajax&pageNum=`

  const requestLimit = 15
  let result = ''

  // Loop through pageNums until server returns empty response
  for (let pageNum = 1; pageNum <= requestLimit; pageNum++) {
    const current = await downloadPage(url + pageNum)

    if (!current.trim())
      break

    result += current
  }

  // Return concatenation of all responses
  return result
}

/**
 * Removes garbage from title string.
 * E.g. 'Saturday morning 20th January 2018 on ABC'
 *      converts to 'saturday 20th january 2018'
 * @param str
 */
const cleanDate = (str: string) => {
  str = str.toLowerCase()
           .replace(/ ?night ?/, ' ')
           .replace(/ ?morning ?/, ' ')

  if (str.includes(' on'))
    str = str.substring(0, str.indexOf(' on'))

  // There a couple of invalid playlist titles that only contain a timeslot
  if (/[0-9]+:[0-9]+[ap]m - [0-9]+:[0-9]+[ap]m/.test(str))
    return null

  return str
}

/**
 * Attempts to extract date from playlist title string.
 * @param str Playlist title string.
 * @param referenceDate Used for relative dates.
 */
export const parseDate = (str: string, referenceDate?: Date) => {
  const cleanStr = cleanDate(str)
  return cleanStr ? chrono.parseDate(cleanStr, referenceDate) : null
}

/**
 * Extracts data from archive page HTML.
 * @param html Archive page HTML
 */
export const extractData = (html: string, referenceDate: Date) => {
  const result: ArchivePlaylist[] = []

  const $ = cheerio.load(html)
  const $lis = $('li')

  $lis.toArray().forEach(li => {
    const $li = $(li)
    const title = $li.find('.description > h3').text().trim()
    const tracklistUrl = $li.find('.description > h3 > a').attr('href') ?? ''
    const teaserText = $li.find('.teaser-text').text().trim()

    const timeslot =
      title.toLowerCase().includes('night') ? 'night' :
      title.toLowerCase().includes('morning') ? 'morning' : null

    const special = /am|pm$/gi.test(teaserText) ? null : teaserText

    const date = parseDate(title, referenceDate)

    if (!date)
      return console.error(`No date found for playlist "${title}"`)

    result.push({
      title,
      url: tracklistUrl.startsWith('https://www.abc.net.au/') ? tracklistUrl : 'https://www.abc.net.au' + tracklistUrl,
      special,
      timeslot,
      date
    })
  })

  return result
}

/**
 * Scrapes data from specified year and month from RAGE archive webpage.
 * @param year Year
 * @param month Month
 */
export const scrapeMonth = async (year: number, month: number): Promise<ArchivePlaylist[]> => {
  const html = await getArchiveHTML(year, month)

  if (!html.trim())
    return []

  return extractData(html, new Date(year, month - 1, 1, 0, 0, 0, 0))
}