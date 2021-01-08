type Disposable = {
  dispose: () => void
}

/**
 * Provides pub/sub style event emitter that can support different
 * event types with typed name and payload.
 *
 * @example
 *
 * type EventTypes = {
 *   'PlayerReady': { type: 'Ready', property?: number },
 *   'PlayerPaused': { type: 'Pause' }
 * }
 *
 * const emitter = new EventEmitter<EventTypes>()
 * emitter.on('PlayerReady', (event) => {...})
 * emitter.emit('PlayerReady', { type: 'Ready' })
 */
export default class EventEmitter<TEvents extends Record<string, any>> {
  private listeners: Partial<Record<keyof TEvents, ((event: any) => void)[]>> = {}

  on = <K extends keyof TEvents>(event: K, listener: (event: TEvents[K]) => void): Disposable => {
    this.listeners[event] = [...(this.listeners[event] ?? []), listener]

    return {
      dispose: () => { this.off(event, listener) }
    }
  }

  off = <K extends keyof TEvents>(event: K, listener: (event: TEvents[K]) => void): void => {
    const callbackIndex = this.listeners[event]?.indexOf(listener) ?? -1

    if (callbackIndex > -1)
      this.listeners[event]?.splice(callbackIndex, 1)
  }

  emit = <K extends keyof TEvents>(event: K, payload: TEvents[K]): void =>
    this.listeners[event]?.forEach(listener => listener(payload))
}