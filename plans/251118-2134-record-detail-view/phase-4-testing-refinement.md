# Phase 4: Testing & Refinement

**Phase**: 4 of 4
**Duration**: 1-2 days
**Status**: Not Started
**Dependencies**: Phase 3 (Web App Integration)

## Context

Comprehensive testing and refinement of record detail view implementation. Ensure quality, accessibility, performance, and cross-browser compatibility. Validate against design system standards, verify encryption handling, and confirm Vietnamese typography rendering.

## Overview

Testing categories:

- **E2E Testing**: User flows with Playwright
- **Accessibility Audit**: WCAG 2.1 AA compliance
- **Performance Profiling**: Rendering, decryption, interactions
- **Cross-Browser Testing**: Chrome, Firefox, Safari, Edge
- **Mobile Testing**: iOS Safari, Chrome Android
- **Vietnamese Typography**: Font rendering, line heights
- **Dark Mode**: Color tokens, contrast ratios
- **Security Testing**: Permission checks, encryption handling

## Key Insights

### Testing Pyramid

```
        ╱╲
       ╱  ╲     E2E Tests (10%)
      ╱────╲    - Critical user flows
     ╱      ╲   - Playwright
    ╱────────╲  Integration Tests (20%)
   ╱          ╲ - Component interactions
  ╱────────────╲ - React Testing Library
 ╱              ╲ Unit Tests (70%)
╱────────────────╲ - Components, hooks, utils
                   - Vitest
```

### Critical User Flows

1. **View Record** - Load and display record with all fields
2. **Inline Edit** - Double-click, edit field, save
3. **Add Comment** - Create comment with rich text
4. **Delete Record** - Confirm and delete record
5. **Encryption Key** - Prompt for key, validate, decrypt
6. **Permission Denied** - Show appropriate error message
7. **Mobile Navigation** - View record on mobile device

## Requirements

### E2E Testing with Playwright

**Test Suite 1: Record Viewing**

```typescript
test('should display record with all fields', async ({ page }) => {
  // Navigate to record detail
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);

  // Wait for decryption
  await page.waitForSelector('[data-testid="record-detail"]');

  // Verify fields rendered
  await expect(page.locator('[data-testid="field-task-name"]')).toBeVisible();
  await expect(page.locator('[data-testid="field-status"]')).toBeVisible();
  await expect(page.locator('[data-testid="field-assignee"]')).toBeVisible();
});
```

**Test Suite 2: Inline Editing**

```typescript
test('should edit field inline', async ({ page }) => {
  // Double-click field
  await page.dblclick('[data-testid="field-task-name"]');

  // Wait for input
  await page.waitForSelector('[data-testid="inline-edit-input"]');

  // Edit value
  await page.fill('[data-testid="inline-edit-input"]', 'Updated Task Name');

  // Press Enter to save
  await page.keyboard.press('Enter');

  // Wait for save
  await page.waitForResponse((resp) => resp.url().includes('/update') && resp.status() === 200);

  // Verify updated
  await expect(page.locator('[data-testid="field-task-name"]')).toHaveText('Updated Task Name');
});
```

**Test Suite 3: Comments**

```typescript
test('should create comment', async ({ page }) => {
  // Click comment editor
  await page.click('[data-testid="comment-editor"]');

  // Type comment
  await page.fill('[data-testid="comment-input"]', 'This is a test comment');

  // Click submit
  await page.click('[data-testid="comment-submit"]');

  // Wait for comment to appear
  await page.waitForSelector('[data-testid="comment-item"]');

  // Verify comment
  await expect(page.locator('[data-testid="comment-item"]').last()).toContainText('This is a test comment');
});
```

**Test Suite 4: Encryption**

