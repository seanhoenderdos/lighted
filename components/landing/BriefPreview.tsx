import { Languages, Globe, FileText, Sparkles } from 'lucide-react';

const BriefPreview = () => (
  <div className="relative w-full max-w-[420px] mx-auto">
    {/* Outer glow layers */}
    <div className="absolute -inset-8 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent rounded-3xl blur-2xl" />
    <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-md" />

    <div className="relative rounded-2xl border border-border/80 bg-card shadow-[0_8px_40px_-12px_rgba(28,25,23,0.12)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-primary/[0.04] to-transparent">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="size-5 rounded-md bg-primary/10 flex items-center justify-center">
            <Sparkles className="size-3 text-primary" />
          </div>
          <span className="text-xs font-semibold text-primary tracking-wide">Exegesis Brief</span>
        </div>
        <h4 className="font-serif text-xl font-semibold text-foreground">Romans 8:28</h4>
        <p className="text-sm text-muted-foreground mt-1 italic">&ldquo;And we know that in all things God works for the good...&rdquo;</p>
      </div>

      {/* Greek Insight */}
      <div className="px-6 py-4 border-t border-border/60">
        <div className="flex items-center gap-2 mb-2.5">
          <Languages className="size-3.5 text-primary/60" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">Greek Insight</span>
        </div>
        <div className="bg-gradient-to-br from-primary/[0.04] to-muted/40 rounded-xl px-4 py-3 border border-border/40">
          <p className="font-serif text-lg text-foreground">συνεργέω <span className="text-muted-foreground font-sans text-sm font-normal">(synergéō)</span></p>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">&ldquo;To work together with&rdquo; — implies active, cooperative effort. God is not passive; He orchestrates events toward a redemptive purpose.</p>
        </div>
      </div>

      {/* Historical Context */}
      <div className="px-6 py-4 border-t border-border/60">
        <div className="flex items-center gap-2 mb-2.5">
          <Globe className="size-3.5 text-primary/60" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">Historical Context</span>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">Written to a persecuted church in Rome (~57 AD). Paul addresses suffering directly — these believers faced social ostracism, economic hardship, and imperial suspicion...</p>
      </div>

      {/* Sermon Outline */}
      <div className="px-6 py-4 border-t border-border/60">
        <div className="flex items-center gap-2 mb-2.5">
          <FileText className="size-3.5 text-primary/60" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">Sermon Outline</span>
        </div>
        <ol className="text-[13px] text-muted-foreground space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-primary/60 font-mono text-xs mt-0.5">1.</span>
            <span>The Promise: God&apos;s sovereign working</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary/60 font-mono text-xs mt-0.5">2.</span>
            <span>The Condition: &ldquo;Those who love God&rdquo;</span>
          </li>
          <li className="flex items-start gap-2 opacity-40">
            <span className="text-primary/60 font-mono text-xs mt-0.5">3.</span>
            <span>The Purpose: Called according to His plan...</span>
          </li>
        </ol>
      </div>
    </div>
  </div>
);

export default BriefPreview;
