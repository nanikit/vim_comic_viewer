/// <reference lib="dom" />
import { ComicSource, ViewerSource } from './types.ts';
import { timeout } from './utils.ts';
import { initializeViewer } from './viewer.tsx';

export const initializeWithSource = async (source: ComicSource) => {
  const root = document.createElement('div');
  while (true) {
    if (document.body) {
      document.body.append(root);
      initializeViewer(root, source);
      break;
    }
    await timeout(1);
  }
};

export const initialize = async (sources: ViewerSource[]) => {
  const source = sources.find((x) => x.isApplicable());
  if (source) {
    await initializeWithSource(source.comicSource);
  }
};

//
// ==UserScript==
// @name         vim comic viewer
// @version      1.0
// @description  Universal comic reader
// @match        https://hiyobi.me/reader/*
// @include      /^https:\/\/manatoki\d+\.net\/comic\/\d+/
// @author       keut
// @namespace    https://openuserjs.org/users/keut
// @grant        GM_getResourceText
// @grant        window.close
// @run-at       document-start
// @require      https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js
// @resource     react           https://cdn.jsdelivr.net/npm/react@17.0.1/umd/react.development.js
// @resource     react-dom       https://cdn.jsdelivr.net/npm/react-dom@17.0.1/umd/react-dom.development.js
// @resource     @stitches/core  https://cdn.jsdelivr.net/npm/@stitches/core@0.0.3-canary.4/dist/core.cjs.dev.js
// @resource     @stitches/react https://cdn.jsdelivr.net/npm/@stitches/react@0.0.3-canary.4/dist/react.cjs.dev.js
// ==/UserScript==
