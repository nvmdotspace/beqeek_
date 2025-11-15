/**
 * Form List Item Component
 *
 * Displays a single form in the list view.
 * Clickable card that navigates to form detail page.
 * Redesigned to match Active Tables card pattern.
 */

import { useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Heading, Text } from '@workspace/ui/components/typography';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { FileText, Mail, ListChecks, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

import { ROUTES } from '@/shared/route-paths';

import type { FormInstance, FormType } from '../types';

const route = getRouteApi('/$locale/workspaces/$workspaceId/workflow-forms/');

// Form type configuration with colors and icons
const getFormTypeConfig = (formType: FormType) => {
  switch (formType) {
    case 'BASIC':
      return {
        label: 'Cơ bản',
        icon: FileText,
        bg: 'bg-accent-blue-subtle',
        text: 'text-accent-blue',
        badge: 'border-accent-blue-subtle bg-accent-blue-subtle/30 text-accent-blue',
      };
    case 'SUBSCRIPTION':
      return {
        label: 'Đăng ký',
        icon: Mail,
        bg: 'bg-accent-purple-subtle',
        text: 'text-accent-purple',
        badge: 'border-accent-purple-subtle bg-accent-purple-subtle/30 text-accent-purple',
      };
    case 'SURVEY':
      return {
        label: 'Khảo sát',
        icon: ListChecks,
        bg: 'bg-warning-subtle',
        text: 'text-warning',
        badge: 'border-warning-subtle bg-warning-subtle/30 text-warning',
      };
  }
};

interface FormListItemProps {
  form: FormInstance;
  onDelete?: (formId: string) => void;
}

export function FormListItem({ form, onDelete }: FormListItemProps) {
  const { locale, workspaceId } = route.useParams();
  const navigate = route.useNavigate();

  const formTypeConfig = useMemo(() => getFormTypeConfig(form.formType), [form.formType]);
  const FormIcon = formTypeConfig.icon;
  const fieldCount = form.config?.fields?.length ?? 0;
  const locale_display = 'vi-VN';

  const updatedAtLabel = form.updatedAt
    ? new Intl.DateTimeFormat(locale_display, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(form.updatedAt))
    : null;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden',
        'border-border/60 shadow-sm',
        'transition-all duration-200',
        'hover:shadow-md',
        'cursor-pointer',
      )}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('[role="button"]')) {
          navigate({
            to: ROUTES.WORKFLOW_FORMS.FORM_DETAIL,
            params: { locale, workspaceId, formId: form.id },
          });
        }
      }}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2.5 sm:gap-3">
          <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Form Type Icon */}
            <div
              className={cn(
                'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg',
                formTypeConfig.bg,
              )}
            >
              <FormIcon className={cn('h-4 w-4 sm:h-4.5 sm:w-4.5', formTypeConfig.text)} />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              {/* Title */}
              <Heading level={4} className="text-base leading-tight line-clamp-2 break-words">
                {form.name}
              </Heading>

              {/* Badges row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn('text-[10px] font-medium whitespace-nowrap', formTypeConfig.badge)}
                >
                  {formTypeConfig.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({
                    to: ROUTES.WORKFLOW_FORMS.FORM_DETAIL,
                    params: { locale, workspaceId, formId: form.id },
                  });
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({
                    to: ROUTES.WORKFLOW_FORMS.FORM_DETAIL,
                    params: { locale, workspaceId, formId: form.id },
                  });
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(form.id);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Metadata row */}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            <span>
              {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
            </span>
          </div>
        </div>

        {/* Description */}
        {form.description && (
          <Text size="small" color="muted" className="mt-2 line-clamp-2">
            {form.description}
          </Text>
        )}

        {/* Updated date */}
        {updatedAtLabel && (
          <Text size="small" color="muted" className="mt-2">
            Cập nhật lúc {updatedAtLabel}
          </Text>
        )}
      </CardContent>
    </Card>
  );
}
