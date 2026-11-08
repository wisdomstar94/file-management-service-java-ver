export const readOptionalFormValue = (form: FormData, name: string) => {
  const value = String(form.get(name) ?? "");
  return value === "" ? undefined : value;
};
