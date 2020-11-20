/**
 * Formats date as 'yyyy-mm-dd' e.g. '2020-01-01'.
 * @param d Date
 */
export const dateFormat = (d: Date) => {
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = (d.getDate()).toString().padStart(2, '0')

  return year + '-' + month + '-' + day
}

/**
 * Converts AM/PM to 24 hour time.
 * E.g. "2:30 pm" will be converted to "14:30:00"
 * @param time
 * @param date
 */
export const militaryTime = (time: string) => {
  time = time.trim()

  // If time is already in the correct format then return it
  if (/\d+:\d+:\d+/.test(time))
    return time

  const parts = time.match(/(\d+):(\d+)\s?((am|AM)|(pm|PM))/)

  if (!parts)
    return null

  const hours = +parts[1]
  const minutes = +parts[2]
  const period = parts[3].toLowerCase()

  const date = new Date(2020, 1, 1, 0, 0, 0, 0)

  if (hours === 12) {
    if (period === 'am')
      date.setHours(hours - 12, minutes)
    else if (period === 'pm')
      date.setHours(hours, minutes)
  } else {
    if (period === 'am')
      date.setHours(hours, minutes)
    else if (period === 'pm')
      date.setHours(hours + 12, minutes)
  }

  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  const s = date.getSeconds().toString().padStart(2, '0')

  return `${h}:${m}:${s}`
}