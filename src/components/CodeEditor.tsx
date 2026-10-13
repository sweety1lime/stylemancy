import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { css } from '@codemirror/lang-css';
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

interface CodeEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  /** Проверка кода: ошибки подчёркиваются прямо в редакторе */
  lint?: (text: string) => Problem[];
  /** Ctrl+Enter */
  onSubmit?: () => void;
  label: string;
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

/** Редактор CSS на CodeMirror 6: подсветка, автодополнение и наши подсказки об ошибках. */
export function CodeEditor({ initialValue, onChange, lint, onSubmit, label, ref }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const setup = useRef({ initialValue, label });
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
          css(),
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
