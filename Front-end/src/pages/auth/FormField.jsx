function FormField({ label, name, error, ...inputProps }) {
  return (
    <label className="form-field" htmlFor={name}>
      <span className="form-field__label">{label}</span>
      <input
        id={name}
        name={name}
        className={`form-field__input ${error ? 'form-field__input--error' : ''}`}
        aria-invalid={Boolean(error)}
        {...inputProps}
      />
      {error && <span className="form-field__error">{error}</span>}
    </label>
  )
}

export default FormField
