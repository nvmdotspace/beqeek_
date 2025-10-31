import { Database, ArrowRight, Users, Workflow, Lock, Plus } from 'lucide-react';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
// @ts-ignore
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
        <h3 className="text-3xl font-bold tracking-tight">{m.activeTables_empty_title()}</h3>
        <p className="text-lg text-muted-foreground leading-relaxed">{m.activeTables_empty_description()}</p>
      </div>

      {/* Use Cases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <Card className="text-left border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-base">Team Collaboration</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Share data securely with your team. Add comments, mentions, and track changes in real-time.
            </p>
          </CardContent>
        </Card>

        <Card className="text-left border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-900/20 dark:to-fuchsia-900/20">
                <Workflow className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-base">Workflow Automation</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Trigger custom actions, send notifications, and integrate with external systems automatically.
            </p>
          </CardContent>
        </Card>

        <Card className="text-left border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20">
                <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold text-base">End-to-End Security</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your sensitive data is encrypted on your device before being stored. Only you have the keys.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Common Use Cases */}
      <div className="bg-muted/30 rounded-xl p-6 max-w-3xl w-full">
        <h4 className="font-semibold mb-4">Popular use cases:</h4>
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
