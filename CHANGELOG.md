### 9.0.1

- Restore default background color.
- Increase contrast of scrollbar.

# 9.0.0

- Add the following for configuration memory.

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

- Upgrade dependencies. The following is example of resolved packages.

```
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@1.2.8/dist/index.cjs
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.3/lib/browser.cjs
// @resource       object-assign    https://cdn.jsdelivr.net/npm/object-assign@4.1.1/index.js
// @resource       react            https://cdn.jsdelivr.net/npm/react@18.2.0/cjs/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@18.2.0/cjs/react-dom.production.min.js
// @resource       scheduler        https://cdn.jsdelivr.net/npm/scheduler@0.23.0/cjs/scheduler.production.min.js
```

- add `setGmXhr` which set `gm_xmlhttpRequest` for downloading CORS blocked
  content.

### 7.0.2

- Upgrade dependencies

### 7.0.1

- Fix disappearing download progress

# 7.0.0

- Update stitches to 1.2.6. Dependent script's resource pragma should be changed
  like the following.

```
// @resource       fflate           https://cdn.jsdelivr.net/npm/fflate@0.7.2/lib/browser.cjs
// @resource       react            https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js
// @resource       react-dom        https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js
// @resource       @stitches/react  https://cdn.jsdelivr.net/npm/@stitches/react@1.2.6/dist/index.cjs
```

## 6.2.1

- Fix not found `module` variable in tampermonkey.

## 6.2.0

- Add reload errored image feature (default key: <kbd>'</kbd>)
- Reduce page horizontal gap to 1px.
- Fix not showing image url when fetch fails.
- Don't print exception when download is aborted.

## 6.1.0

- Use file content to determine file extension.
- Remove download progress animation

# 6.0.0

Performance improvement: downloaded file zipping is now almost instant.

- Change jszip dependency to fflate.

Script user should replace

`// @resource jszip https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js`

with

`// @resource fflate https://cdn.jsdelivr.net/npm/fflate@0.7.1/lib/browser.cjs`

- `ViewerController.download` is now
  - returns `Uint8Array`.
  - throws if cancelled.
- Remove `saveZipAs` util function.

# 5.0.0

- Show first page as single by default.
- Add new default key binding: /, ? for adjusting page start.

## 4.1.0

- Set scrollbar style by default.
- Fix missing download progress when ; key pressed.

### 4.0.1

- Fix broken icon hover reaction.

# 4.0.0

- Expose `<Viewer />` for react usage.
- Replace `initialize` parameter type with `ViewerOptions`.
- Remove `initializeWithDefault`.
