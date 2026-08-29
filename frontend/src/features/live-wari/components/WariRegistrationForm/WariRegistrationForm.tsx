import { FormEvent, useState } from 'react';

export type WariRegistrationFormValues = {
  wariCode: string;
  name: string;
  source: string;
  destination: string;
};

type WariRegistrationFormProps = {
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit?: (values: WariRegistrationFormValues) => void;
};

const emptyValues = (): WariRegistrationFormValues => ({
  wariCode: '',
  name: '',
  source: '',
  destination: '',
});

export function WariRegistrationForm({
  isSubmitting = false,
  serverError = null,
  onSubmit,
}: WariRegistrationFormProps) {
  const [values, setValues] = useState<WariRegistrationFormValues>(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<keyof WariRegistrationFormValues, string>>>({});

  const updateField = (field: keyof WariRegistrationFormValues, nextValue: string) => {
    setValues((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof WariRegistrationFormValues, string>> = {};
    const trimmedValues = {
      wariCode: values.wariCode.trim(),
      name: values.name.trim(),
      source: values.source.trim(),
      destination: values.destination.trim(),
    };

    if (!trimmedValues.wariCode) {
      nextErrors.wariCode = 'Wari ID is required.';
    }

    if (!trimmedValues.name) {
      nextErrors.name = 'Wari Name is required.';
    }

    if (!trimmedValues.source) {
      nextErrors.source = 'Source is required.';
    }

    if (!trimmedValues.destination) {
      nextErrors.destination = 'Destination is required.';
    }

    return { nextErrors, trimmedValues };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { nextErrors, trimmedValues } = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit?.({
      wariCode: trimmedValues.wariCode,
      name: trimmedValues.name,
      source: trimmedValues.source,
      destination: trimmedValues.destination,
    });
  };

  return (
    <form className="w-full space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="wari-code" className="block text-sm font-medium text-slate-700">
          Wari ID / Wari Code
        </label>
        <input
          id="wari-code"
          type="text"
          value={values.wariCode}
          onChange={(event) => updateField('wariCode', event.target.value)}
          placeholder="e.g. SW-002"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-150 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          disabled={isSubmitting}
        />
        {errors.wariCode ? <p className="text-sm text-rose-600">{errors.wariCode}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="wari-name" className="block text-sm font-medium text-slate-700">
          Wari Name
        </label>
        <input
          id="wari-name"
          type="text"
          value={values.name}
          onChange={(event) => updateField('name', event.target.value)}
          placeholder="e.g. Pandharpur to Alandi Wari"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-150 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          disabled={isSubmitting}
        />
        {errors.name ? <p className="text-sm text-rose-600">{errors.name}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="source" className="block text-sm font-medium text-slate-700">
          Source
        </label>
        <input
          id="source"
          type="text"
          value={values.source}
          onChange={(event) => updateField('source', event.target.value)}
          placeholder="e.g. Pandharpur"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-150 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          disabled={isSubmitting}
        />
        {errors.source ? <p className="text-sm text-rose-600">{errors.source}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="destination" className="block text-sm font-medium text-slate-700">
          Destination
        </label>
        <input
          id="destination"
          type="text"
          value={values.destination}
          onChange={(event) => updateField('destination', event.target.value)}
          placeholder="e.g. Alandi"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-150 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          disabled={isSubmitting}
        />
        {errors.destination ? <p className="text-sm text-rose-600">{errors.destination}</p> : null}
      </div>

      {serverError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {serverError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-sky-400"
      >
        {isSubmitting ? 'Creating Wari...' : 'Create Wari'}
      </button>
    </form>
  );
}

export default WariRegistrationForm;
