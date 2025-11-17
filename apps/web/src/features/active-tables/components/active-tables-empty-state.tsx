import { Database, ArrowRight, Users, Workflow, Lock, Plus } from 'lucide-react';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Heading, Text } from '@workspace/ui/components/typography';
import { Box, Stack, Inline, Grid } from '@workspace/ui/components/primitives';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

interface ActiveTablesEmptyStateProps {
  onCreate?: () => void;
}

export const ActiveTablesEmptyState = ({ onCreate }: ActiveTablesEmptyStateProps) => {
  return (
    <Stack space="space-400" align="center" justify="center" className="py-20 text-center">
      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-accent-blue-subtle shadow-lg shadow-accent-blue/10">
        <Database className="h-12 w-12 text-accent-blue" />
      </div>

      <Stack space="space-100" align="center" className="max-w-2xl">
        <Heading level={1}>{m.activeTables_empty_title()}</Heading>
        <Text size="large" color="muted" className="leading-relaxed">
          {m.activeTables_empty_description()}
        </Text>
      </Stack>

      {/* Use Cases */}
      <Grid columns={1} gap="space-300" className="md:grid-cols-3 max-w-4xl w-full">
        <Card className="text-left border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <Stack space="space-075" className="mb-3">
              <Inline space="space-075" align="center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green-subtle">
                  <Users className="h-5 w-5 text-accent-green" />
                </div>
                <Heading level={4}>Team Collaboration</Heading>
              </Inline>
            </Stack>
            <Text size="small" color="muted" className="leading-relaxed">
              Share data securely with your team. Add comments, mentions, and track changes in real-time.
            </Text>
          </CardContent>
        </Card>

        <Card className="text-left border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <Stack space="space-075" className="mb-3">
              <Inline space="space-075" align="center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple-subtle">
                  <Workflow className="h-5 w-5 text-accent-purple" />
                </div>
                <Heading level={4}>Workflow Automation</Heading>
              </Inline>
            </Stack>
            <Text size="small" color="muted" className="leading-relaxed">
              Trigger custom actions, send notifications, and integrate with external systems automatically.
            </Text>
          </CardContent>
        </Card>

        <Card className="text-left border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <Stack space="space-075" className="mb-3">
              <Inline space="space-075" align="center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-orange-subtle">
                  <Lock className="h-5 w-5 text-accent-orange" />
                </div>
                <Heading level={4}>End-to-End Security</Heading>
              </Inline>
            </Stack>
            <Text size="small" color="muted" className="leading-relaxed">
              Your sensitive data is encrypted on your device before being stored. Only you have the keys.
            </Text>
          </CardContent>
        </Card>
      </Grid>

      {/* Common Use Cases */}
      <Box padding="space-300" backgroundColor="muted" borderRadius="xl" className="max-w-3xl w-full bg-muted/30">
        <Stack space="space-100">
          <Heading level={4}>Popular use cases:</Heading>
          <Grid columns={1} gap="space-075" className="md:grid-cols-2 text-sm">
            <Inline space="space-050" align="center">
              <ArrowRight className="h-4 w-4 text-accent-blue" />
              <span>Customer relationship management (CRM)</span>
            </Inline>
            <Inline space="space-050" align="center">
              <ArrowRight className="h-4 w-4 text-accent-blue" />
              <span>Project and task management</span>
            </Inline>
            <Inline space="space-050" align="center">
              <ArrowRight className="h-4 w-4 text-accent-blue" />
              <span>Inventory and asset tracking</span>
            </Inline>
            <Inline space="space-050" align="center">
              <ArrowRight className="h-4 w-4 text-accent-blue" />
              <span>Employee and HR records</span>
            </Inline>
            <Inline space="space-050" align="center">
              <ArrowRight className="h-4 w-4 text-accent-blue" />
              <span>Financial and budget tracking</span>
            </Inline>
            <Inline space="space-050" align="center">
              <ArrowRight className="h-4 w-4 text-accent-blue" />
              <span>Content and document management</span>
            </Inline>
          </Grid>
        </Stack>
      </Box>

      {onCreate && (
        <Button onClick={onCreate} size="lg" className="mt-6 shadow-lg shadow-primary/20">
          <Inline space="space-050" align="center">
            <Plus className="h-5 w-5" />
            {m.activeTables_empty_createCta()}
          </Inline>
        </Button>
      )}
    </Stack>
  );
};
