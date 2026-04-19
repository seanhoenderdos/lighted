'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight';
import { fadeUp } from './motion';

const CTASection = () => (
  <section className="relative overflow-hidden">
    <div className="hidden md:block">
      <Spotlight
        gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(17, 50%, 75%, .12) 0, hsla(17, 50%, 56%, .04) 50%, hsla(17, 50%, 45%, 0) 80%)"
        gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(17, 50%, 75%, .08) 0, hsla(17, 50%, 56%, .03) 80%, transparent 100%)"
        gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(17, 50%, 75%, .06) 0, hsla(17, 50%, 45%, .02) 80%, transparent 100%)"
        duration={9}
        xOffset={80}
      />
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-primary/[0.03] to-transparent" />
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-6 py-16 md:py-32 text-center">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        custom={0}
      >
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          Spend less time researching.
          <br />
          Spend more time in the Word.
        </h2>
        <p className="text-muted-foreground mt-5 text-lg max-w-md mx-auto">
          Join pastors who prepare sermons with depth and confidence.
        </p>
      </motion.div>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        custom={1}
        className="mt-10"
      >
        <Button asChild size="lg" className="rounded-full text-base px-10 h-12 w-full sm:w-auto shadow-lg shadow-primary/20">
          <Link href="/sign-up">
            Start preparing — it&apos;s free
            <ArrowRight className="size-4 ml-1" />
          </Link>
        </Button>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
