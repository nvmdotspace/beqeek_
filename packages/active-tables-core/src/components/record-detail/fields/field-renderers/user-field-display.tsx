/**
 * User Field Display - Renders SELECT_ONE_WORKSPACE_USER and SELECT_LIST_WORKSPACE_USER field types
 * @module active-tables-core/components/record-detail/fields/field-renderers
 */

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Text } from '@workspace/ui/components/typography/text';
import { FIELD_TYPE_SELECT_ONE_WORKSPACE_USER } from '@workspace/beqeek-shared/constants';
import type { FieldConfig } from '../../../../types/field.js';
import type { WorkspaceUser } from '../../../../types/responses.js';

interface UserFieldDisplayProps {
  value: unknown;
  field?: FieldConfig;
  userRecords?: Record<string, WorkspaceUser>;
}

/**
 * Get user initials for avatar fallback
 */
function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    return (first + last).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Display component for workspace user fields
 * Shows avatar and user name
 *
 * @example
 * <UserFieldDisplay
 *   value="user123"
 *   field={{ type: 'SELECT_ONE_WORKSPACE_USER' }}
 *   userRecords={{ user123: { id: 'user123', name: 'John Doe', email: 'john@example.com' } }}
 * />
 */
export function UserFieldDisplay({ value, field, userRecords }: UserFieldDisplayProps) {
  // Handle empty/null values
  if (value == null || value === '' || !userRecords) {
    return <Text className="text-muted-foreground">-</Text>;
  }

  // Handle single user (SELECT_ONE_WORKSPACE_USER)
  if (field?.type === FIELD_TYPE_SELECT_ONE_WORKSPACE_USER) {
    const userId = String(value);
    const user = userRecords[userId];

    if (!user) {
      return <Text className="text-muted-foreground">-</Text>;
    }

    return (
      <Inline space="space-075" align="center">
        <Avatar className="size-6">
          {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
          <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
        </Avatar>
        <Text size="small">{user.name}</Text>
      </Inline>
    );
  }

  // Handle multiple users (SELECT_LIST_WORKSPACE_USER)
  const userIds = Array.isArray(value) ? value : [value];
  const filteredIds = userIds.filter((id) => id != null && id !== '').map(String);

  if (filteredIds.length === 0) {
    return <Text className="text-muted-foreground">-</Text>;
  }

  const users = filteredIds.map((id) => userRecords[id]).filter((u) => u != null);

  if (users.length === 0) {
    return <Text className="text-muted-foreground">-</Text>;
  }

  // Display multiple users stacked horizontally
  return (
    <Inline space="space-100" align="center" wrap>
      {users.map((user, index) => (
        <Inline key={`${user.id}-${index}`} space="space-075" align="center">
          <Avatar className="size-6">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
          </Avatar>
          <Text size="small">{user.name}</Text>
        </Inline>
      ))}
    </Inline>
  );
}
