import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Inline } from '@workspace/ui/components/primitives';
import { Edit, Trash } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '@/shared/route-paths';
import type { WorkflowUnit } from '../api/types';

interface WorkflowUnitCardProps {
  unit: WorkflowUnit;
  workspaceId: string;
  locale: string;
  onEdit: (unit: WorkflowUnit) => void;
  onDelete: (unit: WorkflowUnit) => void;
}

export function WorkflowUnitCard({ unit, workspaceId, locale, onEdit, onDelete }: WorkflowUnitCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate({
      to: ROUTES.WORKFLOW_UNITS.DETAIL,
      params: { locale, workspaceId, unitId: unit.id },
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(unit);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(unit);
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <CardHeader>
        <CardTitle className="line-clamp-2">{unit.name}</CardTitle>
        {unit.description && <CardDescription className="line-clamp-2">{unit.description}</CardDescription>}
      </CardHeader>
      <CardFooter>
        <Inline space="space-150" justify="end" className="w-full">
          <Button variant="ghost" size="sm" onClick={handleEdit} aria-label={`Edit ${unit.name}`}>
            <Edit className="size-4 mr-2" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} aria-label={`Delete ${unit.name}`}>
            <Trash className="size-4 mr-2" />
            Delete
          </Button>
        </Inline>
      </CardFooter>
    </Card>
  );
}
