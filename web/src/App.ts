/**
 * Note the code in this file was cobbled together from the
 * original old version of the site (from around 2010) and
 * converted to Typescript without any major refactoring.
 */

import Player from "./lib/Player"
import { getPlaylist, getPlaylistIndex } from "./lib/PlaylistData"
import { SourceList } from "./lib/SourceList"
import { TrackListEvents, TrackList } from "./lib/TrackList"
import renderSpecialList from "./components/SpecialList"
import renderEpisodeList from "./components/EpisodeList"
import renderYearDropdown from "./components/YearDropdown"

let currentPlaylist: string | null = null

const trackList = new TrackList()
const sourceList = new SourceList()
const player = new Player()

window.onYouTubePlayerAPIReady = () => {
  new YT.Player('player', {
    height: '315',
    width: '560',
    videoId: 'U6VrAyhRFkg', // RAGE Intro Video ID
    playerVars: {
      autoplay: 0,
      showinfo: 0,
      controls: 0,
      disablekb: 1,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0
    },
    events: {
      onReady: player.onPlayerReady,
      onStateChange: player.onPlayerStateChange,
      onError: player.onPlayerError
    }
  })
}

const init = () => {
  // ROUTER
  const router = new Simrou({
    '/episode/top200': {
      get: () => {
        router.navigate(`/episode/top200/1`)
      }
    },

    '/episode/top200/:track': {
      get: (_, { track}) => {
        loadPlaylist('top200', () => {
          trackList.skip(track - 1)
        })
      }
    },

    '/episode/:year/:month/:day': {
      get: (_, { year, month, day}) => {
        router.navigate(`/episode/${year}/${month}/${day}/1`)
      }
    },

    '/episode/:year/:month/:day/:track': {
      get: (_, { year, month, day, track}) => {
        loadPlaylist(`${year}/${month}/${day}`, () => {
          trackList.skip(track - 1)
        })
      }
    },

    '/home': {
      get: () => {
        player.play(true) //play intro video
      }
    }
  })

  // EPISODE/SPECIAL TAB
  $('body').on('click', '.nav .skip-to-year', function (_e) {
    const year = $(this).attr('data-year')
    const anchor = $('a[name=episode-' + year + ']')

    $('#pop-up-container').scrollTop(anchor.position().top)
  })

  $('.sort-by-date').on('click', function (_e) {
    $('#specials').hide()
    $('#episodes').show()

    $('.sort-by-date').parent().addClass('active')
    $('.sort-by-special').parent().removeClass('active')

    $('.skip-to-year-toggle').parent().removeClass('disabled')
  })

  $('.sort-by-special').on('click', function (_e) {
    $('#specials').show()
    $('#episodes').hide()

    $('.sort-by-date').parent().removeClass('active')
    $('.sort-by-special').parent().addClass('active')

    $('.skip-to-year-toggle').parent().addClass('disabled')
  })

  // Load playlist data, then render episodes tabs
  getPlaylistIndex().then(data => {
    $('#episodes').empty().append(renderEpisodeList(data.playlists))
    $('#specials').empty().append(renderSpecialList(data.playlists))
    $('#year-dropdown .dropdown-menu').append(renderYearDropdown())

    $('[data-playlist-count]').text(data.playlists.length)

    initTooltips()
  })

  // TOP MENU
  $('.episode-button').on('click', function (_e) {
    changeTab('episodeList')
  })

  $('.now-playing-button').on('click', function (_e) {
    changeTab('nowPlaying')
  })

  $('.player-backward').on('click', function (_e) {
    //trackList.prev()
    if (trackList.hasPrev()) {
      router.navigate('/episode/' + currentPlaylist + '/' + (trackList.getPosition()))
    }
  })

  $('.player-forward').on('click', function (_e) {
    if (trackList.hasNext()) {
      router.navigate('/episode/' + currentPlaylist + '/' + (trackList.getPosition() + 2))
    }
  })

  $('.player-pause').on('click', function (_e) {
    player.togglePause()
  })

  ///// EVENTS /////
  trackList.on('change', onTrackChange)
  trackList.on('finished', () => changeTab('episodeList'))

  sourceList.on('change', onSourceChange)
  sourceList.on('loadError', onSourceListLoadFailed)

  player.on('error', (error) => {
    console.log('Failed to load video', sourceList.current()?.url, error)

    sourceList.setCurrentError()

    const result = sourceList.next() // load next alt sources, until we have tried them all

    if (result === null) {
      trackList.next()
    }
  })
  player.on("ended", () => trackList.next())
  player.on("paused", () => {
    $('.player-pause i').removeClass().addClass('icon-play')
  })
  player.on("playing", () => {
    $('.player-pause i').removeClass().addClass('icon-pause')
  })

  ///// KEYBOARD SHORTCUTS /////
  $(document).on('keyup', function (e) {
    const key = e.which

    //Left arrow
    if (key == 37) {
      trackList.prev()
    }

    //Right arrow
    if (key == 39) {
      trackList.next()
    }

    //Space bar
    if (key == 32) {
      player.togglePause()
    }

    return true
  })

  // Prevent default (i.e. scrolling) for the left and right arrow keys
  $(document).on('keydown', function (e) {
    const key = e.which

    if (key == 37 || key == 39) {
      e.preventDefault()
      return false
    }

    return true
  })

  router.start('/home')
}

