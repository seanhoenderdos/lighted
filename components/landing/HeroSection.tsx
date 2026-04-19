'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { FlipWords } from '@/components/ui/flip-words';
import { fadeUp } from './motion';
import BriefPreview from './BriefPreview';

const HeroSection = () => (
  <section className="relative md:min-h-[calc(100svh-64px)] flex items-center overflow-hidden">
    {/* Animated spotlight background — hidden on mobile to prevent overflow */}
    <div className="hidden md:block">
      <Spotlight />
    </div>

    {/* Background texture */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent" />
    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/[0.02] to-transparent" />

    <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-6 py-10 sm:py-12 md:py-24 lg:py-28">
      <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center">
        {/* Left — copy */}
        <div className="space-y-6 sm:space-y-8 text-center md:text-left">
          <div className="font-serif text-[1.75rem] sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight">
            <TextGenerateEffect
              words="Your sermon research,"
              className="font-serif text-[1.75rem] sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight"
              duration={0.4}
            />
            <div className="relative h-[1.3em]">
              <span className="primary-text-gradient">done in</span>{' '}
              <FlipWords words={["minutes", "seconds", "no time"]} duration={3000} className="text-primary" />
            </div>
          </div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[480px] mx-auto md:mx-0"
          >
            Greek &amp; Hebrew word studies, historical context, and cross-references
            for any passage — so you can focus on crafting your message.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row items-center md:items-start gap-4 pt-1"
          >
            <Button asChild size="lg" className="rounded-full text-base px-8 h-12 w-full sm:w-auto shadow-lg shadow-primary/20">
              <Link href="/sign-up">
                Start preparing — it&apos;s free
                <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Right — product preview (scaled down on mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 32, rotate: 1 }}
          animate={{ opacity: 1, y: 0, rotate: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          className="mx-auto w-full max-w-[320px] md:max-w-none"
        >
          <BriefPreview />
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
