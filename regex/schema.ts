export default {
  $id: "regex",
  type: "object",
  required: ["text", "regex"],
  properties: {
    text: {
      type: "string",
      minLength: 1
    },
    regex: {
      type: "string",
      minLength: 1
    },
    flags: {
      type: "string",
      minLength: 1
    }
  }
};
