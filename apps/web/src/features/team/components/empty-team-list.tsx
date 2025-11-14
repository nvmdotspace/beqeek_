import { Card, CardContent } from '@workspace/ui/components/card';
import { Users } from 'lucide-react';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export function EmptyTeamList() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{m.team_empty_title()}</h3>
        <p className="text-muted-foreground text-center max-w-md">{m.team_empty_description()}</p>
      </CardContent>
    </Card>
  );
}
