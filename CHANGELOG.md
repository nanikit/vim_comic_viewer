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
