import {
  html,
  css,
  LitElement
} from "https://unpkg.com/lit@2.0.0-rc.2/index.js?module";

class SubmitButton extends LitElement {
  static get styles() {
    return css`
      button {
        cursor: pointer;
        padding: 10px;
        background-color: #007bff;
        border: none;
        border-radius: 4px;
        color: white !important;
        outline: none;
        text-align: center;
        margin: 0;
        font-size: 15px;
      }
    `;
  }

  render() {
    return html`
      <button type="submit" @click=${this.clickEvent}>Submit</button>
    `;
  }

  clickEvent(e) {
    this.element.parentElement.dispatchEvent(new SubmitEvent());
  }
}

customElements.define("submit-button", SubmitButton);
