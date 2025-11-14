import { WorkspaceTeamRole } from '../types/role';
import { EmptyRoleList } from './empty-role-list';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

interface RoleListProps {
  roles: WorkspaceTeamRole[];
  onEditRole: (role: WorkspaceTeamRole) => void;
  onDeleteRole: (roleId: string) => void;
  isLoading?: boolean;
}

export function RoleList({ roles, onEditRole, onDeleteRole, isLoading }: RoleListProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="p-8">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (roles.length === 0) {
    return <EmptyRoleList />;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{m.role_table_name()}</TableHead>
            <TableHead className="hidden md:table-cell">{m.role_table_code()}</TableHead>
            <TableHead className="hidden lg:table-cell">{m.role_table_description()}</TableHead>
            <TableHead className="text-right">{m.role_table_actions()}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {role.roleName}
                  {role.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      {m.role_badge_default()}
                    </Badge>
                  )}
                </div>
                {/* Show description on mobile */}
                <div className="mt-1 text-sm text-muted-foreground lg:hidden">{role.roleDescription}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{role.roleCode || '—'}</TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground max-w-md truncate">
                {role.roleDescription || '—'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEditRole(role)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">
                      {m.role_edit_button()} {role.roleName}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteRole(role.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">
                      {m.role_delete_button()} {role.roleName}
                    </span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
