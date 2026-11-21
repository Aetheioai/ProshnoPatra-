# Security Policy

## Architecture Note

ProshnoPatra is a static, client-side web application. It does not operate a backend database, user authentication system, or telemetry endpoint. All papers are stored locally in the user's browser (`localStorage`) or exported as local `.json` and `.pdf` files.

Potential security concerns therefore focus on client-side safety, such as:
- Cross-site scripting (XSS) via imported `.json` drafts, pasted text, or KaTeX math rendering
- Malicious file handling during image or JSON draft import
- Supply-chain vulnerabilities in npm dependencies

## Reporting a Vulnerability

If you discover a security vulnerability, please do **not** open a public issue.

Instead, report it privately using GitHub's **Security Advisories** ("Report a vulnerability" in the repository's **Security** tab). Please include:

- A clear description of the issue and its impact
- Minimal steps to reproduce (or a sample JSON draft if applicable)
- Any suggested fix, if you have one

We will acknowledge your report promptly and coordinate a fix before public disclosure.
