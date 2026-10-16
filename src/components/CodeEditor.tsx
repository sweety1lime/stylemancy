import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { linter, lintGutter, type Diagnostic } from '@codemirror/lint';
import { EditorState } from '@codemirror/state';
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import type { Problem } from '../engine/lint';

export interface CodeEditorHandle {
  setValue(text: string): void;
  focus(): void;
}

/** На каком языке пишет студент */
export type EditorLanguage = 'css' | 'html' | 'js';

interface CodeEditorProps {
  language?: EditorLanguage;
  initialValue: string;
  onChange: (value: string) => void;
  /** Проверка кода: ошибки подчёркиваются прямо в редакторе */
  lint?: (text: string) => Problem[];
  /** Ctrl+Enter */
  onSubmit?: () => void;
  label: string;
  /** Сразу поставить курсор туда, где студент начнёт писать (кроме сенсорных экранов) */
  autoFocus?: boolean;
  ref?: Ref<CodeEditorHandle>;
}

const highlight = HighlightStyle.define([
  { tag: [t.className, t.tagName, t.labelName], color: '#f4c76b' },
  { tag: t.propertyName, color: '#9cc9ff' },
  { tag: [t.atom, t.keyword], color: '#c9b8ff' },
  { tag: [t.number, t.unit], color: '#ffb4a8' },
  { tag: [t.color, t.string], color: '#8ce9bd' },
  { tag: t.blockComment, color: '#7e75a6', fontStyle: 'italic' },
  { tag: [t.definitionKeyword, t.modifier], color: '#f0abfc' },
  { tag: [t.brace, t.separator, t.punctuation], color: '#b8b0dc' },
  // HTML
  { tag: t.attributeName, color: '#9cc9ff' },
  { tag: t.attributeValue, color: '#8ce9bd' },
  { tag: t.angleBracket, color: '#b8b0dc' },
  { tag: t.comment, color: '#7e75a6', fontStyle: 'italic' },
  { tag: t.documentMeta, color: '#f0abfc' },
  // JavaScript: новые колбы — золотом, команды — голубым
  { tag: t.definition(t.variableName), color: '#f4c76b' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#9cc9ff' },
  { tag: [t.bool, t.null], color: '#c9b8ff' },
  { tag: t.operator, color: '#b8b0dc' },
]);

const theme = EditorView.theme(
  {
    '&': { color: 'var(--text)', backgroundColor: 'transparent', fontSize: '15px' },
    '.cm-content': { fontFamily: 'var(--font-mono)', caretColor: 'var(--gold)', padding: '12px 0' },
    '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6' },
    '&.cm-focused': { outline: 'none' },
    '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--gold)', borderLeftWidth: '2px' },
    '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--muted-2)', border: 'none' },
    '.cm-activeLine': { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--gold)' },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'rgba(167, 139, 250, 0.32)',
    },
    '.cm-tooltip': { backgroundColor: 'var(--panel-3)', border: '1px solid var(--line-strong)', color: 'var(--text)' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: 'rgba(167, 139, 250, 0.4)', color: 'var(--text)' },
    '.cm-diagnostic': { padding: '6px 10px', fontFamily: 'var(--font-ui)', fontSize: '14px', maxWidth: '420px' },
    '.cm-diagnostic-error': { borderLeft: '4px solid var(--danger)' },
    '.cm-diagnostic-warning': { borderLeft: '4px solid var(--gold)' },
  },
  { dark: true },
);

function toDiagnostics(problems: Problem[], length: number): Diagnostic[] {
  return problems.map((p) => {
    const from = Math.min(Math.max(0, p.from), length);
    const to = Math.min(Math.max(from, p.to), length);
    return { from, to, severity: p.severity, message: p.message };
  });
}

/**
 * Где начать писать: заготовку-комментарий выделяем целиком (её заменят),
 * иначе курсор — в конец последней строки перед первой «}».
 */
function startSelection(text: string, language: EditorLanguage): { anchor: number; head?: number } {
  // В скрипте комментарии — пояснения, их не трогаем: курсор — на первую пустую строку, где писать
  if (language === 'js') {
    const empty = /^[ \t]*$/m.exec(text);
    return { anchor: empty ? empty.index : text.length };
  }
  const comment = (language === 'html' ? /<!--[\s\S]*?-->/ : /\/\*[\s\S]*?\*\//).exec(text);
  if (comment) return { anchor: comment.index, head: comment.index + comment[0].length };
  // В разметке без заготовки курсор — в начале: чаще всего её нужно чинить
  if (language === 'html') return { anchor: 0 };
  const close = text.indexOf('}');
  if (close === -1) return { anchor: text.length };
  const lineEnd = text.lastIndexOf('\n', close);
  return { anchor: lineEnd === -1 ? close : lineEnd };
}

/** Редактор CSS, HTML или JavaScript на CodeMirror 6: подсветка, автодополнение и наши подсказки об ошибках. */
export function CodeEditor({ language = 'css', initialValue, onChange, lint, onSubmit, label, autoFocus, ref }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const setup = useRef({ language, initialValue, label, autoFocus });
  const callbacks = useRef({ onChange, lint, onSubmit });

  useEffect(() => {
    callbacks.current = { onChange, lint, onSubmit };
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: setup.current.initialValue,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          highlightActiveLine(),
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                callbacks.current.onSubmit?.();
                return true;
              },
            },
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            ...completionKeymap,
            indentWithTab,
          ]),
          // Теги студент закрывает сам — этому и учимся
          setup.current.language === 'html' ? html({ autoCloseTags: false }) : setup.current.language === 'js' ? javascript() : css(),
          syntaxHighlighting(highlight),
          theme,
          lintGutter(),
          linter((v) => toDiagnostics(callbacks.current.lint?.(v.state.doc.toString()) ?? [], v.state.doc.length), {
            delay: 300,
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) callbacks.current.onChange(update.state.doc.toString());
          }),
          EditorView.contentAttributes.of({ 'aria-label': setup.current.label }),
        ],
      }),
    });
    viewRef.current = view;
    if (setup.current.autoFocus && window.matchMedia('(pointer: fine)').matches) {
      view.dispatch({ selection: startSelection(view.state.doc.toString(), setup.current.language) });
      view.contentDOM.focus({ preventScroll: true });
    }
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setValue(text) {
        const view = viewRef.current;
        if (view) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
      },
      focus() {
        viewRef.current?.focus();
      },
    }),
    [],
  );

  return <div className="code-editor" ref={hostRef} />;
}
