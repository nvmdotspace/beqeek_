/**
 * Form List Item Component
 *
 * Displays a single form in the list view.
 * Clickable card that navigates to form detail page.
 */

import { getRouteApi } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

import { ROUTES } from '@/shared/route-paths';

import type { FormInstance } from '../types';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-forms/');

interface FormListItemProps {
  form: FormInstance;
}

export function FormListItem({ form }: FormListItemProps) {
  const { locale, workspaceId } = route.useParams();
  const navigate = route.useNavigate();

  const formattedDate = form.createdAt
    ? new Date(form.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() =>
        navigate({
          to: ROUTES.WORKFLOW_FORMS.FORM_DETAIL,
          params: { locale, workspaceId, formId: form.id },
        })
      }
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{form.name}</CardTitle>
          <Badge variant="secondary" className="ml-2">
            {form.formType}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{form.description || 'Không có mô tả'}</CardDescription>
      </CardHeader>
      {formattedDate && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">Tạo ngày: {formattedDate}</p>
        </CardFooter>
      )}
    </Card>
  );
}
