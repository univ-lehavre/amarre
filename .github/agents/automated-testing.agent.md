# Automated Testing AI Agent

## Purpose

This AI agent is dedicated to automated testing of the application, with a focus on:
- **Non-regression testing**: Ensuring updates don't break existing functionality
- **Drift detection**: Identifying unintended changes in application behavior
- **Test coverage**: Maximizing test coverage across the codebase
- **Continuous validation**: Running comprehensive tests in CI/CD pipelines

## Agent Capabilities

### 1. Non-Regression Testing
- Automatically run all existing tests after major updates
- Compare test results against baseline
- Flag any breaking changes or failures
- Provide detailed reports on regression issues

### 2. Drift Detection
- Monitor application behavior consistency over time
- Detect changes in API responses, endpoints, and data structures
- Identify performance degradation
- Track changes in dependencies and their impacts

### 3. Test Generation Recommendations
- Analyze code changes to suggest new test cases
- Identify untested code paths
- Recommend edge cases and boundary conditions
- Suggest integration test scenarios

### 4. Reporting and Actions
- Generate comprehensive test reports
- Suggest fixes for detected issues
- Prioritize issues by severity
- Track test metrics over time

## Integration with CI/CD

This agent is integrated into the GitHub Actions CI pipeline:
- Runs on every push and pull request
- Executes all test suites (unit, integration)
- Performs drift detection checks
- Reports results as workflow annotations
- Blocks merges on critical failures

## Usage

### Running Tests Locally

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test tests/path/to/test.test.ts
```

### Running Drift Detection

```bash
# Check for API drift
npm run test:drift

# Compare with baseline
npm run test:compare-baseline
```

### Generating Test Reports

```bash
# Generate comprehensive test report
npm run test:report

# Generate coverage report
npm test -- --coverage --reporter=html
```

## Test Structure

Tests are organized by type:
- `tests/lib/`: Library and utility tests
- `tests/routes/`: API route tests
- `tests/server/`: Server-side logic tests
- `tests/integration/`: End-to-end integration tests (future)

## Maintenance Guidelines

### Adding New Tests

1. **Unit Tests**: Create tests alongside new features
   - Test individual functions and modules
   - Mock external dependencies
   - Follow existing test patterns

2. **Integration Tests**: Test API endpoints and routes
   - Validate request/response contracts
   - Test error handling
   - Verify OpenAPI compliance

3. **Drift Tests**: Monitor critical behaviors
   - Baseline API responses
   - Track performance metrics
   - Verify data schemas

### Updating Baselines

When intentional changes are made:
```bash
# Update test baselines
npm run test:update-baselines

# Review changes
git diff tests/baselines/
```

### Test Best Practices

1. **Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock External Services**: Use vi.mock() for external dependencies
5. **Test Edge Cases**: Cover boundary conditions and error paths

## Extensibility

### Adding New Test Types

1. Create new test directory under `tests/`
2. Follow naming convention: `*.test.ts`
3. Update `vitest.config.ts` if needed
4. Add to CI workflow in `.github/workflows/ci.yml`

### Custom Test Utilities

Add shared test utilities to `tests/utils/`:
- Test fixtures
- Mock factories
- Custom matchers
- Helper functions

### Test Data Management

Store test data in `tests/fixtures/`:
- Mock API responses
- Sample database records
- Configuration files
- Baseline snapshots

## Metrics and KPIs

The agent tracks:
- **Test Coverage**: Percentage of code covered by tests
- **Test Success Rate**: Passing vs. failing tests
- **Test Execution Time**: Performance monitoring
- **Drift Incidents**: Number of detected drifts
- **Mean Time to Detect (MTTD)**: Time to find issues
- **Mean Time to Resolve (MTTR)**: Time to fix issues

## Security Testing

The agent also performs security checks:
- Dependency vulnerability scanning
- Authentication/authorization testing
- Input validation testing
- SSRF and injection prevention validation

## Future Enhancements

Planned improvements:
- [ ] Visual regression testing with Playwright screenshots
- [ ] Load testing and performance benchmarks
- [ ] Mutation testing for test quality
- [ ] AI-powered test generation from code changes
- [ ] Automated test repair and maintenance
- [ ] Smart test selection based on code changes
- [ ] Cross-browser E2E testing
- [ ] Chaos engineering tests

## Support and Issues

For questions or issues with the testing agent:
1. Check existing test documentation
2. Review test examples in `tests/` directory
3. Consult CI workflow logs
4. Create an issue with the `testing` label

## References

- Vitest Documentation: https://vitest.dev/
- Testing Library: https://testing-library.com/
- SvelteKit Testing: https://kit.svelte.dev/docs/testing
