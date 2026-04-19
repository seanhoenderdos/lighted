'use client'

import { motion } from 'framer-motion';
import { Languages, Globe, FileText, MonitorSmartphone } from 'lucide-react';
import { WobbleCard } from '@/components/ui/wobble-card';
import { fadeUp } from './motion';

const features = [
  {
    icon: Languages,
    title: 'Greek & Hebrew Word Studies',
    desc: 'Instant access to original-language insights for any passage. No seminary Greek required.',
    color: 'bg-primary/80',
  },
  {
    icon: Globe,
    title: 'Historical & Cultural Context',
    desc: 'Understand the world behind the text — customs, geography, political dynamics, and more.',
    color: 'bg-[#8B7355]',
  },
  {
    icon: FileText,
    title: 'Sermon Outline Suggestions',
    desc: 'Get structured outline ideas across 7 sermon styles — expository, topical, narrative, and more.',
    color: 'bg-primary/80',
  },
  {
    icon: MonitorSmartphone,
    title: 'Works How You Work',
    desc: 'Start with a Telegram voice note on the go, or dive in from your desk. Your research follows you.',
    color: 'bg-[#8B7355]',
  },
];

const FeaturesSection = () => (
  <section className="relative">
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
        <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Features</p>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Built for how pastors actually prepare</h2>
        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">We automate the hours of manual research. You bring the message and the Holy Spirit.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
        {features.map((feat, i) => (
          <motion.div
            key={feat.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={i}
          >
            <WobbleCard
              containerClassName={feat.color}
              className="flex flex-col gap-4 py-8 sm:py-10"
            >
              <div className="size-11 shrink-0 rounded-xl bg-white/20 flex items-center justify-center">
                <feat.icon className="size-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-1.5">{feat.title}</h3>
                <p className="text-sm text-white/80 leading-relaxed max-w-xs">{feat.desc}</p>
              </div>
            </WobbleCard>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
