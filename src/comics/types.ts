import type { bookmarksEnhancer } from "@prose-reader/enhancer-bookmarks";
import { Reader } from "@prose-reader/core";

export type ReaderInstance = Reader<typeof bookmarksEnhancer>
// export type ReaderInstance = Reader

// type sd = ReaderInstance[``]