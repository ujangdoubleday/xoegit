# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within xoegit, please report it responsibly.

### How to Report

1. **Do NOT** open a public issue for security vulnerabilities
2. Email the maintainers or [create a private security advisory](https://github.com/ujangdoubleday/xoegit/security/advisories/new)
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Updates**: We will provide updates on the progress
- **Resolution**: We aim to resolve critical vulnerabilities within 7 days

### Security Best Practices

When using xoegit:

1. **API Keys**: Never commit your API key to version control
2. **Dependencies**: Keep dependencies up to date
3. **Permissions**: Run with minimal required permissions

## API Key Security

xoegit stores your Gemini API key locally on your device. We do not collect, transmit, or have access to your API key.

- Keys are stored in your user's home directory
- Keys are never included in git operations or transmitted over the network (except to Google's API)

Thank you for helping keep xoegit secure!
