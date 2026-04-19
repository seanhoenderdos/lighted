'use client'

import { motion } from 'framer-motion';
import { Mic, BookOpen, FileText } from 'lucide-react';
import { fadeUp } from './motion';

const steps = [
  {
    icon: Mic,
    step: '01',
    title: 'Share your passage',
    desc: 'Send a voice note on Telegram, or type your scripture and topic directly in the app.',
  },
  {
    icon: BookOpen,
    step: '02',
    title: 'Get your research brief',
    desc: 'Receive Greek & Hebrew word studies, historical context, cross-references, and sermon outline suggestions.',
  },
  {
    icon: FileText,
    step: '03',
    title: 'Craft your sermon',
    desc: 'Use the brief as your foundation. Refine your outline and prepare with confidence — your voice, your message.',
  },
];

const HowItWorksSection = () => (
  <section className="relative bg-muted/40">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 md:py-32">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        custom={0}
        className="text-center mb-10 md:mb-16"
      >
        <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">How it works</p>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">3 steps to sermon-ready research</h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-8">
        {steps.map((item, i) => (
          <motion.div
            key={item.step}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={i + 1}
            className="group relative bg-card border border-border/60 rounded-2xl p-5 sm:p-7 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="size-11 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                <item.icon className="size-5 text-primary" />
              </div>
              <span className="text-xs font-mono font-bold text-muted-foreground/40">{item.step}</span>
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
