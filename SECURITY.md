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

xoegit stores your Gemini API key locally on your device with encryption. We do not collect, transmit, or have access to your API key.

### Encryption Details

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key Derivation**: Machine-specific key derived from system properties (hostname, home directory, platform) using SHA-256
- **Format**: `enc:v1:<iv>:<authTag>:<ciphertext>` (base64 encoded)
- **File Permissions**: Config file is created with mode `0600` (owner read/write only)

### Storage Locations

- **Linux**: `~/.config/xoegit/config.json`
- **macOS**: `~/Library/Application Support/xoegit/config.json`
- **Windows**: `%APPDATA%\xoegit\config.json`

### Security Notes

- Keys are encrypted at rest and never stored in plain text
- Encryption is automatic — no password required from users
- Keys are never included in git operations or transmitted over the network (except to Google's API)
- Existing plain text keys are automatically migrated to encrypted format

Thank you for helping keep xoegit secure!
