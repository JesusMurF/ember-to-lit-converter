import { LitElement, css, html } from 'lit';
import { tailwindCss } from './styles/tailwind.styles.js';
import './components/code-editor.js';

const EXAMPLE_EMBER_CODE = `import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CounterComponent extends Component {
  @tracked count = 0;
  @tracked name = 'World';

  get greeting() {
    return \`Hello, \${this.name}!\`;
  }

  @action
  increment() {
    this.count++;
  }

  @action
  decrement() {
    this.count--;
  }

  @action
  reset() {
    this.count = 0;
  }
}`;

/**
 * Root application component for Ember to Lit converter.
 *
 * @extends LitElement
 */
export class AppRoot extends LitElement {
  static properties = {
    emberCode: { type: String },
    litCode: { type: String },
    isLoading: { type: Boolean },
    error: { type: String },
    copied: { type: Boolean },
  };

  static styles = [
    tailwindCss,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        font-family: var(--font-geist);
        background-color: #000;
        color: var(--color-text-primary);
        box-sizing: border-box;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 1.5px solid rgba(0, 0, 0, 0.3);
        border-top-color: #000;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        flex-shrink: 0;
      }

      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: var(--color-border-medium);
        border-radius: 3px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `,
  ];

  constructor() {
    super();
    this.emberCode = EXAMPLE_EMBER_CODE;
    this.litCode = '';
    this.isLoading = false;
    this.error = '';
    this.copied = false;
  }

  /**
   * Converts Ember code to Lit by calling the backend API.
   *
   * @async
   */
  async convertCode() {
    if (!this.emberCode.trim()) {
      this.error = 'Please enter some Ember code';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.litCode = '';

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: this.emberCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Conversion failed');
      }

      const data = await response.json();
      this.litCode = data.litCode;
    } catch (err) {
      this.error = err.message;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Handles content changes from the input code editor.
   *
   * @param {CustomEvent} e - value-change event with new code as detail
   */
  handleInputChange(e) {
    this.emberCode = e.detail;
  }

  /**
   * Copies the output Lit code to the clipboard.
   *
   * @async
   */
  async copyOutput() {
    await navigator.clipboard.writeText(this.litCode);
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 1500);
  }

  render() {
    const lineCount = this.litCode ? this.litCode.split('\n').length : null;

    return html`
      <!-- NAVBAR -->
      <nav
        class="flex items-center justify-between px-6 border-b border-border-subtle shrink-0"
        style="height: 52px; background: #000;"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-7 h-7 bg-white rounded text-black font-semibold text-sm select-none"
          >
            E
          </div>
          <span class="font-medium text-text-primary text-sm tracking-tight"
            >Ember to Lit Converter</span
          >
          <span
            class="px-2 py-0.5 text-xs font-medium rounded-full border border-border-medium text-text-secondary"
          >
            converter
          </span>
        </div>
        <a
          href="https://x.com/JesusMurF"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-text-secondary hover:text-text-primary"
          style="transition: color 0.15s ease;"
        >
          @JesusMurF
        </a>
      </nav>

      <!-- MAIN -->
      <main class="flex flex-1 min-h-0 p-6 gap-4" style="background: #000;">
        <!-- PANEL INPUT -->
        <div
          class="flex flex-col flex-1 min-h-0 rounded-lg border border-border-subtle overflow-hidden"
          style="background: #0a0a0a;"
        >
          <!-- Card header -->
          <div
            class="flex items-center gap-2 px-4 py-3 border-b border-border-subtle shrink-0"
            style="background: var(--color-bg-surface);"
          >
            <span
              class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border"
              style="background: var(--color-badge-ember-bg); border-color: var(--color-badge-ember-border); color: var(--color-badge-ember-text);"
            >
              Ember JS
            </span>
            <span class="text-xs" style="color: var(--color-text-tertiary);"
              >Input</span
            >
          </div>

          <!-- Editor -->
          <div class="flex-1 min-h-0">
            <code-editor-element
              style="height: 100%; display: block;"
              .value=${this.emberCode}
              @value-change=${this.handleInputChange}
            ></code-editor-element>
          </div>

          <!-- Card footer -->
          <div
            class="shrink-0 px-4 py-3 border-t border-border-subtle"
            style="background: var(--color-bg-surface);"
          >
            ${this.error
              ? html`<div
                  class="mb-3 px-3 py-2 text-xs rounded-md border"
                  style="color: var(--color-error); background: var(--color-error-bg); border-color: var(--color-error-border);"
                >
                  ${this.error}
                </div>`
              : ''}
            <button
              class="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium rounded-md cursor-pointer disabled:cursor-not-allowed"
              style="${this.isLoading
                ? 'background: #222; color: #555;'
                : 'background: #fff; color: #000;'} transition: background 0.15s ease, color 0.15s ease;"
              @click=${this.convertCode}
              ?disabled=${this.isLoading}
            >
              ${this.isLoading
                ? html`<span class="spinner"></span><span>Converting...</span>`
                : html`<span>Convert to Lit</span>`}
            </button>
          </div>
        </div>

        <!-- PANEL OUTPUT -->
        <div
          class="flex flex-col flex-1 min-h-0 rounded-lg border border-border-subtle overflow-hidden"
          style="background: #111111;"
        >
          <!-- Card header -->
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-border-subtle shrink-0"
            style="background: var(--color-bg-surface);"
          >
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border"
                style="background: var(--color-badge-lit-bg); border-color: var(--color-badge-lit-border); color: var(--color-badge-lit-text);"
              >
                Lit
              </span>
              <span class="text-xs" style="color: var(--color-text-tertiary);"
                >Output</span
              >
            </div>
            <button
              class="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border border-border-subtle cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style="background: var(--color-bg-elevated); color: var(--color-text-secondary); transition: color 0.15s ease, border-color 0.15s ease;"
              @click=${this.copyOutput}
              ?disabled=${!this.litCode}
            >
              ${this.copied
                ? html`<span style="color: #4ade80;">Copied!</span>`
                : html`<span>Copy</span>`}
            </button>
          </div>

          <!-- Editor -->
          <div class="flex-1 min-h-0">
            <code-editor-element
              style="height: 100%; display: block;"
              .value=${this.litCode}
              readonly
            ></code-editor-element>
          </div>

          <!-- Card footer -->
          <div
            class="shrink-0 px-4 border-t border-border-subtle flex items-center justify-end"
            style="background: var(--color-bg-surface); height: 60px;"
          >
            ${lineCount !== null
              ? html`<span
                  class="text-xs"
                  style="color: var(--color-text-tertiary);"
                  >${lineCount} lines</span
                >`
              : html`<span
                  class="text-xs"
                  style="color: var(--color-text-tertiary);"
                  >Output will appear here</span
                >`}
          </div>
        </div>
      </main>

      <!-- FOOTER -->
      <footer
        class="shrink-0 flex items-center justify-center py-4 border-t border-border-subtle"
        style="background: #000;"
      >
        <span class="text-xs" style="color: var(--color-text-tertiary);">
          Made with ❤️ by
          <a
            href="https://x.com/JesusMurF"
            target="_blank"
            rel="noopener noreferrer"
            class="text-text-secondary hover:text-text-primary"
            style="transition: color 0.15s ease;"
            >@JesusMurF</a
          >
        </span>
      </footer>
    `;
  }
}

customElements.define('app-root', AppRoot);
