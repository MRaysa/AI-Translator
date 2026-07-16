export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Allow longer bodies/footers (we include multi-line explanations).
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};
