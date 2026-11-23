// Escape regex special characters so user input is matched literally.
// Without this, a search like "a(" crashes the query and ".*" matches everything.
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = escapeRegex;
