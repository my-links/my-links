export function faviconLinkBuilder(origin: string) {
  return `http://localhost:3000/api/favicon?url=${origin}`;
}

export function pushStateVanilla(newUrl: string) {
  window.history.replaceState(
    { ...window.history.state, as: newUrl, url: newUrl },
    "",
    newUrl
  );
}
