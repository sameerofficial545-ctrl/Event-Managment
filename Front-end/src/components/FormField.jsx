import './FormField.css'

function FormField({ label, name, error, as = 'input', ...inputProps }) {
  const Tag = as === 'textarea' ? 'textarea' : 'input'

  return (
    <label className="form-field" htmlFor={name}>
      <span className="form-field__label">{label}</span>
      <Tag
        id={name}
        name={name}
        className={`form-field__input ${as === 'textarea' ? 'form-field__input--textarea' : ''} ${error ? 'form-field__input--error' : ''}`}
        aria-invalid={Boolean(error)}
        {...inputProps}
      />
      {error && <span className="form-field__error">{error}</span>}
    </label>
  )
}

export default FormField
