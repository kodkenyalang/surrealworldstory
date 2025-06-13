# Contributing to VerifydIP

We welcome contributions to the VerifydIP Indigenous IP Protection Platform! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Focus on what is best for the community
- Show empathy towards other community members
- Respect indigenous cultures and traditions

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment following the README
4. Create a new branch for your feature or bugfix

## Development Workflow

### Branch Naming
- Features: `feature/description-of-feature`
- Bug fixes: `bugfix/description-of-bug`
- Documentation: `docs/description-of-change`
- Refactoring: `refactor/description-of-change`

### Commit Messages
Follow conventional commit format:
```
type(scope): brief description

Detailed explanation if needed

Closes #issue-number
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

1. Ensure your code follows the project's coding standards
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure all tests pass
5. Create a pull request with a clear description

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React Components
- Use functional components with hooks
- Follow component naming conventions (PascalCase)
- Keep components focused and reusable
- Use proper TypeScript types

### Styling
- Use Tailwind CSS utilities
- Follow the established design system
- Ensure responsive design
- Test on multiple screen sizes

### Backend
- Use proper error handling
- Validate input data
- Follow RESTful API conventions
- Add proper logging

## Testing

### Running Tests
```bash
npm test
```

### Writing Tests
- Write unit tests for utilities and functions
- Write integration tests for API endpoints
- Write component tests for React components
- Aim for good test coverage

## Documentation

- Update README.md if adding new features
- Add inline code comments for complex logic
- Update API documentation for new endpoints
- Include examples in documentation

## Cultural Sensitivity

When contributing to this project:

- Respect indigenous cultures and traditions
- Avoid cultural appropriation
- Use inclusive language
- Consider the impact on indigenous communities
- Consult with community representatives when appropriate

## Blockchain Development

### Smart Contracts
- Follow Solidity best practices
- Add comprehensive tests
- Document contract interfaces
- Consider gas optimization

### Web3 Integration
- Handle wallet connection errors gracefully
- Provide clear transaction feedback
- Support multiple wallet types
- Test on testnets before mainnet

## Reporting Issues

When reporting bugs:
1. Use the issue template
2. Provide clear reproduction steps
3. Include environment details
4. Add relevant logs or screenshots

## Feature Requests

When requesting features:
1. Explain the use case
2. Consider impact on indigenous communities
3. Provide implementation ideas if possible
4. Discuss with maintainers first for large features

## Security

- Never commit private keys or secrets
- Report security vulnerabilities privately
- Follow secure coding practices
- Review dependencies for vulnerabilities

## Questions?

If you have questions about contributing:
- Check existing documentation
- Search closed issues
- Ask in discussions
- Contact maintainers

Thank you for contributing to VerifydIP!