export function savePHStep(service, step, formData) {
  if (step?.id) {
    return service.update_step(step.id, formData);
  }
  return service.create_step(formData);
}

export function buildPHFormData(values) {
  const fd = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      fd.set(key, String(value));
    }
  });
  return fd;
}
