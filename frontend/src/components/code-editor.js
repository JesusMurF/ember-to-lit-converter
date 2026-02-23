import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { LitElement, css, html } from 'lit';

/**
 * Reusable CodeMirror 6 editor component.
 *
 * Emits a `value-change` CustomEvent with the new value as `event.detail`
 * whenever the user edits the content.
 *
 * @extends LitElement
 */
export class CodeEditorElement extends LitElement {
  static properties = {
    value: { type: String },
    language: { type: String },
    readonly: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
    }
    #container {
      height: 100%;
    }
    .cm-editor {
      height: 100%;
      font-family: 'Geist Mono', 'Courier New', monospace;
      font-size: 13px;
    }
    .cm-scroller {
      overflow: auto;
    }
  `;

  constructor() {
    super();
    this.value = '';
    this.language = 'javascript';
    this.readonly = false;
    this._view = null;
  }

  firstUpdated() {
    const container = this.renderRoot.querySelector('#container');

    this._view = new EditorView({
      state: EditorState.create({
        doc: this.value ?? '',
        extensions: [
          basicSetup,
          javascript(),
          oneDark,
          EditorView.lineWrapping,
          EditorView.editable.of(!this.readonly),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              this.dispatchEvent(
                new CustomEvent('value-change', {
                  detail: this._view.state.doc.toString(),
                  bubbles: true,
                  composed: true,
                })
              );
            }
          }),
        ],
      }),
      parent: container,
      root: this.renderRoot,
    });
  }

  updated(changedProperties) {
    if (changedProperties.has('value') && this._view) {
      const current = this._view.state.doc.toString();
      if (current !== this.value) {
        this._view.dispatch({
          changes: { from: 0, to: current.length, insert: this.value ?? '' },
        });
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._view?.destroy();
    this._view = null;
  }

  render() {
    return html`<div id="container"></div>`;
  }
}

customElements.define('code-editor-element', CodeEditorElement);
