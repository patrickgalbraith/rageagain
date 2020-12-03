import getYoutubeVideos from "./lib/youtubeProvider"

const allowedReferrers = [
  /^https?:\/\/rageagain.com/,
  /^https?:\/\/localhost/
]

export async function handleRequest(request: Request): Promise<Response> {
  const referrerMatches = allowedReferrers.some(re => re.test(request.referrer))

  if (!referrerMatches)
    return new Response('Bad request', { status: 400 })

  const { searchParams } = new URL(request.url)

  const artist = searchParams.get('artist')
  const song = searchParams.get('song')

  if (!artist || !song)
    return new Response('Missing param', { status: 400 })

  try {
    const videoInfoList = await getYoutubeVideos(artist, song)

    return new Response(JSON.stringify(videoInfoList))
  } catch (e) {
    return new Response('Something went wrong', { status: 500 })
  }
}
