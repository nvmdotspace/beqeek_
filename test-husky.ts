// Test file for Husky pre-commit hook
const testVariable = 'This should be formatted with single quotes';
const longLine =
  'This is a very long line that exceeds 120 characters and should be wrapped by Prettier if it is working correctly in the pre-commit hook';

function testFunction() {
  console.log('Poorly formatted code');
  return true;
}

export { testFunction };
