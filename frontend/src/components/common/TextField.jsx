export default function TextField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  type = 'text',
  ...rest
}) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;

  return (
    <div className={`field ${error ? 'field--invalid' : ''}`.trim()}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="field__required" aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className="field__control"
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
