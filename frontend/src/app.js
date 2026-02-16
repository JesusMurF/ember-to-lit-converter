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
    error: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      color: #333;
      margin-bottom: 2rem;
    }

    .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .panel {
      display: flex;
      flex-direction: column;
    }

    h2 {
      font-size: 1rem;
      color: #666;
      margin-bottom: 0.5rem;
    }

    textarea {
      width: 100%;
      min-height: 400px;
      padding: 1rem;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
    }

    textarea:focus {
      outline: 2px solid #4CAF50;
      border-color: transparent;
    }

    button {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }

    button:hover {
      background: #45a049;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .error {
      color: #d32f2f;
      margin-top: 1rem;
      padding: 1rem;
      background: #ffebee;
      border-radius: 4px;
    }

    .output {
      background: #f5f5f5;
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
          <button
            @click=${this.convertCode}
            ?disabled=${this.isLoading}
          >
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
