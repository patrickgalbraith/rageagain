import Player from "./components/Player"

let ytPlayer: YT.Player | null = null

const player = new Player()

window.onYouTubeIframeAPIReady = () => {
  ytPlayer = new YT.Player('player', {
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