```typescript
test('should prompt for encryption key', async ({ page }) => {
  // Clear localStorage (remove key)
  await page.evaluate(() => localStorage.clear());

  // Navigate to encrypted table record
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${encryptedTableId}/records/${recordId}`);

  // Verify encryption key prompt
  await expect(page.locator('[data-testid="encryption-key-prompt"]')).toBeVisible();

  // Enter key
  await page.fill('[data-testid="encryption-key-input"]', validEncryptionKey);
  await page.click('[data-testid="encryption-key-submit"]');

  // Wait for decryption
  await page.waitForSelector('[data-testid="record-detail"]');

  // Verify fields decrypted
  await expect(page.locator('[data-testid="field-task-name"]')).not.toContainText('***');
});
```

**Test Suite 5: Permissions**

```typescript
test('should disable edit for read-only user', async ({ page }) => {
  // Login as read-only user
  await loginAs(page, 'readonly@example.com');

  // Navigate to record
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);

  // Verify fields not editable
  await page.dblclick('[data-testid="field-task-name"]');
  await expect(page.locator('[data-testid="inline-edit-input"]')).not.toBeVisible();

  // Verify delete button hidden
  await expect(page.locator('[data-testid="delete-record-btn"]')).not.toBeVisible();
});
```

**Test Suite 6: Mobile**

```typescript
test('should display correctly on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  // Navigate to record
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);

  // Verify single-column layout
  await expect(page.locator('[data-testid="record-detail"]')).toHaveCSS('flex-direction', 'column');

  // Verify sticky header
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect(page.locator('[data-testid="record-header"]')).toBeInViewport();
});
```

### Accessibility Audit

**WCAG 2.1 AA Checklist:**

- [ ] **1.1.1 Non-text Content**: All images have alt text
- [ ] **1.3.1 Info and Relationships**: Semantic HTML (headings, labels)
- [ ] **1.4.3 Contrast**: 4.5:1 for text, 3:1 for large text
- [ ] **1.4.11 Non-text Contrast**: 3:1 for UI components
- [ ] **2.1.1 Keyboard**: All functionality available via keyboard
- [ ] **2.1.2 No Keyboard Trap**: Focus can be moved away from all components
- [ ] **2.4.3 Focus Order**: Logical focus order
- [ ] **2.4.7 Focus Visible**: Visible focus indicator
- [ ] **3.2.1 On Focus**: No unexpected changes on focus
- [ ] **3.3.1 Error Identification**: Errors clearly identified
- [ ] **3.3.2 Labels or Instructions**: Form inputs have labels
- [ ] **4.1.2 Name, Role, Value**: ARIA labels for custom controls

**Accessibility Tests:**

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);

  // Inject axe
  await injectAxe(page);

  // Run accessibility checks
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
});
```

**Keyboard Navigation Tests:**

```typescript
test('should support keyboard navigation', async ({ page }) => {
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);

  // Tab through fields
  await page.keyboard.press('Tab'); // First field
  await expect(page.locator('[data-testid="field-task-name"]')).toBeFocused();

  await page.keyboard.press('Tab'); // Second field
  await expect(page.locator('[data-testid="field-status"]')).toBeFocused();

  // Activate inline edit with Enter
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-testid="inline-edit-input"]')).toBeVisible();

  // Cancel with Escape
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-testid="inline-edit-input"]')).not.toBeVisible();
});
```

**Screen Reader Tests:**

```typescript
test('should work with screen reader', async ({ page }) => {
  // Enable screen reader mode (NVDA/JAWS simulation)
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);

  // Verify ARIA labels
  const fieldLabel = await page.locator('[data-testid="field-task-name"]').getAttribute('aria-label');
  expect(fieldLabel).toBe('Task Name');

  // Verify live region announcements
  const liveRegion = page.locator('[role="status"][aria-live="polite"]');
  await expect(liveRegion).toBeInTheDOM();
});
```

### Performance Profiling

**Metrics to Measure:**

| Metric                 | Target     | Critical   |
| ---------------------- | ---------- | ---------- |
| Initial render         | <200ms     | <500ms     |
| Decryption (50 fields) | <500ms     | <1000ms    |
| Inline edit open       | <100ms     | <200ms     |
| Inline edit save       | <300ms     | <500ms     |
| Comments load          | <200ms     | <400ms     |
| Scroll (60fps)         | 16ms/frame | 33ms/frame |

**Performance Tests:**

```typescript
import { chromium } from 'playwright';

test('should meet performance targets', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Start tracing
  await context.tracing.start({ screenshots: true, snapshots: true });

  // Measure initial render
  const startTime = Date.now();
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);
  await page.waitForSelector('[data-testid="record-detail"]');
  const renderTime = Date.now() - startTime;

  expect(renderTime).toBeLessThan(200);

  // Stop tracing
  await context.tracing.stop({ path: 'trace.zip' });
  await browser.close();
});
```

**Lighthouse Audit:**

```bash
# Run Lighthouse CI
npm run lighthouse -- \
  --url="http://localhost:4173/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}" \
  --budget-path=./lighthouse-budget.json
```

**Budget Configuration (`lighthouse-budget.json`):**

```json
{
  "performance": 90,
  "accessibility": 100,
  "best-practices": 90,
  "seo": 90,
  "pwa": 0
}
```

### Cross-Browser Testing

**Test Matrix:**

