// `options` is a list of strings (value = label) or { value, label } objects.
export default function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  options = [],
  placeholder,
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
      <select
        id={id}
        name={name}
        className="field__control"
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const { value: v, label: l } = typeof opt === 'string' ? { value: opt, label: opt } : opt;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
