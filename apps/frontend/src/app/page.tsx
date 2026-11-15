import { ArrowUpRight, BarChart3, Compass, Globe2, LayoutDashboard, MessageCircle, Radio, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HealthStatus } from "@/components/health-status";
import { EngagementChart } from "@/components/engagement-chart";

const metrics = [
  { label: "Audience conversations", value: "2,550", detail: "Illustrative weekly mentions", icon: MessageCircle },
  { label: "Positive sentiment", value: "72%", detail: "Illustrative audience sentiment", icon: Sparkles },
  { label: "Topics to explore", value: "08", detail: "Illustrative topic clusters", icon: Compass },
  { label: "Content engagement", value: "4.8%", detail: "Illustrative engagement rate", icon: TrendingUp },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-white focus:p-4">Skip to content</a>
      <aside className="border-b bg-white p-6 lg:fixed lg:inset-y-0 lg:w-60 lg:border-r">
        <a href="#overview" className="flex items-center gap-3" aria-label="Social Intelligence home">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white"><Radio size={23} aria-hidden="true" /></span>
          <span className="text-sm font-bold leading-5">Social<br />Intelligence<span className="text-primary">.</span></span>
        </a>
        <div className="mt-8 rounded-lg border bg-background px-3 py-3 text-sm"><span className="font-semibold">Demo workspace</span><p className="mt-1 text-xs text-muted-foreground">India / D2C & agencies</p></div>
        <nav aria-label="Main navigation" className="mt-7 flex flex-wrap gap-2 lg:flex-col">
          <a href="#overview" className="flex items-center gap-3 rounded-lg bg-accent px-3 py-3 text-sm font-semibold text-primary"><LayoutDashboard size={18} aria-hidden="true" /> Overview</a>
          <a href="#preview" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-muted"><BarChart3 size={18} aria-hidden="true" /> Analytics preview</a>
          <a href="#foundation" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-muted"><Globe2 size={18} aria-hidden="true" /> Platform status</a>
        </nav>
        <div className="mt-8 rounded-xl bg-slate-900 p-4 text-white lg:absolute lg:right-6 lg:bottom-6 lg:left-6"><p className="text-xs font-semibold text-emerald-300">BUILT FOR BETTER DECISIONS</p><p className="mt-2 text-sm leading-6 text-slate-300">Turn audience signals into your next move.</p><p className="mt-3 text-xs text-slate-400">Foundation preview / v0.1</p></div>
      </aside>
      <div className="min-w-0 lg:col-start-2">
        <header className="flex items-center justify-between border-b bg-white px-6 py-5 lg:px-10"><span className="text-sm text-muted-foreground">Workspace <span className="mx-2 text-slate-300">/</span> <span className="text-foreground">Overview</span></span><span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">India-first intelligence</span></header>
        <main id="main" className="mx-auto max-w-7xl space-y-7 p-6 lg:p-10">
          <section id="overview" className="flex scroll-mt-6 flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold tracking-[0.2em] text-primary">YOUR MARKET, IN FOCUS</p><h1 className="text-3xl font-semibold tracking-tight">A clearer view of your audience.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">One place for the conversations, content, and opportunities that matter to your brand.</p></div><Button asChild variant="outline"><a href="#foundation">View platform status <ArrowUpRight size={16} aria-hidden="true" /></a></Button></section>
          <div role="note" className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900"><Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><p><strong>Demo data only.</strong> This is a foundation preview. No social accounts are connected and no AI analysis has been performed.</p></div>
          <section aria-label="Demo metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, detail, icon: Icon }) => <Card key={label}><CardHeader className="flex-row items-center justify-between space-y-0 pb-3"><CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle><Icon className="size-4 text-primary" aria-hidden="true" /></CardHeader><CardContent><p className="text-3xl font-semibold tracking-tight">{value}</p><p className="mt-3 text-xs text-muted-foreground">{detail}</p></CardContent></Card>)}</section>
          <section id="preview" className="grid scroll-mt-6 gap-6 xl:grid-cols-[1.7fr_1fr]">
            <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Conversation momentum</CardTitle><span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">Demo week</span></div><p className="text-sm text-muted-foreground">An illustration of how audience activity will appear.</p></CardHeader><CardContent><EngagementChart /></CardContent></Card>
            <Card><CardHeader><CardTitle>A space for your next opportunity</CardTitle><p className="text-sm text-muted-foreground">Planned capabilities, not live insights.</p></CardHeader><CardContent className="space-y-5">{[{ title: "Listen to your audience", text: "Understand opinions across languages and conversations." }, { title: "Watch the wider market", text: "Explore competitor activity and emerging topics." }, { title: "Make content count", text: "Connect content performance with marketing decisions." }].map((item, index) => <div key={item.title} className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary">0{index + 1}</span><div><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.text}</p></div></div>)}</CardContent></Card>
          </section>
          <section id="foundation" className="scroll-mt-6 rounded-xl border bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold">Foundation status</h2><p className="mt-1 text-sm text-muted-foreground">Live dependency check. Separate from the demo analytics.</p></div><HealthStatus /></div></section>
          <footer className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>Social Intelligence / Task 001</span><span>Local development preview / Not production-ready</span></footer>
        </main>
      </div>
    </div>
  );
}
