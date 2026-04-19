'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeUp } from './motion';

const includedFeatures = [
  'Unlimited exegesis briefs',
  'All 7 sermon templates',
  'Greek & Hebrew word studies',
  'Historical & cultural context',
  'Telegram voice-note integration',
  'Full web app access',
];

const PricingSection = () => (
  <section className="relative bg-muted/40">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-16 md:py-32 text-center">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        custom={0}
      >
        <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Pricing</p>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Free for every pastor</h2>
        <p className="text-muted-foreground mt-4">Completely free. No limits, no trials, no catch.</p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        custom={1}
        className="mt-12 relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 to-primary/5 rounded-[20px] blur-sm" />
        <div className="relative bg-card border border-border/60 rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm text-left">
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-bold font-serif text-foreground">Free</span>
            <span className="text-muted-foreground text-sm">/ forever</span>
          </div>
          <div className="h-px bg-gradient-to-r from-border via-border to-transparent mb-6" />
          <ul className="space-y-4">
            {includedFeatures.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="size-3 text-primary" strokeWidth={3} />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button asChild size="lg" className="w-full rounded-full text-base h-12">
              <Link href="/sign-up">
                Get started — it&apos;s free
                <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default PricingSection;
