export function asset(path) {
  // path example: "images/housing/studio/5.jpg" (NO leading slash)
  return `${import.meta.env.BASE_URL}${path}`;
}
