import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**", 
      ".next/**", 
      "out/**",
      "build/**",
      "dist/**",
      "public/**",
      ".cache/**",
      ".eslintcache",
      "**/generated/**",         // Ignore all generated files
      "lib/generated/**",        // Specifically ignore Prisma generated files
      "**/*.generated.*",        // Ignore any files with .generated. in the name
      "prisma/client/**",        // Ignore Prisma client
      "*.min.js",                // Ignore minified JS
      "*.bundle.js"              // Ignore bundled JS
    ]
  },
  // Basic configurations using the compatibility layer
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // TypeScript configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      // TypeScript specific rules - lowered severity for existing codebase
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-require-imports": "warn", // Downgraded from error to warn
      
      // Disable rules that are causing too many errors initially
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off"
    }
  },
  
  // React specific configuration
  {
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: {
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin
    },
    rules: {
      // React hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // React-specific rules
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      "react/jsx-no-target-blank": "warn"
    }
  },
  
  // Global rules for all files
  {
    rules: {
      // General best practices - reduced severity for existing codebase
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "prefer-const": "warn",
      "no-unused-vars": "off", // Turned off in favor of TypeScript's version
      "eqeqeq": ["warn", "always", { "null": "ignore" }]
    }
  }
];

export default eslintConfig;
