import { Database } from 'lucide-react';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { useTranslation } from '@/hooks/use-translation';

interface ActiveTablesEmptyStateProps {
  onCreate?: () => void;
  showCreate?: boolean;
}

export const ActiveTablesEmptyState = ({ onCreate, showCreate = false }: ActiveTablesEmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <Card className="border-dashed border-border/60 bg-muted/40">
      <CardContent className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Database className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{t('activeTables.empty.title')}</h2>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            {t('activeTables.empty.description')}
          </p>
        </div>
        {showCreate ? (
          <Button variant="default" onClick={onCreate}>
            {t('activeTables.empty.createCta')}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};
