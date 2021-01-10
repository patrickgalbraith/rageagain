import { PlaylistTrack } from "../Types"
import EventEmitter from "./EventEmitter"

export enum TrackChangeDirection {
  FORWARD = 1,
  BACKWARD = -1,
  NONE = 0
}

export type ChangeEventPayload = {
  current: PlaylistTrack,
  previous: PlaylistTrack | null,
  direction: TrackChangeDirection
}

export type TracklistEvents = {
  modified: undefined,
  finished: undefined,
  change: ChangeEventPayload
}

export class TrackList {
  private max: number = 1000 // the playlist will never grow bigger than this
  private pos: number = -1
  private playlist: PlaylistTrack[] = []

  private emitter: EventEmitter<TracklistEvents>
  on: <K extends keyof TracklistEvents>(event: K, listener: (event: TracklistEvents[K]) => void) => { dispose: () => void }
  off: <K extends keyof TracklistEvents>(event: K, listener: (event: TracklistEvents[K]) => void) => void

  constructor() {
    this.emitter = new EventEmitter<TracklistEvents>()
    this.on = this.emitter.on
    this.off = this.emitter.off
  }

  // Adds track to end of the playlist
  // if the track param is an array then it will loop through and add each track
  add(track: PlaylistTrack[] | PlaylistTrack) {
    if (Array.isArray(track)) {
      track.forEach(t => this.add(t))
      return
    }

    if (this.playlist.length >= this.max) {
      this.playlist.shift() // remove first item from playlist

      if (this.pos >= 0) this.pos--
    }

    this.playlist.push(track)

    this.emitter.emit('modified')
  }

  // Removes track from the playlist
  // returns the removed track or null
  remove(track: PlaylistTrack) {
    let index = this.playlist.indexOf(track)

    if (index != -1) {
      const track = this.playlist.splice(index, 1)

      if (this.pos > index && this.pos >= 0)
        this.pos--

      this.emitter.emit('modified')

      return track[0]
    }

    return null
  }

  // Returns the next track or null
  // updatePos: whether to automatically increment the playlist pos
  next(updatePos: boolean = true) {
    if (!this.hasNext()) {
      this.emitter.emit('finished')
      return null
    }

    let result = this.playlist[this.pos + 1]

    if (updatePos == true) {
      this.pos++
      this.emitter.emit('change', {
        current: this.playlist[this.pos],
        previous: this.playlist[this.pos - 1],
        direction: TrackChangeDirection.FORWARD
      })
    }

    return result
  }

  // Returns the prev track or null
  // updatePos: whether to automatically decrement the playlist pos
  prev(updatePos: boolean = true) {
    if (!this.hasPrev())
      return null

    let result = this.playlist[this.pos - 1]

    if (updatePos == true) {
      this.pos--
      this.emitter.emit('change', {
        current: this.playlist[this.pos],
        previous: this.playlist[this.pos + 1],
        direction: TrackChangeDirection.BACKWARD
      })
    }

    return result
  }

  hasNext() {
    return (this.pos < this.playlist.length - 1)
  }

  hasPrev() {
    return (this.pos > 0)
  }

  current() {
    if (this.pos < 0) return null
    return this.playlist[this.pos]
  }

  rewind() {
    this.pos = 0

    this.emitter.emit('change', {
      current: this.playlist[this.pos],
      previous: this.next(false),
      direction: TrackChangeDirection.BACKWARD
    })

    return this.playlist[this.pos]
  }

  fastForward() {
    this.pos = this.playlist.length - 1

    this.emitter.emit('change', {
      current: this.playlist[this.pos],
      previous: this.prev(false),
      direction: TrackChangeDirection.FORWARD
    })

    return this.playlist[this.pos]
  }

  skip(newPos: number) {
    if (typeof newPos == "undefined" || this.playlist[newPos] == undefined) {
      console.log("Tracklist.skip() Position is not valid. Ignoring...")
      return this.playlist[this.pos]
    }

    if (this.pos == newPos) {
      return this.playlist[this.pos]
    }

    let direction = TrackChangeDirection.NONE
    let secondaryTrack: PlaylistTrack | null = null

    if (newPos > this.pos) {
      direction = TrackChangeDirection.FORWARD
      secondaryTrack = this.next(false)
    } else {
      direction = TrackChangeDirection.BACKWARD
      secondaryTrack = this.prev(false)
    }

    this.pos = newPos
    this.emitter.emit('change', {
      current: this.playlist[this.pos],
      previous: secondaryTrack,
      direction
    })

    return this.playlist[this.pos]
  }

  // Returns the size of the playlist
  length() {
    return this.playlist.length
  }

  getPosition() {
    return this.pos
  }

  // Returns how many tracks are yet to be played in the current playlist
  upcomingLength() {
    return (this.playlist.length - 1) - this.pos
  }

  // Clears all the next tracks from the playlist
  clearUpcoming() {
    this.playlist = this.playlist.slice(0, this.pos + 1)
    this.emitter.emit('modified')
  }

  // Clear track history
  clear() {
    this.playlist = []
    this.pos = -1
    this.emitter.emit('modified')
  }
}