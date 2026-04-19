'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { fadeUp } from './motion';

const faqs = [
  {
    question: 'Is Lighted free?',
    answer:
      'Yes. Lighted is completely free — always. There are no hidden fees and no limits on the number of briefs you can create.',
  },
  {
    question: 'Do I need to use Telegram?',
    answer:
      "Telegram is one way to submit passages — great for when you're on the go. But you can also use the web app directly to start research and craft your sermons.",
  },
  {
    question: 'Does Lighted write my sermon for me?',
    answer:
      'No. Lighted handles the research — word studies, context, cross-references, and outline suggestions. You bring the message, the heart, and the Holy Spirit.',
  },
  {
    question: 'What denominations does it support?',
    answer:
      'Lighted supports Baptist, Lutheran, Methodist, Presbyterian, Pentecostal, Anglican, Non-denominational, Catholic, and Reformed traditions. You can set your preference in your profile.',
  },
  {
    question: 'Is my data private?',
    answer:
      "Yes. Your briefs, conversations, and personal data are private to your account. We don't share or sell your information.",
  },
];

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="font-medium text-foreground pr-4 group-hover:text-primary transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`size-5 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm text-muted-foreground leading-relaxed">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => (
  <section className="relative">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-16 md:py-32">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        custom={0}
        className="text-center mb-12"
      >
        <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">FAQ</p>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
          Frequently asked questions
        </h2>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        custom={1}
      >
        {faqs.map((faq) => (
          <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
        ))}
      </motion.div>
    </div>
  </section>
);

export default FAQSection;
