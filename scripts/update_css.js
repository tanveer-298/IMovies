const fs = require('fs');

const cssPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const formStyles = `
/* ==========================================================
   HIGH CONTRAST FORM CONTROLS & LABELS
   ========================================================== */
.form-label {
  color: #f1f5f9 !important;
  font-weight: 600 !important;
  font-size: 0.88rem !important;
  margin-bottom: 0.4rem !important;
  letter-spacing: 0.2px;
}

.form-control, .form-select {
  background-color: #131d31 !important;
  color: #ffffff !important;
  border: 1px solid #334155 !important;
  border-radius: 8px !important;
  padding: 0.65rem 0.9rem !important;
  font-size: 0.92rem !important;
  transition: all 0.2s ease-in-out !important;
}

.form-control::placeholder {
  color: #94a3b8 !important;
  opacity: 1 !important;
  font-size: 0.88rem !important;
}

.form-control:focus, .form-select:focus {
  background-color: #1a2742 !important;
  color: #ffffff !important;
  border-color: #e50914 !important;
  box-shadow: 0 0 0 0.25rem rgba(229, 9, 20, 0.3) !important;
  outline: none !important;
}

.input-group-text {
  background-color: #1c273e !important;
  border: 1px solid #334155 !important;
  color: #f43f5e !important;
  padding: 0.65rem 0.9rem !important;
}

.input-group:focus-within .input-group-text {
  border-color: #e50914 !important;
  color: #ffffff !important;
  background-color: #e50914 !important;
}

.form-text {
  color: #94a3b8 !important;
  font-size: 0.78rem !important;
}
`;

css += '\n' + formStyles;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Appended high-contrast form styles to index.css');
