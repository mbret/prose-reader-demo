import { loadEpub } from "./loadEpub"
import { generateResourceFromArchive, generateManifestFromArchive, configure } from "@prose-reader/streamer"
import { STREAMER_URL_PREFIX } from "./constants"
import { extractInfoFromEvent, getResourcePath } from "./utils"

// @todo typing
const worker: any = self as any

configure({
  enableReport: process.env.NODE_ENV === `development`
})

worker.addEventListener("install", function (e: any) {
  console.log("service worker install")
  e.waitUntil(worker.skipWaiting()) // Activate worker immediately

  setTimeout(async () => {
    const client = await worker.clients.get(e.clientId)
    if (!e.clientId) {
      console.log("no client id")
      return
    }
    client?.postMessage({
      msg: "Hey I just got a fetch from you!"
    })
  })
})

worker.addEventListener("activate", function (event: any) {
  event.waitUntil((worker as any).clients.claim()) // Become available to all pages
})

/**
 * Spin up the prose reader streamer.
 * We need to provide our custom function to retrieve the archive.
 * This getter can fetch the epub from internet, indexedDB, etc
 */
worker.addEventListener("fetch", (event: any) => {
  const url = new URL(event.request.url)

  if (url.pathname.startsWith(`/${STREAMER_URL_PREFIX}`)) {
    const { epubUrl, epubLocation } = extractInfoFromEvent(event)

    event.respondWith(
      (async () => {
        try {
          const archive = await loadEpub(epubUrl)
          const baseUrl = `${url.origin}/${STREAMER_URL_PREFIX}/${epubLocation}/`

          /**
           * Hit to manifest
           */
          if (url.pathname.endsWith(`/manifest`)) {
            const manifest = await generateManifestFromArchive(archive, { baseUrl })

            return new Response(JSON.stringify(manifest), { status: 200 })
          }

          /**
           * Hit to resources
           */
          const resourcePath = getResourcePath(event)

          const resource = await generateResourceFromArchive(archive, resourcePath)

          return new Response(resource.body, { ...resource.params, status: 200 })
        } catch (e: any) {
          console.error(e)

          return new Response((e as any).message, { status: 500 })
        }
      })()
    )
  }
})
