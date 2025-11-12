import { Heading, Text } from '@workspace/ui/components/typography';

export const NotFound = () => {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <Heading level={2}>Page not found</Heading>
        <Text className="mt-2" color="muted">
          The page you're looking for doesn't exist.
        </Text>
      </div>
    </div>
  );
};
