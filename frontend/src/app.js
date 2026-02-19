import { LitElement, html, css } from 'lit';

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
  };

  static styles = css`
    :host {
      display: block;
      padding: 2rem;
      font-family:
        'Geist',
        system-ui,
        sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      color: #ededed;
    }

    h1 {
      color: #ededed;
      margin-bottom: 2rem;
      font-weight: 600;
    }

    .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
    }

    .panel {
      display: flex;
      flex-direction: column;
    }

    h2 {
      font-size: 1rem;
      color: #888;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    textarea {
      width: 100%;
      min-height: 400px;
      padding: 1rem;
      font-family: 'Geist Mono', 'Courier New', monospace;
      font-size: 0.9rem;
      border: 1px solid #2a2a2a;
      border-radius: 6px;
      resize: vertical;
      background: #0a0a0a;
      color: #ededed;
    }

    textarea:focus {
      outline: 2px solid #fff;
      border-color: transparent;
    }

    button {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #fff;
      color: #000;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-family: 'Geist', system-ui, sans-serif;
      font-weight: 500;
      cursor: pointer;
    }

    button:hover {
      background: #e5e5e5;
    }

    button:disabled {
      background: #333;
      color: #666;
      cursor: not-allowed;
    }

    .error {
      color: #ff4444;
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(255, 68, 68, 0.08);
      border: 1px solid rgba(255, 68, 68, 0.3);
      border-radius: 6px;
    }

    .output {
      background: #111;
    }
  `;

  constructor() {
    super();
    this.emberCode = '';
    this.litCode = '';
    this.isLoading = false;
    this.error = '';
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
      const response = await fetch('http://localhost:3000/api/convert', {
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
   * Handles input changes in the Ember code textarea.
   *
   * @param {Event} e - Input event
   */
  handleInput(e) {
    this.emberCode = e.target.value;
  }

  render() {
    return html`
      <h1>Ember to Lit Converter</h1>

      <div class="container">
        <div class="panel">
          <h2>Ember Code (Input)</h2>
          <textarea
            placeholder="Paste your Ember component here..."
            .value=${this.emberCode}
            @input=${this.handleInput}
          ></textarea>
          <button @click=${this.convertCode} ?disabled=${this.isLoading}>
            ${this.isLoading ? 'Converting...' : 'Convert to Lit'}
          </button>
          ${this.error ? html`<div class="error">${this.error}</div>` : ''}
        </div>

        <div class="panel">
          <h2>Lit Code (Output)</h2>
          <textarea
            class="output"
            readonly
            .value=${this.litCode}
            placeholder="Converted Lit code will appear here..."
          ></textarea>
        </div>
      </div>
    `;
  }
}

customElements.define('app-root', AppRoot);
