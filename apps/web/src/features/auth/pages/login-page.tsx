import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from '@tanstack/react-router';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Heading, Text } from '@workspace/ui/components/typography';

import { useLogin } from '../hooks/use-login';
import { useAuthStore, selectIsAuthenticated } from '../stores/auth-store';
import { useLanguageStore } from '@/stores/language-store';
// @ts-expect-error - Paraglide generates JS without .d.ts files
import { m } from '@/paraglide/generated/messages.js';

export const LoginPage = () => {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const getLocalizedPath = useLanguageStore((state) => state.getLocalizedPath);
  const [username, setUsername] = useState('captainbolt');
  const [password, setPassword] = useState('nvmteam');

  const { mutateAsync: login, isPending, errorMessage, reset } = useLogin();

  useEffect(() => {
    if (isAuthenticated) {
      void router.navigate({ to: getLocalizedPath('/workspaces') });
    }
  }, [isAuthenticated, router, getLocalizedPath]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await login(
      { username, password },
      {
        onSuccess: async () => {
          await router.navigate({ to: getLocalizedPath('/workspaces') });
        },
      },
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%)]" />
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen w-full max-w-screen-xl mx-auto">
        {/* Left Side - Brand & Features */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-lg space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                <span className="text-xl font-bold">B</span>
              </div>
              <div>
                <Heading level={1} className="text-white">
                  BEQEEK
                </Heading>
                <Text size="small" className="text-blue-400">
                  Low-Code Platform
                </Text>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <Heading level={1} className="text-white leading-tight">
                {m.auth_welcomeBack()}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {m.auth_digitalProcessPlatform()}
                </span>
              </Heading>
              <Text size="large" className="text-slate-300 leading-relaxed">
                {m.auth_manageWorkspaces()}
              </Text>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400 mt-0.5">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <Heading level={3} className="text-white">
                    Active Tables
                  </Heading>
                  <Text size="small" className="text-slate-400">
                    {m.auth_manageStructuredData()}
                  </Text>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 mt-0.5">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <Heading level={3} className="text-white">
                    Workflow Automation
                  </Heading>
                  <Text size="small" className="text-slate-400">
                    {m.auth_automateWorkProcesses()}
                  </Text>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 mt-0.5">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <Heading level={3} className="text-white">
                    End-to-End Encryption
                  </Heading>
                  <Text size="small" className="text-slate-400">
                    {m.auth_secureDataE2E()}
                  </Text>
                </div>
              </div>
            </div>

            {/* Demo Account Info */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <Text size="small" weight="semibold" className="uppercase tracking-wide text-green-400" as="span">
                  {m.auth_demoEnvironment()}
                </Text>
              </div>
              <Text size="small" className="text-slate-300 leading-relaxed">
                {m.auth_useDemoAccount()}{' '}
                <span className="font-mono bg-slate-700 px-2 py-1 rounded text-slate-200">captainbolt / nvmteam</span>
              </Text>
              <Text size="small" className="text-slate-400 mt-2">
                {m.auth_orCreateNewWorkspace()}
              </Text>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm lg:max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                <span className="text-lg font-bold">B</span>
              </div>
              <div>
                <Heading level={1} className="text-white">
                  BEQEEK
                </Heading>
                <Text size="small" className="text-blue-400">
                  Low-Code Platform
                </Text>
              </div>
            </div>

            {/* Login Card */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <Heading level={2} className="text-white">
                    {m.auth_signIn()}
                  </Heading>
                  <Text size="small" className="text-slate-400 mt-2">
                    {m.auth_accessYourAccount()}
                  </Text>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="username">
                      <Text size="small" weight="medium" className="text-slate-200">
                        {m.auth_username()}
                      </Text>
                    </label>
                    <Input
                      id="username"
                      name="username"
                      autoComplete="username"
                      placeholder={m.auth_enterUsername()}
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      disabled={isPending}
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password">
                        <Text size="small" weight="medium" className="text-slate-200">
                          {m.auth_password()}
                        </Text>
                      </label>
                      <button
                        type="button"
                        className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        onClick={() => setPassword('nvmteam')}
                      >
                        {m.auth_useDemo()}
                      </button>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={isPending}
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>

                  {errorMessage ? (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
                      <Text size="small" className="text-red-400">
                        {errorMessage}
                      </Text>
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isPending}
                  >
                    {isPending ? m.auth_processing() : m.auth_signIn()}
                  </Button>
                </form>

                <div className="text-center">
                  <Text size="small" className="text-slate-400">
                    {m.auth_needNewAccount()}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
