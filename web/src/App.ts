import * as $ from "jquery"
import Player from "./components/Player"
import { SourceList } from "./components/SourceList"
import { ChangeEventPayload, TrackList } from "./components/TrackList"
import { PlaylistTrack } from "./Types"

let currentPlaylist: string | number | null = null

const trackList = new TrackList()
const sourceList = new SourceList()
const player = new Player()

window.onYouTubeIframeAPIReady = () => {
  new YT.Player('player', {
    height: '315',
    width: '560',
    videoId: 'U6VrAyhRFkg',
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

const router = new Simrou({
  '/episode/:playlist_id': {
    get: function (_, params) {
      console.log('ROUTE: /episode/' + params.playlist_id)
      router.navigate('/episode/' + params.playlist_id + '/1')
    }
  },

  '/episode/:playlist_id/:track_pos': {
    get: function (_, params) {
      console.log('ROUTE: /episode/' + params.playlist_id + '/' + params.track_pos)

      const playlist_id = params.playlist_id == 'top200' ? 'top200' : parseInt(params.playlist_id)
      const track_pos = parseInt(params.track_pos)

      loadPlaylist(playlist_id, function () {
        trackList.skip(track_pos - 1)
      })
    }
  },

  '/home': {
    get: function () {
      console.log('ROUTE: /home')
      player.play() //play intro video
    }
  }
})

const init = () => {
  ///// TOOLTIPS /////
  $(document).tooltip({
    selector: 'a[rel=tooltip]',
    placement: function (_tooltip: any, target: any) {
      return $(target).attr('data-placement') || 'top'
    },
    trigger: 'manual'
  })

  $('a[rel=tooltip]').on('mouseenter', function (e) {
    $(this).tooltip('show')

    if ($('body').children('.tooltip').offset()?.left ?? 0 < 0) {
      $('body').children('.tooltip').offset({ left: 0 })
    }

    setTimeout(function () {
      if ($('body').children('.tooltip').offset()?.left ?? 0 < 0) {
        $('body').children('.tooltip').animate({ left: 0 }, 50)
      }
    }, 200)

    e.preventDefault()
    e.stopImmediatePropagation()
  })

  $('a[rel=tooltip]').on('mouseleave', function (_e) {
    $(this).tooltip('hide')
  })

  $('.nav .skip-to-year').on('click', function (_e) {
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

  ///// TOP MENU /////
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
    //trackList.next()
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

  sourceList.on('loadSuccess', onSourcesLoaded)
  sourceList.on('change', onSourceChange)
  sourceList.on('loadSuccess', onSourceListLoadFailed)

  player.on('error', () => {
    sourceList.setCurrentError()

    const result = sourceList.next() //load next alt sources, until we have tried them all

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
}

const loadPlaylist = function (id: string | number, callback: (id: string | number) => void) {
  if (typeof id == "undefined") {
    throw "RageAgain.loadPlaylist() id is undefined."
  }

  if (currentPlaylist == id) {
    console.log('This playlist is already playing...')

    if (typeof callback === 'function')
      callback(currentPlaylist)

    return
  }

  let url = '/tracks/getByPlaylistId/' + id + '.json'

  if (id == 'top200') {
    url = '/tracks/getTop200.json'
  }

  $.getJSON(url, function (data) {

    $('#fullscreen-loader').hide()

    if (!data || data.length < 1 || !data.tracks) {
      alert('Failed to load selected playlist. Empty server response.')
      return
    }

    currentPlaylist = id

    const tracks: PlaylistTrack[] = []

    // Re-organise tracks data
    $.each(data.tracks, function (_key, value) {
      tracks.push(value)
    })

    trackList.clear()
    trackList.add(tracks)

    if (typeof callback === 'function')
      callback(currentPlaylist)

    $('a span.now-playing-label').remove()
    $('a[data-playlist_id=' + id + ']').append('<span class="label label-important now-playing-label">p</span>')

    changeTab('nowPlaying')
  })
}

const onTrackChange = function ({ current: curTrack }: ChangeEventPayload) {
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

  $('#now-playing-info').hide().delay(1500).fadeIn('slow').delay(8000).fadeOut()

  if (!player.isPlaying()) {
    player.play()
  }
}

const onSourcesLoaded = function () {
  if (sourceList.current()?.url)
    player.loadVideoByUrl(sourceList.current()!.url)
}

const onSourceListLoadFailed = function () {
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

export default function () {
  init()
  router.start('/home')
}