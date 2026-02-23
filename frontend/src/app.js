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
        display: block;
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
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
   * Handles content changes from the input Monaco editor.
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
    return html`
      <h1 class="text-2xl font-semibold text-text-primary mb-8">
        Ember to Lit Converter
      </h1>

      <div class="grid grid-cols-2 gap-16">
        <div class="flex flex-col">
          <h2 class="text-sm font-medium text-text-secondary mb-2">
            Ember Code (Input)
          </h2>
          <code-editor-element
            class="border border-border-subtle rounded-md overflow-hidden"
            style="height: 500px"
            .value=${this.emberCode}
            @value-change=${this.handleInputChange}
          ></code-editor-element>
          <button
            class="mt-4 px-6 py-3 bg-white text-black font-medium text-sm rounded-md cursor-pointer hover:bg-[#e5e5e5] disabled:bg-[#333333] disabled:text-[#666666] disabled:cursor-not-allowed"
            @click=${this.convertCode}
            ?disabled=${this.isLoading}
          >
            ${this.isLoading ? 'Converting...' : 'Convert to Lit'}
          </button>
          ${this.error
            ? html`<div
                class="mt-4 p-4 text-error bg-[rgba(255,68,68,0.08)] border border-[rgba(255,68,68,0.3)] rounded-md"
              >
                ${this.error}
              </div>`
            : ''}
        </div>

        <div class="flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-sm font-medium text-text-secondary">
              Lit Code (Output)
            </h2>
            <button
              class="px-3 py-1 text-xs font-medium rounded-md cursor-pointer bg-[#1e1e1e] text-text-secondary border border-border-subtle hover:text-text-primary hover:border-[#444] disabled:opacity-30 disabled:cursor-not-allowed"
              @click=${this.copyOutput}
              ?disabled=${!this.litCode}
            >
              ${this.copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <code-editor-element
            class="border border-border-subtle rounded-md overflow-hidden"
            style="height: 500px"
            .value=${this.litCode}
            readonly
          ></code-editor-element>
        </div>
      </div>

      <p class="mt-12 text-center text-sm text-text-secondary">
        Made with ❤️ by
        <a
          href="https://x.com/JesusMurF"
          target="_blank"
          rel="noopener noreferrer"
          class="text-text-primary hover:underline"
        >@JesusMurF</a>
      </p>
    `;
  }
}

customElements.define('app-root', AppRoot);