| Browser          | Version | Platform              | Priority |
| ---------------- | ------- | --------------------- | -------- |
| Chrome           | Latest  | Windows, macOS, Linux | High     |
| Firefox          | Latest  | Windows, macOS, Linux | High     |
| Safari           | Latest  | macOS, iOS            | High     |
| Edge             | Latest  | Windows               | Medium   |
| Chrome Android   | Latest  | Android               | Medium   |
| Samsung Internet | Latest  | Android               | Low      |

**Browser-Specific Tests:**

```typescript
// Safari-specific CSS compatibility
test('should render correctly in Safari', async ({ page }) => {
  // Set Safari user agent
  await page.setExtraHTTPHeaders({
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  });

  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);

  // Verify layout not broken
  const layout = page.locator('[data-testid="record-detail"]');
  const box = await layout.boundingBox();
  expect(box.width).toBeGreaterThan(0);
  expect(box.height).toBeGreaterThan(0);
});
```

### Vietnamese Typography Testing

**Font Rendering Checks:**

```typescript
test('should render Vietnamese characters correctly', async ({ page }) => {
  // Create record with Vietnamese text
  const vietnameseText = 'Tiếng Việt có dấu thanh điệu ăắâấầẩẫậêếềểễệôốồổỗộơớờởỡợưứừửữự';

  // Navigate to record
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);

  // Verify text rendered
  await expect(page.locator('[data-testid="field-task-name"]')).toContainText(vietnameseText);

  // Verify font metrics
  const element = page.locator('[data-testid="field-task-name"]');
  const lineHeight = await element.evaluate((el) => window.getComputedStyle(el).lineHeight);
  const fontSize = await element.evaluate((el) => window.getComputedStyle(el).fontSize);

  // Verify increased line height for Vietnamese (8-13%)
  const ratio = parseFloat(lineHeight) / parseFloat(fontSize);
  expect(ratio).toBeGreaterThanOrEqual(1.5); // Vietnamese optimized
});
```

### Dark Mode Testing

**Color Contrast Checks:**

```typescript
test('should meet contrast requirements in dark mode', async ({ page }) => {
  // Enable dark mode
  await page.emulateMedia({ colorScheme: 'dark' });

  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);

  // Get colors
  const textColor = await page
    .locator('[data-testid="field-task-name"]')
    .evaluate((el) => window.getComputedStyle(el).color);
  const bgColor = await page
    .locator('[data-testid="field-task-name"]')
    .evaluate((el) => window.getComputedStyle(el).backgroundColor);

  // Calculate contrast ratio
  const contrast = calculateContrastRatio(textColor, bgColor);
  expect(contrast).toBeGreaterThanOrEqual(4.5); // WCAG AA
});
```

### Security Testing

**Permission Checks:**

```typescript
test('should enforce permissions', async ({ page }) => {
  // Test 1: No access permission
  await loginAs(page, 'noaccess@example.com');
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);
  await expect(page.locator('[data-testid="no-access-message"]')).toBeVisible();

  // Test 2: Read-only permission
  await loginAs(page, 'readonly@example.com');
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);
  await expect(page.locator('[data-testid="record-detail"]')).toBeVisible();
  await expect(page.locator('[data-testid="inline-edit-trigger"]')).not.toBeVisible();

  // Test 3: Full access permission
  await loginAs(page, 'admin@example.com');
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);
  await expect(page.locator('[data-testid="inline-edit-trigger"]')).toBeVisible();
  await expect(page.locator('[data-testid="delete-record-btn"]')).toBeVisible();
});
```

**Encryption Key Security:**

```typescript
test('should not expose encryption key', async ({ page }) => {
  await page.goto(`/${locale}/workspaces/${workspaceId}/tables/${tableId}/records/${recordId}`);

  // Check for key in DOM
  const html = await page.content();
  expect(html).not.toContain(encryptionKey);

  // Check for key in console logs
  const logs = [];
  page.on('console', (msg) => logs.push(msg.text()));
  await page.reload();
  expect(logs.join('\n')).not.toContain(encryptionKey);

  // Check for key in network requests
  const requests = [];
  page.on('request', (req) => requests.push(req.url()));
  await page.reload();
  expect(requests.join('\n')).not.toContain(encryptionKey);
});
```

## Architecture

### Test Structure

