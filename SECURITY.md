# FolderHarbor Security Policy
Hi! This is everything security for FolderHarbor :3
## Versions
I support the latest release of each component, as well as the final release of the last major version.
For example, if the latest version was `v4.0.1`, I would support `v4.0.1` and `v3.1.4` (if that was the final v3 version, I'm just making up numbers for this example).
## Reporting
Please report vulnerabilities through the Security tab on GitHub, by creating a [Security Advisory](https://github.com/aelithron/folderharbor/security/advisories).
Alternatively, you can send an email to `aelithron@gmail.com`, but I may not respond very quickly.
## Scope
The scope varies for each component. If something is not in either list, please make a report anyway, and we will work it out.
### Server
In scope:
- Authentication bypasses
- Privilege escalation
- Path traversal
- Improper information exposure

Out of scope:
- DoS/DDoS attacks
- Administrator error
- Non-major supply-chain issues (report them to the upstream provider)
- General bugs (make a [GitHub Issue](https://github.com/aelithron/folderharbor/issues) for these instead)
### CLI
In scope:
- TLS validation

Out of scope:
- Credential storage security
- Non-major supply-chain issues (report them to the upstream provider)
- General bugs (make a [GitHub Issue](https://github.com/aelithron/folderharbor/issues) for these instead)
### Web Panel
In scope:
- CSRF
- XSS

Out of scope:
- DoS/DDoS attacks
- Non-major supply-chain issues (report them to the upstream provider)
- General bugs (make a [GitHub Issue](https://github.com/aelithron/folderharbor/issues) for these instead)
## Disclosure
I will acknowledge all reports within seven days of submission, and I'll try to have issues patched within 14-30 days.
These times are barring any major personal issues that make responses/fixes take longer. Email reports will likely take longer than GitHub ones.

I will publish vulnerability disclosures after releasing the patched version, and I ask that reporters do not disclose issues publicly until this happens.
If I don't have an issue fixed within sixty days, you can publicly disclose the issues.
## Bounty
I sadly am unable to offer bug bounties at this current time, but I will publicly credit you in the README, release notes, and offer a letter of recommendation if you would like any of those.
If you report a major vulnerability and I have the financial means, I may also buy you lunch in the form of a gift card.
