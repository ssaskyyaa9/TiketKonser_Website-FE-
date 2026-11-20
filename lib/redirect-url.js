export const getSafeRedirectPath = (redirectTo, fallback = null) => {
  if (
    typeof redirectTo !== 'string' ||
    !redirectTo.startsWith('/') ||
    redirectTo.startsWith('//') ||
    redirectTo.includes('\\')
  ) {
    return fallback;
  }

  return redirectTo;
};
