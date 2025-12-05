import next from "eslint-config-next";

const config = [
  ...next,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;

