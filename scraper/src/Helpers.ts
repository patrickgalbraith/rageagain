import fetch from 'node-fetch'

/**
 * Downloads body of page at specified URL.
 * If there is an error retrieving the page an empty string will be returned.
 * @param url URL to download
 */
export const downloadPage = async (url: string): Promise<string> => {
  console.log('Downloading page at ' + url)

  const response = await fetch(url)

  if (response.ok)
    return await response.text()

  console.warn('Error retrieving page', url, response.statusText)

  return ''
}

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