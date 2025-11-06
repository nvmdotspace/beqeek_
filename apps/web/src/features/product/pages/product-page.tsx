import { useNavigate } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { useLanguageStore } from '@/stores/language-store';
// @ts-ignore
import { m } from '@/paraglide/generated/messages.js';

export const ProductPage = () => {
  const navigate = useNavigate();
  const getLocalizedPath = useLanguageStore((state) => state.getLocalizedPath);

  const handleGetStarted = () => {
    navigate({ to: getLocalizedPath('/login') });
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

      <div className="relative z-10">
        {/* Header Navigation */}
        <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                  <span className="text-lg font-bold">B</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">BEQEEK</h1>
                  <p className="text-xs text-blue-400">{m.product_tagline()}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">
                  {m.product_navFeatures()}
                </a>
                <a href="#views" className="text-sm text-slate-300 hover:text-white transition-colors">
                  {m.product_navViews()}
                </a>
                <a href="#security" className="text-sm text-slate-300 hover:text-white transition-colors">
                  {m.product_navSecurity()}
                </a>
                <Button
                  onClick={handleGetStarted}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white"
                >
                  {m.product_getStarted()}
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
              {m.product_heroTitle()}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {m.product_heroTitleHighlight()}
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
              {m.product_heroDescription()}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-medium px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {m.product_getStarted()}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-200 hover:bg-slate-700 px-8 py-6 text-lg"
                onClick={() => (window.location.href = '#features')}
              >
                {m.product_learnMore()}
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">{m.product_featuresTitle()}</h3>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">{m.product_featuresSubtitle()}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Active Tables */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8 hover:border-slate-600 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">{m.product_featureActiveTablesTitle()}</h4>
              <p className="text-slate-400 leading-relaxed">{m.product_featureActiveTablesDesc()}</p>
            </div>

            {/* Workflow Automation */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8 hover:border-slate-600 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">{m.product_featureWorkflowTitle()}</h4>
              <p className="text-slate-400 leading-relaxed">{m.product_featureWorkflowDesc()}</p>
            </div>

            {/* E2EE */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8 hover:border-slate-600 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">{m.product_featureE2EETitle()}</h4>
              <p className="text-slate-400 leading-relaxed">{m.product_featureE2EEDesc()}</p>
            </div>

            {/* Multi-View */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8 hover:border-slate-600 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">{m.product_featureMultiViewTitle()}</h4>
              <p className="text-slate-400 leading-relaxed">{m.product_featureMultiViewDesc()}</p>
            </div>

            {/* Collaboration */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8 hover:border-slate-600 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">{m.product_featureCollaborationTitle()}</h4>
              <p className="text-slate-400 leading-relaxed">{m.product_featureCollaborationDesc()}</p>
            </div>

            {/* Permissions */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8 hover:border-slate-600 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">{m.product_featurePermissionsTitle()}</h4>
              <p className="text-slate-400 leading-relaxed">{m.product_featurePermissionsDesc()}</p>
            </div>
          </div>
        </section>

        {/* Views Showcase Section */}
        <section id="views" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">{m.product_viewsTitle()}</h3>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">{m.product_viewsSubtitle()}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Table View */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-white">{m.product_viewTableTitle()}</h4>
              </div>
              <p className="text-slate-400 mb-4">{m.product_viewTableDesc()}</p>
              <div className="rounded-lg bg-slate-900/50 border border-slate-700 p-4">
                <div className="space-y-2">
                  <div className="flex gap-2 text-xs text-slate-500 pb-2 border-b border-slate-700">
                    <div className="flex-1">Name</div>
                    <div className="flex-1">Status</div>
                    <div className="flex-1">Date</div>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-400">
                      <div className="flex-1">Record {i}</div>
                      <div className="flex-1">Active</div>
                      <div className="flex-1">2024-11-06</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Kanban View */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-white">{m.product_viewKanbanTitle()}</h4>
              </div>
              <p className="text-slate-400 mb-4">{m.product_viewKanbanDesc()}</p>
              <div className="rounded-lg bg-slate-900/50 border border-slate-700 p-4">
                <div className="flex gap-2">
                  {['Todo', 'Progress', 'Done'].map((status) => (
                    <div key={status} className="flex-1">
                      <div className="text-xs text-slate-500 mb-2">{status}</div>
                      <div className="space-y-2">
                        {[1].map((i) => (
                          <div key={i} className="rounded bg-slate-800 border border-slate-700 p-2 text-xs text-slate-400">
                            Task
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gantt View */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-white">{m.product_viewGanttTitle()}</h4>
              </div>
              <p className="text-slate-400 mb-4">{m.product_viewGanttDesc()}</p>
              <div className="rounded-lg bg-slate-900/50 border border-slate-700 p-4">
                <div className="space-y-2">
                  {[
                    { width: '60%', color: 'bg-blue-500' },
                    { width: '40%', color: 'bg-green-500' },
                    { width: '80%', color: 'bg-purple-500' },
                  ].map((bar, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="text-xs text-slate-500 w-16">Task {i + 1}</div>
                      <div className="flex-1 bg-slate-800 rounded h-4">
                        <div className={`${bar.color} h-4 rounded`} style={{ width: bar.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Analytics View */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-white">{m.product_viewAnalyticsTitle()}</h4>
              </div>
              <p className="text-slate-400 mb-4">{m.product_viewAnalyticsDesc()}</p>
              <div className="rounded-lg bg-slate-900/50 border border-slate-700 p-4">
                <div className="flex items-end gap-2 h-24">
                  {[60, 80, 45, 90, 70].map((height, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="container mx-auto px-6 py-20">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-12 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-white mb-4">{m.product_securityTitle()}</h3>
              <p className="text-xl text-slate-300">{m.product_securitySubtitle()}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                  AES-256
                </div>
                <div className="text-sm text-slate-400">{m.product_securityAES()}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                  OPE
                </div>
                <div className="text-sm text-slate-400">{m.product_securityOPE()}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                  HMAC
                </div>
                <div className="text-sm text-slate-400">{m.product_securityHMAC()}</div>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-xl bg-slate-900/50 border border-slate-700">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400 mt-0.5 flex-shrink-0">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">{m.product_securityClientSideTitle()}</h4>
                  <p className="text-sm text-slate-400">{m.product_securityClientSideDesc()}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm p-12 md:p-16 text-center">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">{m.product_ctaTitle()}</h3>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">{m.product_ctaDescription()}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-medium px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {m.product_getStarted()}
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm py-8">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                  <span className="text-sm font-bold">B</span>
                </div>
                <span className="text-sm text-slate-400">© 2024 BEQEEK. {m.product_footerRights()}</span>
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  {m.product_footerPrivacy()}
                </a>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  {m.product_footerTerms()}
                </a>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  {m.product_footerContact()}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
