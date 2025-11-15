/**
 * Form Template Card Component
 *
 * Displays a template option for form creation.
 * Clickable card that triggers template selection.
 */

import { Card, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';

import type { FormTypeDefinition } from '../types';

interface FormTemplateCardProps {
  template: FormTypeDefinition;
  onSelect: () => void;
}

export function FormTemplateCard({ template, onSelect }: FormTemplateCardProps) {
  // Template icons using SVG (no external dependencies)
  const getIcon = () => {
    switch (template.type) {
      case 'BASIC':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground/80"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
      case 'SUBSCRIPTION':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground/80"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        );
      case 'SURVEY':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground/80"
          >
            <path d="M9 11H3v2h6v-2zm0-5H3v2h6V6zm0 10H3v2h6v-2zm5 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 3h14v-2h-14v2zm0-5h14v-2h-14v2z" />
            <circle cx="14" cy="14" r="3" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      className="group cursor-pointer border hover:border-primary/50 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
      onClick={onSelect}
    >
      <CardHeader className="space-y-4 p-6">
        {/* Icon */}
        <div className="flex justify-center">{getIcon()}</div>

        {/* Content */}
        <div className="space-y-2 text-center">
          <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            {template.description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
