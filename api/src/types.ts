export enum MusicVideoProviderSource {
  imvdb = "imvdb",
  ytscraper = "ytscraper"
}

export enum MusicVideoHost {
  youtube = "youtube"
}

export type MusicVideoInfo = {
  source: MusicVideoProviderSource
  host: MusicVideoHost
  url: string
  title?: string
}

export type MusicVideoProvider = (artist: string, song: string) => Promise<MusicVideoInfo[]>