export type PlaylistTrack = {
  artist: string
  song: string
  label: string | null
  timeslot: string | null
  countdown?: number
}

export type Playlist = {
  title: string
  special: string | null
  timeslot: string | null
  date: string
  url: string
  tracks: PlaylistTrack[]
}

export type SourceInfo = {
  source: 'ytscraper'
  host: 'youtube'
  url: string
  title?: string
}

export type IndexedPlaylist = {
  special: string | null
  timeslot: string | null
  date: string
  path: string
  url?: string
}

export type DataIndex = {
  playlists: IndexedPlaylist[]
}