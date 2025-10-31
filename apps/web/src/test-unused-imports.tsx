import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';

// Only using useState, Button and React
export function TestComponent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Button onClick={() => setCount(count + 1)}>Count: {count}</Button>
    </div>
  );
}
