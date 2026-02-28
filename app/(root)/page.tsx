'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-8">
            <Image
              src="/images/site-logo.svg"
              width={200}
              height={200}
              alt="Lighted"
              className="dark:invert-0"
            />
            <h2 className="text-2xl font-bold mt-4">Lighted</h2>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="text-primary">Lighted</span> - Voice-to-Exegesis for Pastors
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Send a voice note via Telegram with your sermon topic or scripture passage, 
            and receive a beautifully crafted exegesis brief in seconds.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/sign-in">
                Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/sign-up">
                Create Account
              </Link>
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
            <div className="p-6 rounded-xl border bg-card">
              <div className="text-2xl mb-2">🎙️</div>
              <h3 className="font-semibold text-lg mb-2">Voice Notes</h3>
              <p className="text-muted-foreground text-sm">
                Simply speak your thoughts via Telegram. No typing required.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card">
              <div className="text-2xl mb-2">📖</div>
              <h3 className="font-semibold text-lg mb-2">Deep Exegesis</h3>
              <p className="text-muted-foreground text-sm">
                AI-powered biblical scholarship for sermon preparation.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-lg mb-2">Instant Briefs</h3>
              <p className="text-muted-foreground text-sm">
                Receive your exegesis brief in under 60 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Legal Links */}
      <footer className="w-full py-6 px-6 border-t">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Lighted. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link 
              href="/privacy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
