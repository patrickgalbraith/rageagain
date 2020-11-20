/**
 * Removes wrapping parenthesis from around string.
 * E.g. "(Example)" becomes "Example".
 * @param str Source string
 */
export const stripParens = (str: string | null | undefined) => {
  const res = str?.trim().match(/\((.*)\)/)
  return res && res.length > 1 && res[1] ? res[1] : null
}

/**
 * Parse string containing track information in the format
 * "ARTIST NAME Song name (Label name)".
 * @param source Track name
 */
export const parseTrackString = (source: string) => {
  source = source.trim()

  const [_, track, label] = source.match(/(.*)\((.*)\)$/) ?? []
  const segments = track?.trim().split(' ') ?? []
  const joiners = ['ft.', 'ft', '_and_', 'and']

  let artist: string[] = []
  let song: string[] = []

  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index]

    // We always assume the first segment is part of the artist name
    if (index === 0) {
      artist.push(segment)
      continue
    }

    // We always assume the last segment is part of the song name
    if (index === segments.length - 1) {
      song.push(segment)
      continue
    }

    if (joiners.includes(segment)) {
      artist.push(segment)
      continue
    }

    if (
      // If we are already populating song
      song.length ||
      // Or the segment contains any lowercase letters
      /[a-z]/.test(segment) ||
      // Or the segment is just a number
      (+segment).toString() === segment
    ) {
      song.push(segment)
      continue
    }

    artist.push(segment)
  }

  return {
    artist: artist.join(' '),
    song: song.join(' '),
    label: label ?? ''
  }
}