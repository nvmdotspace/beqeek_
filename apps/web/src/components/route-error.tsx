type RouteErrorProps = {
  error?: unknown;
};

export const RouteError = ({ error }: RouteErrorProps) => {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Oops!</h1>
        <p className="mt-2 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
