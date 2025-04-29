'use client'

import React, { useState, useEffect, useRef, ReactNode } from 'react'
import { motion, useAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

// Particle animation component with client-side only rendering to avoid hydration issues
const Particles = ({ className = "", quantity = 20, delayStart = 500 }) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  const [isMounted, setIsMounted] = useState(false)
  const [isAnimationVisible, setIsAnimationVisible] = useState(false)
  
  // Only render particles on the client-side to avoid hydration mismatches
  useEffect(() => {
    setIsMounted(true)
    
    // Delay the animation start
    const timer = setTimeout(() => {
      setIsAnimationVisible(true)
    }, delayStart)
    
    return () => clearTimeout(timer)
  }, [delayStart])
  
  // Return empty div until client-side rendering is ready
  if (!isMounted) {
    return <div className={`absolute inset-0 overflow-hidden ${className}`} />
  }
  
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {isAnimationVisible && Array.from({ length: quantity }).map((_, index) => {
        // Use fixed preset values instead of Math.random() to avoid hydration mismatches
        const width = 1 + (index % 3) + 1
        const height = 1 + ((index + 1) % 3) + 1
        const posTop = `${(index * 5) % 100}%`
        const posLeft = `${((index * 7) + 3) % 100}%`
        
        return (
          <motion.div
            key={index}
            className={`absolute block ${isDarkMode ? 'bg-primary/40' : 'bg-primary/30'} rounded-full`}
            style={{
              width,
              height,
              top: posTop,
              left: posLeft,
            }}
            animate={{
              top: [
                posTop,
                `${((index * 11) + 7) % 100}%`,
                `${((index * 13) + 11) % 100}%`,
              ],
              left: [
                posLeft,
                `${((index * 17) + 5) % 100}%`,
                `${((index * 19) + 9) % 100}%`,
              ],
              opacity: [0, 0.7, 0],
              scale: [0, ((index % 3) + 1), 0],
            }}
            transition={{
              duration: 15 + (index % 10),
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )
      })}
    </div>
  )
}

// Subtle tilt effect component with reduced movement
interface TiltProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // Lower values for less tilt
}

const Tilt = ({ children, className = "", intensity = 1 }: TiltProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)
  
  // Reduce the rotation angles significantly
  const maxRotation = 3 * intensity // Much smaller values
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${maxRotation}deg`, `-${maxRotation}deg`])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${maxRotation}deg`, `${maxRotation}deg`])
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    
    x.set(xPct)
    y.set(yPct)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }
  
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  )
}

// Floating element animation with reduced movement
interface FloatingElementProps {
  delay?: number;
  children: ReactNode;
  className?: string;
}

