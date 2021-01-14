import { PlaylistTrack } from '../Types'
import { getTrackSources } from './API'
import EventEmitter from './EventEmitter'

export type Source = {
  url: string,
  title: string,
  error?: boolean
}

export type SourceListEvents = {
  change: undefined,
  cleared: undefined,
  loadBegin: { track: PlaylistTrack },
  loadSuccess: { track: PlaylistTrack },
  loadError: { track: PlaylistTrack, error: string }
}

export class SourceList {
  private pos: number = -1
  private sourcelist: Source[] = []

  private emitter: EventEmitter<SourceListEvents>
  on: <K extends keyof SourceListEvents>(event: K, listener: (event: SourceListEvents[K]) => void) => { dispose: () => void }
  off: <K extends keyof SourceListEvents>(event: K, listener: (event: SourceListEvents[K]) => void) => void

  constructor() {
    this.emitter = new EventEmitter<SourceListEvents>()
    this.on = this.emitter.on
    this.off = this.emitter.off
  }

  add(videoInfo: Source) {
    this.sourcelist.push(videoInfo)
  }

  next() {
    if (!this.hasNext())
      return null

    this.pos++
    this.emitter.emit('change')
    return this.sourcelist[this.pos]
  }

  prev() {
    if (!this.hasPrev())
      return null

    this.pos--
    this.emitter.emit('change')
    return this.sourcelist[this.pos]
  }

  hasNext() {
    return (this.pos < this.sourcelist.length - 1)
  }

  hasPrev() {
    return (this.pos > 0)
  }

  seek(pos: number) {
    if (pos < 0 || pos > this.sourcelist.length)
      return

    this.pos = pos

    this.emitter.emit('change')
  }

  indexOf(sourceListItem: Source) {
    return this.sourcelist.indexOf(sourceListItem)
  }

  current() {
    if (this.pos < 0)
      return null

    return this.sourcelist[this.pos]
  }

  clear() {
    this.pos = -1
    this.sourcelist = []

    this.emitter.emit('cleared')
  }

  //sets the current source as invalid/error
  setCurrentError() {
    if (this.pos < 0)
      return

    this.sourcelist[this.pos].error = true
  }

  /**
   * Clears sources list and loads new sources from the API.
   * @param track PlaylistTrack
   */
  async load(track: PlaylistTrack) {
    this.clear()

    this.emitter.emit('loadBegin', { track })

    try {
      const sources = await getTrackSources(track.artist, track.song)

      sources.forEach(source => {
        this.add({
          title: source.title ?? 'Unknown title',
          url: source.url
        })
      })

      this.pos = 0

      this.emitter.emit('change')
      this.emitter.emit('loadSuccess', { track })
    } catch (e) {
      this.emitter.emit('loadError', {
        track,
        error: e.message
      })
    }
  }
}