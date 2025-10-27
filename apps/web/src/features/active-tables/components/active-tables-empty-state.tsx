import { Database, ArrowRight, Users, Workflow, Lock, Plus } from 'lucide-react';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

interface ActiveTablesEmptyStateProps {
  onCreate?: () => void;
}

export const ActiveTablesEmptyState = ({ onCreate }: ActiveTablesEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-8">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
        <Database className="h-10 w-10 text-blue-600" />
      </div>

      <div className="space-y-4 max-w-2xl">
        <h3 className="text-2xl font-bold">Welcome to Active Tables</h3>
        <p className="text-lg text-muted-foreground">
          Create structured databases that power your workflows with built-in security and team collaboration.
        </p>
      </div>

      {/* Use Cases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
        <Card className="text-left">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-semibold">Team Collaboration</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Share data securely with your team. Add comments, mentions, and track changes in real-time.
            </p>
          </CardContent>
        </Card>

        <Card className="text-left">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Workflow className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-semibold">Workflow Automation</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Trigger custom actions, send notifications, and integrate with external systems automatically.
            </p>
          </CardContent>
        </Card>

        <Card className="text-left">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Lock className="h-5 w-5 text-orange-600" />
              </div>
              <h4 className="font-semibold">End-to-End Security</h4>
            </div>
            <p className="text-sm text-muted-foreground">
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
        <Button onClick={onCreate} size="lg" className="mt-6">
          <Plus className="h-5 w-5 mr-2" />
          Create Your First Active Table
        </Button>
      )}
    </div>
  );
};
