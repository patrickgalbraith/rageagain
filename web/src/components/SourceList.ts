import { PlaylistTrack } from '../Types'
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
  loadError: { track: PlaylistTrack }
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

  //load new sources from Youtube
  load(track: PlaylistTrack) {
    this.clear()

    this.emitter.emit('loadBegin', { track })

    const request_data = {
      artist: track.artist,
      song: track.song
    }

    $.ajax({
      method: 'GET',
      url: '/youtube/get_sources.json',
      dataType: 'json',
      data: request_data,
      success: (data) => {
        if (typeof (data.error) !== 'undefined') {
          console.log('RageAgain.SourceList: loadError: Returned result error. ' + data.error)
          this.emitter.emit('loadError', { track })
        }

        $.each(data.sources, (_, value) => {
          this.add({
            'title': value.title,
            'url': value.url
          })
        })

        this.pos = 0

        this.emitter.emit('change')
        this.emitter.emit('loadSuccess', { track })
      },
      error: (_jqXHR, textStatus, _errorThrown) => {
        this.emitter.emit('loadError', { track })
        console.log('RageAgain.SourceList: loadError: ' + textStatus)
      }
    })
  }
}