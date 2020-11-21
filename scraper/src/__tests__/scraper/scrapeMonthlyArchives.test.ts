import { dateFormat } from "../../lib/DateHelpers"
import { extractData, parseDate } from "../../scraper/scrapeMonthlyArchives"
import { testParser } from "../../lib/ParserTestHelper"

describe('extractData', () => {
  it('correctly parses archive for 2020-01', () => {
    testParser('archive-1_2020-01',
      html => extractData(html, new Date(2020, 0, 1, 0, 0, 0, 0))
        .map(res => ({...res, date: dateFormat(res.date)})))
  })
})

describe('parseDate', () => {
  it('correctly parses dates', () => {
    expect(dateFormat(parseDate("Sunday night 22 November 2020 on ABC 1", new Date(2020, 10, 1, 0))!))
      .toEqual('2020-11-22')

    expect(dateFormat(parseDate("Saturday morning 29th November 2014 on", new Date(2014, 10, 1, 0))!))
      .toEqual('2014-11-29')

    expect(dateFormat(parseDate("31st January 2009 on", new Date(2009, 0, 1, 0))!))
      .toEqual('2009-01-31')

    expect(dateFormat(parseDate("Sunday night 22 November on ABC 1", new Date(2009, 10, 1, 0))!))
      .toEqual('2009-11-22')

    expect(dateFormat(parseDate("Sunday night 22 January on ABC 1", new Date(2009, 11, 1, 0))!))
      .toEqual('2010-01-22')

    expect(parseDate("fsfdfa", new Date(2009, 11, 1, 0)))
      .toEqual(null)

    expect(parseDate('1:00am - 3:00am', new Date(2009, 11, 1, 0)))
      .toEqual(null)
  })
})