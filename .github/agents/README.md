# GitHub Copilot Agents

This directory contains custom agents for GitHub Copilot that provide specialized assistance for the AMARRE project.

## Available Agents

### Security Audit Agent

**File**: `security-audit.agent.md`

**Purpose**: Analyzes the codebase for security vulnerabilities, best practices, and compliance with secure coding standards.

**Focus Areas**:

- Authentication and session security
- Secrets management
- API security (Appwrite, REDCap)
- Input validation and sanitization
- Web security (XSS, CSRF, etc.)
- Dependency security

**How to Use**:

1. In GitHub Copilot Chat, mention `@security-audit` to invoke the agent
2. Ask it to review code changes, analyze security concerns, or provide recommendations
3. The agent will provide categorized findings (Critical → Low priority)

**Examples**:

- `@security-audit Review my authentication changes`
- `@security-audit Check this API endpoint for security issues`
- `@security-audit Are there any hardcoded secrets in the codebase?`

## Agent Configuration

Agents are configured using Markdown files with YAML frontmatter. See [GitHub's documentation](https://docs.github.com/en/copilot/reference/custom-agents-configuration) for more details.

### Key Configuration Options

- **name**: Display name for the agent
- **description**: Brief description of the agent's purpose
- **target**: Where the agent runs (`github-copilot` or `vscode`)
- **tools**: Which tools the agent can use (`read`, `search`, `list`, etc.)
- **infer**: Whether Copilot can auto-assign the agent based on context

## Adding New Agents

To add a new custom agent:

1. Create a new `.agent.md` file in this directory
2. Add YAML frontmatter with required fields (`name`, `description`)
3. Write clear instructions for the agent's behavior
4. Test the agent by invoking it in GitHub Copilot Chat

## Project-Specific Context

### Technology Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Backend**: Appwrite (BaaS)
- **External API**: REDCap
- **Package Manager**: pnpm

### Security Considerations

- Magic URL authentication (passwordless)
- Session management with secure cookies
- Server-side API key management
- Domain allowlist for email validation
- Zod validators for input validation

## Maintenance

- Review and update agents when project architecture changes
- Keep agent instructions aligned with current security best practices
- Test agents regularly to ensure they provide accurate guidance
