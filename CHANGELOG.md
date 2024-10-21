## Criteria

- **Major change is a breaking one that programmer should care.**
- _Minor change is a one affecting user more or less._
- Patch change is none of above or fix.

# 18.1.1

- Fix scroll transfer more.

# 18.1.0

- _Do not transfer scroll to window when viewer scroll is not changed._
- Add `onNextSeries`, `onPreviousSeries` options.
- Fix sometimes not appearing F11 failure guide.
- Navigation 1px precision issue.

# 18.0.0

- **Remove `manualPreferences` from `ViewerController`.**
- Try fixing immersive fullscreen restoration.

# 17.0.3

- Fix infinite loop with empty string.

# 17.0.2

- Fix immersive mode restoration.

# 17.0.1

- Fixed scrolling issue that occurred after refreshing in immersive mode
- Fix some pages not exiting loading state.
- Known issue: immersive mode restoration is broken. It'll be next fix.

# 17.0.0

- **Change `ImageSource` type to `MediaSourceOrDelay`, `imageProps` in `ViewerOptions` to
  `mediaProps`.**
- **Remove `noDefaultBinding` option. Use `viewer.elementKeyHandler = null` and
  `removeEventListener(viewer.defaultGlobalKeyHandler)` instead.**
- **`elementKeyHandler` and `globalKeyHandler` are now setter. Use `defaultElementKeyHandler` and
  `defaultGlobalKeyHandler` instead.**
- _Now it uses overlay scrollbar._

# 16.0.1

- Check http response code when download.

# 16.0.0

- **Changed `ComicSource` type.**
  - _Video source is now supported._
  - _Viewer will invoke source when maximum viewer size is changed._

# 15.0.0

- **Remove `compactWidthIndex`. Use `effectivePreferences`, `setManualPreferences` instead.**
- **Remove `isFullscreenPreferred`. Use `effectivePreferences` instead.**
- **Add setScriptPreferences for modifying settings default.**
- _Previous settings will be cleared due to GM storage key change._

# 14.0.0

- **Replace `useDefault` prop with `noDefaultBinding` option.**
- _Sync scroll to window always for lazy loaded page._
- _Support tab button focusing._
- Restore focus when viewer exit.
- Re-add `toggleFullscreen`, and add `toggleImmersive`.
- Expose `elementKeyHandler`, `globalKeyHandler` in controller.

# 13.0.0

- **Replace `toggleFullscreen`, `toggleWithFullscreenPreferred` with `setImmersive`,
  `setIsFullscreenPreferred`**.
- Add `viewerMode`, `isFullscreenPreferred`.

### 12.1.2

- Fix noSyncScroll option.
- Error div overflow when url is too long.

### 12.1.1

- Fix scroll bug.

## 12.1.0

- _Add page content scroll sync._
- _Do not use full screen by default. It can be enabled by Shift+i._
- _Add help._

### 12.0.2

- Fix not focusing after open state restoration.

### 12.0.1

- Fix not intended scroll when initializing viewer.

### 12.0.0

- **Change build system.**
- _Restore viewer open state on same tab load._
- _Add full screen configuration._
- Fix image division around threshold.

### 11.0.1

- Fix not appearing settings dialog.

# 11.0.0

- **.vim_comic_viewer class name is removed**.
- _Change magnification settings. Previous settings will be reset._

### 10.0.2

- Fix icons overflowing viewer.

### 10.0.1

- Fix not restored scroll in some cases.

# 10.0.0

- **Adopt new build tool. There are no metadata requirement notices from now.**
- _Support long image by showing original size._
- _Add view left to right option._

### 9.0.1

- Restore default background color.
- Increase contrast of scrollbar.

# 9.0.0

- **Add the following for configuration memory.**

  ```
  // @grant GM_setValue
  // @grant GM_getValue
  ```
- Remove `setGmXhr`, use `setTampermonkeyApi` instead.
- Add background color configuration.
- Remember preceding single page count.

### 8.1.1

- Fix not requesting image immediately when reload.

## 8.1.0

- Support switching viewers with the <kbd>Enter</kbd>, <kbd>NumPad0</kbd>.

### 8.0.2

- Fix not working `setGmXhr`.

### 8.0.1

- Fix import error

# 8.0.0

- **Upgrade dependencies. The following is example of resolved packages.**

```
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@1.2.8/dist/index.cjs
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.3/lib/browser.cjs
// @resource       object-assign    https://cdn.jsdelivr.net/npm/object-assign@4.1.1/index.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@18.2.0/cjs/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@18.2.0/cjs/react-dom.production.min.js
// @resource       scheduler        https://cdn.jsdelivr.net/npm/scheduler@0.23.0/cjs/scheduler.production.min.js
```

- add `setGmXhr` which set `gm_xmlhttpRequest` for downloading CORS blocked content.

### 7.0.2

- Upgrade dependencies

### 7.0.1

- Fix disappearing download progress

# 7.0.0

- **Update stitches to 1.2.6. Dependent script's resource pragma should be changed like the
  following.**

```
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.2/lib/browser.cjs
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@1.2.6/dist/index.cjs
```

## 6.2.1

- Fix not found `module` variable in tampermonkey.

## 6.2.0

- _Add reload errored image feature (default key: <kbd>'</kbd>)_
- Reduce page horizontal gap to 1px.
- Fix not showing image url when fetch fails.
- Don't print exception when download is aborted.

## 6.1.0

- _Use file content to determine file extension._
- Remove download progress animation

# 6.0.0

Performance improvement: downloaded file zipping is now almost instant.

- **Change jszip dependency to fflate.**

Script user should replace

`// @resource jszip https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js`

with

`// @resource fflate https://cdn.jsdelivr.net/npm/fflate@0.7.1/lib/browser.cjs`

- **`ViewerController.download` is now**
  - **returns `Uint8Array`.**
  - throws if cancelled.
- Remove `saveZipAs` util function.

# 5.0.0

- _Show first page as single by default._
- Add new default key binding: /, ? for adjusting page start.

## 4.1.0

- Set scrollbar style by default.
- Fix missing download progress when ; key pressed.

### 4.0.1

- Fix broken icon hover reaction.

# 4.0.0

- **Replace `initialize` parameter type with `ViewerOptions`**.
- **Remove `initializeWithDefault`.**
- Expose `<Viewer />` for react usage.
