import fetch from 'node-fetch'

/**
 * Downloads body of page at specified URL.
 * If there is an error retrieving the page an empty string will be returned.
 * @param url URL to download
 */
const downloadPage = async (url: string): Promise<string> => {
  console.log('Downloading page at ' + url)

  const response = await fetch(url)

  if (response.ok)
    return await response.text()

  console.warn('Error retrieving page', url, response.statusText)

  return ''
}

export default downloadPage