import { createHighlighterCore, type HighlighterCore, type ThemeRegistration } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import type { Language } from '@/lib/model/enums';

/**
 * Build-time syntax highlighting (runs in server components only). Two small themes built from the
 * site palette; the CSS in globals.css switches between them with the site theme.
 */

const light: ThemeRegistration = {
  name: 'journey-light',
  type: 'light',
  colors: { 'editor.background': '#F3F4EF', 'editor.foreground': '#16181D' },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#5B6159', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.logical.python'], settings: { foreground: '#17633E' } },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: '#8A4B12' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: '#7A3E9D' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call.generic'], settings: { foreground: '#1F5E8C' } },
    { scope: ['entity.name.type', 'support.type', 'entity.name.class', 'storage.type.built-in'], settings: { foreground: '#1F7A4D' } },
    { scope: ['meta.preprocessor', 'keyword.control.directive', 'punctuation.definition.directive'], settings: { foreground: '#8A5A00' } },
    { scope: ['variable.parameter'], settings: { foreground: '#3D4A44' } },
  ],
};

const dark: ThemeRegistration = {
  name: 'journey-dark',
  type: 'dark',
  colors: { 'editor.background': '#1C2420', 'editor.foreground': '#E7ECE8' },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#9AA59E', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.logical.python'], settings: { foreground: '#6FD19F' } },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: '#E6B98A' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: '#D4A6F0' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call.generic'], settings: { foreground: '#8CC4F0' } },
    { scope: ['entity.name.type', 'support.type', 'entity.name.class', 'storage.type.built-in'], settings: { foreground: '#4CB884' } },
    { scope: ['meta.preprocessor', 'keyword.control.directive', 'punctuation.definition.directive'], settings: { foreground: '#E3B558' } },
    { scope: ['variable.parameter'], settings: { foreground: '#C9D3CC' } },
  ],
};

let highlighter: Promise<HighlighterCore> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [light, dark],
    langs: [import('shiki/langs/python.mjs'), import('shiki/langs/c.mjs')],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/** Returns highlighted HTML (a <pre class="shiki">) with both themes as CSS variables. */
export async function highlight(code: string, language: Language): Promise<string> {
  const h = await getHighlighter();
  return h.codeToHtml(code, {
    lang: language,
    themes: { light: 'journey-light', dark: 'journey-dark' },
    defaultColor: false,
  });
}
