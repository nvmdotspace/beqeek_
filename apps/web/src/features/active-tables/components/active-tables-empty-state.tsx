import { Database, ArrowRight, Users, Workflow, Lock, Plus } from 'lucide-react';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Heading, Text } from '@workspace/ui/components/typography';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

interface ActiveTablesEmptyStateProps {
  onCreate?: () => void;
}

export const ActiveTablesEmptyState = ({ onCreate }: ActiveTablesEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5">
        <Database className="h-12 w-12 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="space-y-4 max-w-2xl">
        <Heading level={1}>{m.activeTables_empty_title()}</Heading>
        <Text size="large" color="muted" className="leading-relaxed">
          {m.activeTables_empty_description()}
        </Text>
      </div>

      {/* Use Cases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <Card className="text-left border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <Heading level={4}>Team Collaboration</Heading>
            </div>
            <Text size="small" color="muted" className="leading-relaxed">
              Share data securely with your team. Add comments, mentions, and track changes in real-time.
            </Text>
          </CardContent>
        </Card>

        <Card className="text-left border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-900/20 dark:to-fuchsia-900/20">
                <Workflow className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <Heading level={4}>Workflow Automation</Heading>
            </div>
            <Text size="small" color="muted" className="leading-relaxed">
              Trigger custom actions, send notifications, and integrate with external systems automatically.
            </Text>
          </CardContent>
        </Card>

        <Card className="text-left border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20">
                <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <Heading level={4}>End-to-End Security</Heading>
            </div>
            <Text size="small" color="muted" className="leading-relaxed">
              Your sensitive data is encrypted on your device before being stored. Only you have the keys.
            </Text>
          </CardContent>
        </Card>
      </div>

      {/* Common Use Cases */}
      <div className="bg-muted/30 rounded-xl p-6 max-w-3xl w-full">
        <Heading level={4} className="mb-4">
          Popular use cases:
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-blue-600" />
            <span>Customer relationship management (CRM)</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-blue-600" />
            <span>Project and task management</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-blue-600" />
            <span>Inventory and asset tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-blue-600" />
            <span>Employee and HR records</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-blue-600" />
            <span>Financial and budget tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-blue-600" />
            <span>Content and document management</span>
          </div>
        </div>
      </div>

      {onCreate && (
        <Button onClick={onCreate} size="lg" className="mt-6 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5 mr-2" />
          {m.activeTables_empty_createCta()}
        </Button>
      )}
    </div>
  );
};
