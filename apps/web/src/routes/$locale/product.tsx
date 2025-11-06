import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const ProductPageLazy = lazy(() =>
  import('@/features/product/pages/product-page').then((module) => ({ default: module.ProductPage })),
);

export const Route = createFileRoute('/$locale/product')({
  component: ProductComponent,
});

function ProductComponent() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <ProductPageLazy />
    </Suspense>
  );
}