const loadPlaylist = function (id: string, callback: (id: string) => void) {
  if (typeof id == 'undefined') {
    throw "RageAgain.loadPlaylist() id is undefined."
  }

  const path = id + '.json'

  if (currentPlaylist == id) {
    if (typeof callback === 'function')
      callback(currentPlaylist)
    return
  }

  getPlaylist(path).then(data => {
    $('#fullscreen-loader').hide()

    if (!data || !data.tracks) {
      alert('Failed to load selected playlist. No tracks found.')
      return
    }

    currentPlaylist = id

    trackList.clear()
    trackList.add(data.tracks)

    if (typeof callback === 'function')
      callback(currentPlaylist)

    $('a span.now-playing-label').remove()
    $('a[data-playlist_id="' + id + '"]')
      .append('<span class="label label-important now-playing-label">p</span>')

    changeTab('nowPlaying')
  })
}

const initTooltips = () => {
  $(document).tooltip({
    selector: 'a[rel=tooltip]',
    placement: function (_tooltip: any, target: any) {
      return $(target).attr('data-placement') || 'top'
    },
    trigger: 'manual'
  })

  const checkTooltipOffset = () => {
    const leftOffset = $('body').children('.tooltip').offset()?.left

    if ((leftOffset ?? 0) < 0) {
      $('body').children('.tooltip').offset({ left: 0 })
    }
  }

  $('a[rel=tooltip]').on('mouseenter', function (e) {
    $(this).tooltip('show')

    checkTooltipOffset()
    setTimeout(checkTooltipOffset, 100)

    e.preventDefault()
    e.stopImmediatePropagation()
  })

  $('a[rel=tooltip]').on('mouseleave', function (_e) {
    $(this).tooltip('hide')
  })
}

const onTrackChange = function ({ current: curTrack }: TrackListEvents['change']) {
  sourceList.load(curTrack)

  $('#nav-right').fadeIn()

  $('.artist').text(curTrack.artist)
  $('.track').text(curTrack.song)

  document.title = `${curTrack.song} by ${curTrack.artist} | RAGEagain`

  if (curTrack.label) {
    $('.tracklabel').text('(' + curTrack.label + ')')
  } else {
    $('.tracklabel').text('')
  }

  $('#now-playing-info').hide()
    .delay(1500)
    .fadeIn('slow')
    .delay(8000)
    .fadeOut()

  if (!player.isPlaying()) {
    player.play()
  }
}

const onSourceListLoadFailed = function () {
  console.log('onSourceListLoadFailed')
  const current = trackList.current()

  // Remove this track and load next one
  // @TODO notify user that track failed to load
  if (current) {
    console.log(`No sources available. Removing track...${trackList.current()?.song} - ${trackList.current()?.artist}`)
    trackList.remove(current)
  }

  trackList.next()
}

const onSourceChange = function () {
  console.log('onSourceChange')
  if (sourceList.current()?.url)
    player.loadVideoByUrl(sourceList.current()!.url)
}

const changeTab = function (tabName: 'episodeList' | 'nowPlaying') {
  if (tabName == 'episodeList') {
    $('header #nav-left a').removeClass('active')
    $('.episode-button').addClass('active')

    $('#overlay').fadeIn()
    $('#episode-container').show()
    $('#pop-up-container').show()

  } else if (tabName == 'nowPlaying') {
    $('header #nav-left a').removeClass('active')
    $('.now-playing-button').addClass('active')

    $('#overlay').fadeOut()
    $('#episode-container').hide()
    $('#pop-up-container').hide()
  }
}

/**
 * Starts up the app.
 * Note: we check that jQuery has loaded before proceeding.
 */
export default function () {
  if (!!window.$ && !!window.Simrou) {
    $(() => init())
    return
  }

  const timer = setInterval(() => {
    if (!!window.$ && !!window.Simrou) {
      clearInterval(timer)
      $(() => init())
    }
  }, 100)
}