import cheerio from 'cheerio'
import * as chrono from 'chrono-node'
import { downloadPage } from './Helpers'
import { ArchivePlaylist } from './Types'

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
 * Removes prefix from title string.
 * E.g. for 'Saturday morning 20th January 2018 on ABC' removes 'Saturday morning'
 * @param str
 */
const stripDatePrefix = (str: string) => {
  str = str.toLowerCase()

  if (str.includes('morning'))
    return str.substring(str.indexOf('morning') + 'morning'.length).trim()
  else if (str.includes('night'))
    return str.substring(str.indexOf('night') + 'night'.length).trim()

  return str
}

/**
 * Extracts data from archive page HTML.
 * @param html Archive page HTML
 */
export const extractData = (html: string) => {
  const result: ArchivePlaylist[] = []

  const $ = cheerio.load(html)
  const $lis = $('li')

  $lis.toArray().forEach(li => {
    const $li = $(li)
    const title = $li.find('.description > h3').text().trim()
    const tracklistUrl = $li.find('.description > h3 > a').attr('href') ?? ''
    const teaserText = $li.find('.teaser-text').text().trim()

    const timeslot =
      title.includes('night') ? 'night' :
      title.includes('morning') ? 'morning' : null

    const special = /am|pm$/gi.test(teaserText) ? null : teaserText

    const date = chrono.parseDate(stripDatePrefix(title))

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

  return extractData(html)
}