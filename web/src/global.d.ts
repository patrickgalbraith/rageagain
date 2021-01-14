interface Window {
  onYouTubePlayerAPIReady: () => void
  $: JQueryStatic,
  Simrou: Simrou
}

type SimrouRoute = {
  get: (event: any, params: any) => void
}

declare class Simrou {
  constructor(options: Record<string, SimrouRoute>)
  start(path: string): void
  navigate(path: string): void
}

interface JQuery {
  tooltip: (state: any) => void
}