const baseUrl = "https://raw.githubusercontent.com/patrickgalbraith/rageagain/master/data/"

const provider = async (path: string): Promise<string> => {
  path = path.replace(/^\/data\//, '') // remove leading slash

  // Attempt to get cached data
  if (typeof GITHUB_DATA !== 'undefined') {
    const cachedResult = await GITHUB_DATA.get(path, 'text')

    if (cachedResult)
      return cachedResult
  }

  const response = await fetch(baseUrl + path)
  const bodyText = await response.text()

  if (response.status >= 200 && response.status < 300 && typeof GITHUB_DATA !== 'undefined') {
    await GITHUB_DATA.put(path, bodyText, { expirationTtl: 60 * 60 * 24 })
  }

  return bodyText
}

export default provider