const FloatingElement = ({ delay = 0, children, className = "" }: FloatingElementProps) => {
  return (
    <motion.div
      className={className}
      animate={{ 
        y: [0, -8, 0], // Reduced movement
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

const University = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [userType, setUserType] = useState<'pastor' | 'student'>('pastor')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const mainControls = useAnimation()
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  
  // Fix hydration mismatch by ensuring client-side rendering for theme-dependent code
  useEffect(() => {
    setMounted(true)
    mainControls.start("visible")
  }, [mainControls])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !name) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/university/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          type: userType
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      
      setSubmitted(true)
      toast.success('Successfully joined the waitlist!')
      
    } catch (error) {
      console.error('Error submitting to waitlist:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to join waitlist')
    } finally {
      setLoading(false)
    }
  }

  // Only use theme for class after client-side hydration is complete
  const themeClass = mounted ? (theme === 'dark' ? 'dark-university' : 'light-university') : ''

  return (
    // Using relative positioning to work within the existing layout
    <div className={`relative min-h-[calc(100vh-6rem)] w-full ${themeClass}`}>
      {/* Background gradient - better light/dark mode handling */}
      <div className="absolute inset-0 bg-gradient-background z-0" />
      
      {/* Particles effect - client-side only rendering with 500ms delay */}
      <Particles quantity={15} className="z-0" delayStart={500} />
      
      {/* Main content */}
      <div className="relative z-20 flex items-center justify-center min-h-[calc(100vh-6rem)]">
        <motion.div 
          className="container max-w-6xl px-4 py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left side - Text content */}
            <motion.div 
              className="flex-1 text-center lg:text-left"
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: { opacity: 1, x: 0 },
              }}
              initial="hidden"
              animate={mainControls}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              >
                <h1 className="h1-bold text-4xl md:text-5xl lg:text-6xl mb-4 text-heading">
                  <span className="primary-text-gradient">Biblical Education</span> Platform
                </h1>
                <div className="relative mb-2 w-fit mx-auto lg:mx-0">
                  <h2 className="h2-semibold text-heading">Coming Soon</h2>
                  <motion.span 
                    className="absolute bottom-0 left-0 bg-primary h-1 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </div>
              </motion.div>
              
              <motion.p 
                className="paragraph-regular max-w-lg mx-auto lg:mx-0 text-body mb-8"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 }
                }}
                initial="hidden"
                animate={mainControls}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                A revolutionary platform for pastors to create, share, and monetize Biblical courses.
                Learn, teach, and grow your ministry through our innovative educational ecosystem.
              </motion.p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
                <motion.div 
                  className="feature-badge"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(20, 210, 186, 0.1)" }}
                >
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span className="text-feature">Expertly Crafted Courses</span>
                </motion.div>
                
                <motion.div 
                  className="feature-badge"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(20, 210, 186, 0.1)" }}
                >
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span className="text-feature">Monetize Your Knowledge</span>
                </motion.div>
                
                <motion.div 
                  className="feature-badge"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(20, 210, 186, 0.1)" }}
                >
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span className="text-feature">Grow Your Ministry</span>
                </motion.div>
              </div>
              
              {/* Stats counters - improved visibility for light mode */}
              <motion.div 
                className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto lg:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
              >
                <div className="text-center">
                  <motion.h3 
                    className="text-3xl font-bold text-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.8 }}
                  >
                    1000+
                  </motion.h3>
                  <p className="text-sm text-muted-heading">Future Courses</p>
                </div>
                <div className="text-center">
                  <motion.h3 
                    className="text-3xl font-bold text-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.8 }}
                  >
                    50+
                  </motion.h3>
                  <p className="text-sm text-muted-heading">Instructors</p>
                </div>
                <div className="text-center">
                  <motion.h3 
                    className="text-3xl font-bold text-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.8 }}
                  >
                    24/7
                  </motion.h3>
                  <p className="text-sm text-muted-heading">Support</p>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right side - Waitlist signup form - with minimal movement */}
            <motion.div 
              className="flex-1"
              variants={{
                hidden: { opacity: 0, x: 30 },
                visible: { opacity: 1, x: 0 },
              }}
              initial="hidden"
              animate={mainControls}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Reduced tilt intensity for minimal movement */}
              <Tilt className="relative" intensity={0.5}>
                <Card className="p-6 backdrop-blur-sm bg-card-university border-primary/20 shadow-xl overflow-hidden">
                  {/* Background glow effects - reduced intensity */}
                  <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                  <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                  
                  {!submitted ? (
                    <>
                      <motion.div 
                        className="relative mb-6 text-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <h3 className="h3-bold text-primary mb-2">Join the Waitlist</h3>
                        <p className="text-muted-heading">Be the first to know when we launch</p>
                      </motion.div>
                      
                      <motion.form 
                        onSubmit={handleSubmit} 
                        className="relative space-y-4 z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      >
                        <motion.div 
                          className="space-y-2"
                          initial={{ x: 10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <Label htmlFor="name" className="text-form-label">Name</Label>
                          <Input 
                            id="name"
                            type="text" 
                            placeholder="Your name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-background/50 border-input-border focus:border-primary transition-all duration-300"
                          />
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          initial={{ x: 10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          <Label htmlFor="email" className="text-form-label">Email</Label>
                          <Input 
                            id="email"
                            type="email" 
                            placeholder="your.email@example.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-background/50 border-input-border focus:border-primary transition-all duration-300"
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ x: 10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          <Tabs 
                            defaultValue="pastor" 
                            className="w-full"
                            onValueChange={(value) => setUserType(value as 'pastor' | 'student')}
                          >
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="pastor" className="data-[state=active]:bg-primary">Pastor</TabsTrigger>
                              <TabsTrigger value="student" className="data-[state=active]:bg-primary">Student</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.0, type: "spring" }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="submit" 
                            className="w-full primary-gradient relative overflow-hidden group"
                            disabled={loading}
                          >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {loading ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  Join Waitlist
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                  </svg>
                                </>
                              )}
                            </span>
                          </Button>
                        </motion.div>
                      </motion.form>
                    </>
                  ) : (
                    <motion.div 
                      className="text-center py-6 relative z-10"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div 
                        className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-10 h-10 text-primary">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="h3-bold text-primary mb-2">Thank You!</h3>
                        <p className="text-muted-heading mb-6">You&apos;ve been added to our waitlist. We&apos;ll notify you as soon as we launch.</p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={() => setSubmitted(false)} 
                          variant="outline" 
                          className="border-primary text-primary hover:bg-primary/10 transition-all duration-300"
                        >
                          Return to Form
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </Card>
              </Tilt>
            </motion.div>
          </div>
          
          {/* Subtle floating elements - reduced quantity */}
          <FloatingElement delay={0} className="absolute top-1/4 left-10 w-16 h-16 rounded-full bg-primary/5 blur-xl">
            <div />
          </FloatingElement>
          <FloatingElement delay={2} className="absolute bottom-1/4 right-10 w-24 h-24 rounded-full bg-primary/5 blur-2xl">
            <div />
          </FloatingElement>
        </motion.div>
      </div>
      
      {/* Footer with copyright only - adjusted positioning */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 text-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm text-footer-copyright">&copy; {new Date().getFullYear()} Lighted University. All rights reserved.</p>
      </motion.div>
      
      {/* Add styles for improved light/dark mode and cursor effects */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        
        /* Better light/dark mode handling */
        .light-university {
          --bg-gradient-start: rgba(240, 245, 255, 0.9);
          --bg-gradient-middle: rgba(225, 235, 250, 0.9);
          --bg-gradient-end: rgba(210, 225, 245, 0.9);
          --text-heading: #10243F;
          --text-body: rgba(16, 36, 63, 0.8);
          --text-muted-heading: rgba(16, 36, 63, 0.6);
          --text-feature: #10243F;
          --card-bg: rgba(255, 255, 255, 0.9);
          --text-form-label: #10243F;
          --input-border: rgba(20, 210, 186, 0.3);
          --footer-link: rgba(16, 36, 63, 0.7);
          --footer-copyright: rgba(16, 36, 63, 0.5);
        }
        
        .dark-university {
          --bg-gradient-start: rgba(16, 36, 63, 0.9);
          --bg-gradient-middle: rgba(12, 30, 55, 0.9);
          --bg-gradient-end: rgba(8, 24, 47, 0.9);
          --text-heading: #FFFFFF;
          --text-body: rgba(255, 255, 255, 0.8);
          --text-muted-heading: rgba(255, 255, 255, 0.6);
          --text-feature: #FFFFFF;
          --card-bg: rgba(12, 26, 48, 0.8);
          --text-form-label: #FFFFFF;
          --input-border: rgba(255, 255, 255, 0.1);
          --footer-link: rgba(255, 255, 255, 0.7);
          --footer-copyright: rgba(255, 255, 255, 0.5);
        }
        
        .bg-gradient-background {
          background: linear-gradient(135deg, 
            var(--bg-gradient-start) 0%, 
            var(--bg-gradient-middle) 50%,
            var(--bg-gradient-end) 100%);
        }
        
        .bg-card-university {
          background-color: var(--card-bg);
        }
        
        .text-heading {
          color: var(--text-heading);
        }
        
        .text-body {
          color: var(--text-body);
        }
        
        .text-muted-heading {
          color: var(--text-muted-heading);
        }
        
        .text-feature {
          color: var(--text-feature);
        }
        
        .text-form-label {
          color: var(--text-form-label);
        }
        
        .border-input-border {
          border-color: var(--input-border);
        }
        
        .text-footer-link {
          color: var(--footer-link);
        }
        
        .text-footer-copyright {
          color: var(--footer-copyright);
        }
        
        .feature-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(20, 210, 186, 0.1);
          backdrop-filter: blur(8px);
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(20, 210, 186, 0.2);
          transition: all 0.3s ease;
        }
        
        /* Add styles to ensure university page respects layout */
        .dark-university, .light-university {
          position: relative;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default University
