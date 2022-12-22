import React, { FC, memo, useCallback, useEffect, useState } from "react"
import { ReaderInstance } from "./types"
import { useManifest } from "./useManifest"
import { Reader as ClassicReader } from "./classic/Reader"
import { Reader as ComicsReader } from "./comics/Reader"
import { useParams } from "react-router-dom"

export const Reader = ({ onReader }: { onReader: (instance: ReaderInstance | undefined) => void }) => {
  const { url = `` } = useParams<`url`>()
  const { manifest, error: manifestError } = useManifest(url)

  return (
    <>
      {!!manifestError && <ComicsReader onReader={onReader} manifestError={manifestError} />}
      {manifest?.renditionLayout === "pre-paginated" && <ComicsReader onReader={onReader} manifest={manifest} />}
      {manifest?.renditionLayout === "reflowable" && <ClassicReader onReader={onReader} manifest={manifest} />}
    </>
  )
}
