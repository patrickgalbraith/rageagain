export type ArchivePlaylist = {
  title: string
  url: string
  special: string | null
  timeslot: string | null
  date: Date
}

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