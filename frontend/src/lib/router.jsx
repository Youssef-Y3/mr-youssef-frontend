// Simple hash-based router
function useRoute() {
  const [route, setRoute] = React.useState(() => parseHash());
  React.useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}
function parseHash() {
  const h = location.hash || "#/";
  const clean = h.replace(/^#\/?/, "");
  const [path, qs=""] = clean.split("?");
  const parts = path.split("/").filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(qs));
  return { path: "/" + parts.join("/"), parts, query, hash: h };
}
function nav(path) {
  if (!path.startsWith("#")) path = "#" + (path.startsWith("/") ? path : "/"+path);
  location.hash = path;
}

Object.assign(window, { useRoute, parseHash, nav });
