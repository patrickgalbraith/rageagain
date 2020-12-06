import getYoutubeVideos from "./lib/youtubeProvider"

const allowedOrigins = [
  /^https?:\/\/(www\.)?rageagain.com$/,
  /^https?:\/\/localhost$/,
  /^https?:\/\/localhost:.*$/
]

const corsHeaders = {
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400"
}

function getCorsHeaders(request: Request): Headers {
  const { origin } = new URL(request.url)

  let respHeaders: Record<string, string> = {
    ...corsHeaders,
    Vary: "Origin"
  }

  if (allowedOrigins.some(re => re.test(origin))) {
    respHeaders['Access-Control-Allow-Origin'] = origin
  }

  return new Headers(respHeaders)
}

async function handleMusicVideoSearchRequest(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)

  const artist = searchParams.get('artist')
  const song = searchParams.get('song')

  if (!artist || !song)
    return new Response('Missing param', { status: 400 })

  const videoInfoList = await getYoutubeVideos(artist, song)

  return new Response(JSON.stringify(videoInfoList))
}

function handleOptionsRequest(request: Request): Response {
  let headers = request.headers

  // Handle CORS
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ){
    return new Response(null, {
      headers: getCorsHeaders(request)
    })
  }

  // Handle standard OPTIONS request.
  // If you want to allow other HTTP Methods, you can do that here.
  return new Response(null, {
    headers: {
      Allow: "GET, HEAD, OPTIONS"
    }
  })
}

export async function handleRequest(request: Request): Promise<Response> {
  try {
    if (request.method === "OPTIONS") {
      // Handle CORS preflight requests
      return handleOptionsRequest(request)
    } else if (request.method === "GET") {
      const { pathname } = new URL(request.url)

      if (/\/api\/musicvideosearch\/?/.test(pathname)) {
        return await handleMusicVideoSearchRequest(request)
      } else {
        return new Response(null, {
          status: 404,
          statusText: "Not Found",
        })
      }
    } else {
      return new Response(null, {
        status: 405,
        statusText: "Method Not Allowed",
      })
    }
  } catch (e) {
    return new Response(`Something went wrong: "${e.message}"`, { status: 500 })
  }
}
