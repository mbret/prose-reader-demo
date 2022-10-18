import React, { FC, memo, useCallback, useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useSetRecoilState } from "recoil"
import { Home as ClassicHome } from "./classic/Home"
import { Home as ComicsHome } from "./comics/Home"
import { Reader as ClassicReader } from "./classic/Reader"
import { Reader as ComicsReader } from "./comics/Reader"
import { Home } from "./Home"
import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react"
import { theme } from "./theme"
import { ReaderInstance } from "./types"
import { takeUntil } from "rxjs"
import { isZoomingState, readerStateState } from "./state"
import { Report } from "./report"
import { ErrorBoundary } from "./common/ErrorBoundary"
import { useReader } from "./useReader"
import { Subscribe } from "@react-rxjs/core"
import { useReaderSettings } from "./common/useReaderSettings"

export const App = memo(() => {
  const [reader, setReader] = useReader()

  return (
    <Subscribe>
      <ChakraProvider theme={theme}>
        <ColorModeProvider value="dark" options={{ initialColorMode: `dark`, useSystemColorMode: false }}>
          <Router>
            <Routes>
              <Route
                path="/classic/reader/:url"
                element={
                  <ErrorBoundary>
                    <ClassicReader onReader={setReader} />
                  </ErrorBoundary>
                }
              />
              <Route path="/classic" element={<ClassicHome />} />
              <Route
                path="/comics/reader/:url"
                element={
                  <ErrorBoundary>
                    <ComicsReader onReader={setReader} />
                  </ErrorBoundary>
                }
              />
              <Route path="/comics" element={<ComicsHome />} />
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </ColorModeProvider>
      </ChakraProvider>
      <Effects reader={reader} />
    </Subscribe>
  )
})

const Effects: FC<{ reader: ReaderInstance | undefined }> = ({ reader }) => {
  const setReaderStateState = useSetRecoilState(readerStateState)
  const setIsZoomingState = useSetRecoilState(isZoomingState)

  useEffect(() => {
    reader?.$.state$.pipe(takeUntil(reader.$.destroy$)).subscribe((state) => {
      Report.log(`reader.$.state$`, state)
      setReaderStateState(state)
    })

    reader?.zoom.$.isZooming$.subscribe(setIsZoomingState)
  }, [reader, setIsZoomingState])

  return null
}
