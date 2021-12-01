import { createReader, Manifest, Reader } from "@prose-reader/core"
import { STREAMER_URL_PREFIX } from "../serviceWorker/constants"
import * as Hammer from 'hammerjs'

export const createApp = async () => {
    const epubUrl = window.location.pathname.substring(`/raw/`.length)
    const container = document.getElementById(`reader`)!

    const reader = createReader({
        containerElement: container,
        pageTurnAnimation: `slide`
    })

    createHammerInteraction(container, reader)

    const response = await fetch(`${window.location.origin}/${STREAMER_URL_PREFIX}/${epubUrl}/manifest`, {
        mode: `no-cors`
    })
    const bookManifest: Manifest = await response.json()

    reader.load(bookManifest, {
        numberOfAdjacentSpineItemToPreLoad: 0
    })

    // @ts-ignore
    window.reader = reader
}

const createHammerInteraction = (container: HTMLElement, reader: Reader) => {
    const manager = new Hammer.Manager(container || document.body, {
        recognizers: [
            [Hammer.Pan, { direction: Hammer.DIRECTION_ALL }],
            [Hammer.Pinch, { enable: true }],
            [Hammer.Tap, {}],
            [Hammer.Press, {}],
            // [Hammer.Tap, { event: `pressdown`, taps: 1, time: 0 }]
        ]
    })

    let movingStartOffsets = { x: 0, y: 0 }
    let movingHasStarted = false

    manager?.on('panmove panstart panend', function onPanMove(ev: HammerInput) {
        const normalizedEvent = reader?.normalizeEventForViewport(ev.srcEvent)

        const deltaX = normalizedEvent && `x` in normalizedEvent ? normalizedEvent?.x - movingStartOffsets.x : ev.deltaX
        const deltaY = normalizedEvent && `y` in normalizedEvent ? normalizedEvent?.y - movingStartOffsets.y : ev.deltaY

        if (ev.type === `panstart`) {
            movingHasStarted = true

            if (normalizedEvent && `x` in normalizedEvent) {
                movingStartOffsets = { x: normalizedEvent.x, y: normalizedEvent.y }
                reader?.moveTo({ x: 0, y: 0 }, { start: true })
            }
        }

        if (ev.type === `panmove` && movingHasStarted) {
            reader?.moveTo({ x: deltaX, y: deltaY })
        }

        if (ev.type === `panend`) {
            if (movingHasStarted) {
                reader?.moveTo({ x: deltaX, y: deltaY }, { final: true })
            }

            movingHasStarted = false
        }
    })
}