```
apps/web/
├── e2e/
│   └── record-detail/
│       ├── viewing.spec.ts
│       ├── inline-editing.spec.ts
│       ├── comments.spec.ts
│       ├── encryption.spec.ts
│       ├── permissions.spec.ts
│       ├── mobile.spec.ts
│       └── accessibility.spec.ts
└── src/
    └── features/
        └── active-tables/
            └── __tests__/
                └── record-detail-page.test.tsx

packages/active-tables-core/
└── src/
    └── components/
        └── record-detail/
            └── __tests__/
                ├── record-detail.test.tsx
                ├── field-display.test.tsx
                ├── inline-edit-field.test.tsx
                └── ...
```

## Implementation Steps

### Day 1: E2E Tests

1. Set up Playwright test suite
2. Write viewing tests (all field types)
3. Write inline editing tests
4. Write comments tests
5. Write encryption tests
6. Write permission tests
7. Write mobile tests

### Day 2: Accessibility & Performance

1. Run axe accessibility audit
2. Fix accessibility violations
3. Write keyboard navigation tests
4. Test with screen reader
5. Run Lighthouse performance audit
6. Profile rendering performance
7. Optimize slow operations

### Day 3: Cross-Browser & Refinement

1. Test on Chrome, Firefox, Safari, Edge
2. Fix browser-specific issues
3. Test Vietnamese typography
4. Test dark mode
5. Run security tests
6. Fix bugs
7. Update documentation

## Todo List

- [ ] Set up Playwright test suite
- [ ] Write E2E tests for viewing records
- [ ] Write E2E tests for inline editing
- [ ] Write E2E tests for comments
- [ ] Write E2E tests for encryption
- [ ] Write E2E tests for permissions
- [ ] Write E2E tests for mobile
- [ ] Run axe accessibility audit
- [ ] Fix accessibility violations
- [ ] Write keyboard navigation tests
- [ ] Test with NVDA/JAWS screen reader
- [ ] Run Lighthouse performance audit
- [ ] Profile rendering performance with Chrome DevTools
- [ ] Optimize decryption performance
- [ ] Test on Chrome (Windows, macOS, Linux)
- [ ] Test on Firefox (Windows, macOS, Linux)
- [ ] Test on Safari (macOS, iOS)
- [ ] Test on Edge (Windows)
- [ ] Test on Chrome Android
- [ ] Fix browser-specific issues
- [ ] Test Vietnamese typography rendering
- [ ] Verify Vietnamese line heights
- [ ] Test dark mode color contrast
- [ ] Fix dark mode issues
- [ ] Run security tests (permissions, encryption)
- [ ] Fix security vulnerabilities
- [ ] Update documentation with test results
- [ ] Create demo video

## Success Criteria

- [ ] All E2E tests pass (100%)
- [ ] Zero accessibility violations (WCAG 2.1 AA)
- [ ] Lighthouse score ≥90 (performance, accessibility)
- [ ] Performance targets met (<200ms render, <500ms decrypt)
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile-responsive on iOS Safari, Chrome Android
- [ ] Vietnamese typography renders correctly
- [ ] Dark mode contrast ratios ≥4.5:1
- [ ] Zero security vulnerabilities
- [ ] Zero console errors or warnings
- [ ] Documentation complete and accurate

## Risk Assessment

| Risk                     | Likelihood | Impact | Mitigation                              |
| ------------------------ | ---------- | ------ | --------------------------------------- |
| Flaky E2E tests          | High       | Medium | Use stable selectors, add retry logic   |
| Accessibility violations | Medium     | High   | Early audit, iterative fixes            |
| Performance regressions  | Medium     | Medium | Continuous profiling, benchmarks        |
| Browser-specific bugs    | Medium     | Medium | Test early, use feature detection       |
| Mobile layout issues     | Medium     | Medium | Test on real devices, responsive design |

## Security Considerations

1. **Never expose encryption keys** in DOM, console, or network
2. **Validate permissions server-side** (UI checks are cosmetic)
3. **Sanitize user input** (XSS prevention)
4. **Use CSP headers** to prevent script injection
5. **Clear sensitive data** on logout

## Next Steps

After Phase 4 completion:

1. Merge to main branch
2. Deploy to staging environment
3. QA testing
4. Deploy to production
5. Monitor for errors
6. Gather user feedback
7. Plan Phase 5 improvements

## Unresolved Questions

1. Should we implement visual regression testing (Percy, Chromatic)?
2. How to test E2EE with real encryption keys (security)?
3. Should we test with VPN/proxy to simulate slow networks?
4. How to test with real screen readers (NVDA, JAWS)?
5. Should we implement load testing (1000+ concurrent users)?
6. How to test with real mobile devices (BrowserStack)?
7. Should we add smoke tests to CI/CD pipeline?
