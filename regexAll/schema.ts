export default {
  $id: "regexAll",
  required: ["text", "regex"],
  type: "object",
  properties: {
    text: {
      type: "string",
      minLength: 1,
    },
    regex: {
      type: "string",
      minLength: 1,
    },
    flags: {
      type: "string",
      minLength: 1,
    },
  },
};
