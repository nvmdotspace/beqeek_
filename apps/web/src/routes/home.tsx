import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"

import { ModeToggle } from "@/components/mode-toggle"

import { Button, buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type DogResponse = {
  message: string
  status: string
}

const fetchRandomDog = async (): Promise<DogResponse> => {
  const response = await fetch("https://dog.ceo/api/breeds/image/random")

  if (!response.ok) {
    throw new Error("Unable to load a dog right now. Please try again.")
  }

  return response.json() as Promise<DogResponse>
}

export const HomeRoute = () => {
  const [submissionMessage, setSubmissionMessage] = React.useState<string | null>(null)

  const {
    data: dogData,
    isPending,
    isRefetching,
    refetch,
    error: dogError,
  } = useQuery({
    queryKey: ["dog"],
    queryFn: fetchRandomDog,
  })

  const contactForm = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSubmissionMessage(`Thanks ${value.name}, we will reach out to ${value.email}.`)
    },
  })

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] gap-10 bg-background p-6 text-foreground md:p-12">
      <main className="row-start-2 flex w-full flex-col items-center gap-10 md:flex-row md:items-start">
        <section className="flex max-w-xl flex-1 flex-col gap-6 text-center md:text-left">
          <div className="flex items-center justify-center gap-3 md:justify-start">
            <img
              src="/tanstack.svg"
              alt="TanStack"
              width={60}
              height={60}
              className="h-12 w-12 rounded-full border border-border bg-card p-2"
            />
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Turborepo + TanStack Toolkit
            </h1>
          </div>
          <p className="text-muted-foreground">
            This workspace now runs on Vite with TanStack Router, React Query, and Form. UI primitives still come
            from <code className="rounded bg-muted px-1 py-0.5">packages/ui</code>, so every page can share the same
            design system.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <a
              className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
              href="https://tanstack.com/router/latest"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore TanStack Router
            </a>
            <a
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-full")}
              href="https://tanstack.com/query/latest"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read React Query Docs
            </a>
            <ModeToggle />
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Random dog fetched with React Query</h2>
            {dogError ? (
              <p className="text-sm text-destructive">{(dogError as Error).message}</p>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{isPending ? "Loading..." : "Freshly cached data"}</span>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>
                    {isRefetching ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
                <div className="mt-4 flex justify-center">
                  {dogData ? (
                    <img
                      src={dogData.message}
                      alt="A random dog"
                      className="h-48 w-full max-w-sm rounded-lg border object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-48 w-full max-w-sm items-center justify-center rounded-lg border border-dashed">
                      Waiting for data...
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
        <aside className="flex w-full max-w-md flex-1 flex-col gap-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Stay in the loop</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Powered by TanStack Form. Validation runs on change and keeps the UI responsive.
            </p>

            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                void contactForm.handleSubmit()
              }}
            >
              <contactForm.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    value.trim().length < 2 ? "Please tell us who you are." : undefined,
                }}
              >
                {(field) => (
                  <label className="flex flex-col gap-2 text-left text-sm font-medium">
                    Name
                    <input
                      className="rounded-md border border-input bg-background px-3 py-2 text-base outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {field.state.meta.errors?.length ? (
                      <span className="text-sm font-normal text-destructive">
                        {field.state.meta.errors.join(", ")}
                      </span>
                    ) : null}
                  </label>
                )}
              </contactForm.Field>

              <contactForm.Field
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : "Use a valid email address.",
                }}
              >
                {(field) => (
                  <label className="flex flex-col gap-2 text-left text-sm font-medium">
                    Email
                    <input
                      className="rounded-md border border-input bg-background px-3 py-2 text-base outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {field.state.meta.errors?.length ? (
                      <span className="text-sm font-normal text-destructive">
                        {field.state.meta.errors.join(", ")}
                      </span>
                    ) : null}
                  </label>
                )}
              </contactForm.Field>

              <contactForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit} className="self-start">
                    {isSubmitting ? "Sending..." : "Notify me"}
                  </Button>
                )}
              </contactForm.Subscribe>
            </form>
            {submissionMessage ? (
              <p className="mt-4 text-sm text-emerald-500">{submissionMessage}</p>
            ) : null}
          </div>
        </aside>
      </main>
      <footer className="row-start-3 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
        <a
          className="hover:text-foreground hover:underline hover:underline-offset-4"
          href="https://tanstack.com/form/latest"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn TanStack Form
        </a>
        <a
          className="hover:text-foreground hover:underline hover:underline-offset-4"
          href="https://github.com/TanStack/router"
          target="_blank"
          rel="noopener noreferrer"
        >
          Router Source
        </a>
        <a
          className="hover:text-foreground hover:underline hover:underline-offset-4"
          href="https://github.com/TanStack/query"
          target="_blank"
          rel="noopener noreferrer"
        >
          React Query Source
        </a>
      </footer>
    </div>
  )
}
