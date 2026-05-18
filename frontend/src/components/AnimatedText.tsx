/**
 * AnimatedText — reusable heading animation primitives
 *
 * Components exported:
 *  - FadeUpText        : fade + slide up on mount / scroll
 *  - GradientHeading   : animated gradient shimmer across text
 *  - SplitReveal       : word-by-word staggered reveal
 *  - BlurReveal        : blur-to-clear entrance
 *  - TypewriterText    : typewriter with blinking cursor
 *  - GlowPulse         : subtle glow pulse on important keywords
 *  - AnimatedSection   : scroll-triggered section wrapper
 *  - PageTitle         : full page-title block (label + h1 + subtitle)
 */

import { useEffect, useRef, useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import {
  motion,
  useInView,
  useAnimation,
  AnimatePresence,
} from 'framer-motion'
import type { Variants, TargetAndTransition } from 'framer-motion'

/* ─────────────────────────────────────────────────────────
   Shared easing curves
───────────────────────────────────────────────────────── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const

/* ─────────────────────────────────────────────────────────
   1. FadeUpText
   Fades + slides up when it enters the viewport.
   Works for any heading level.
───────────────────────────────────────────────────────── */
interface FadeUpTextProps {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  delay?: number
  duration?: number
  distance?: number
  className?: string
  style?: CSSProperties
  once?: boolean
}

export function FadeUpText({
  children,
  as: Tag = 'h2',
  delay = 0,
  duration = 0.55,
  distance = 18,
  className = '',
  style,
  once = true,
}: FadeUpTextProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref as React.RefObject<Element>, { once, margin: '-40px 0px' })

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: distance }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
    >
      <Tag className={className} style={style}>
        {children}
      </Tag>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────
   2. GradientHeading
   Text with an animated gradient that sweeps across.
───────────────────────────────────────────────────────── */
interface GradientHeadingProps {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span'
  gradient?: string
  delay?: number
  className?: string
  style?: CSSProperties
  animate?: boolean
}

export function GradientHeading({
  children,
  as: Tag = 'h1',
  gradient = 'linear-gradient(90deg, #818cf8 0%, #c7d2fe 30%, #6366f1 55%, #a5b4fc 80%, #818cf8 100%)',
  delay = 0,
  className = '',
  style,
  animate = true,
}: GradientHeadingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-30px 0px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE_OUT_EXPO }}
    >
      <Tag
        className={className}
        style={{
          background: gradient,
          backgroundSize: animate ? '200% auto' : '100% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: animate ? 'gradientSweep 4s linear infinite' : undefined,
          ...style,
        }}
      >
        {children}
      </Tag>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────
   3. SplitReveal
   Splits text into words and reveals each with a stagger.
───────────────────────────────────────────────────────── */
interface SplitRevealProps {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p'
  delay?: number
  stagger?: number
  className?: string
  style?: CSSProperties
  highlightWords?: string[]
  highlightStyle?: CSSProperties
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      delay: i * 0.07,
      ease: EASE_OUT_QUART,
    },
  }),
}

export function SplitReveal({
  text,
  as: Tag = 'h2',
  delay = 0,
  stagger = 0.07,
  className = '',
  style,
  highlightWords = [],
  highlightStyle,
}: SplitRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-30px 0px' })
  const words = text.split(' ')

  return (
    <div ref={ref}>
      <Tag className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25em', ...style }}>
        {words.map((word, i) => {
          const isHighlighted = highlightWords.includes(word.replace(/[.,!?]/g, ''))
          return (
            <motion.span
              key={`${word}-${i}`}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              style={{
                display: 'inline-block',
                animationDelay: `${delay + i * stagger}s`,
                ...(isHighlighted ? highlightStyle : {}),
              }}
            >
              {word}
            </motion.span>
          )
        })}
      </Tag>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   4. BlurReveal
   Blurs in from nothing — premium, cinematic feel.
───────────────────────────────────────────────────────── */
interface BlurRevealProps {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
  delay?: number
  duration?: number
  className?: string
  style?: CSSProperties
}

export function BlurReveal({
  children,
  as: Tag = 'h2',
  delay = 0,
  duration = 0.7,
  className = '',
  style,
}: BlurRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px 0px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: 'blur(12px)', y: 8 }}
      animate={inView
        ? { opacity: 1, filter: 'blur(0px)', y: 0 }
        : { opacity: 0, filter: 'blur(12px)', y: 8 }}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
    >
      <Tag className={className} style={style}>
        {children}
      </Tag>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────
   5. TypewriterText
   Classic typewriter with blinking cursor.
───────────────────────────────────────────────────────── */
interface TypewriterTextProps {
  texts: string[]
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span'
  speed?: number
  pauseMs?: number
  className?: string
  style?: CSSProperties
  cursorColor?: string
}

export function TypewriterText({
  texts,
  as: Tag = 'span',
  speed = 55,
  pauseMs = 1800,
  className = '',
  style,
  cursorColor = '#818cf8',
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('')
  const [textIdx, setTextIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setShowCursor(v => !v), 530)
    return () => clearInterval(id)
  }, [])

  // Typing logic
  useEffect(() => {
    const current = texts[textIdx]
    if (!deleting && charIdx < current.length) {
      const id = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      }, speed)
      return () => clearTimeout(id)
    }
    if (!deleting && charIdx === current.length) {
      const id = setTimeout(() => setDeleting(true), pauseMs)
      return () => clearTimeout(id)
    }
    if (deleting && charIdx > 0) {
      const id = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx - 1))
        setCharIdx(c => c - 1)
      }, speed / 2)
      return () => clearTimeout(id)
    }
    if (deleting && charIdx === 0) {
      setDeleting(false)
      setTextIdx(i => (i + 1) % texts.length)
    }
  }, [charIdx, deleting, textIdx, texts, speed, pauseMs])

  return (
    <Tag className={className} style={style}>
      {displayed}
      <span
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1em',
          background: cursorColor,
          marginLeft: '2px',
          verticalAlign: 'text-bottom',
          borderRadius: '1px',
          opacity: showCursor ? 1 : 0,
          transition: 'opacity 0.1s',
        }}
        aria-hidden="true"
      />
    </Tag>
  )
}

/* ─────────────────────────────────────────────────────────
   6. GlowPulse
   Wraps a keyword with a pulsing glow — great for
   highlighting important words inline.
───────────────────────────────────────────────────────── */
interface GlowPulseProps {
  children: ReactNode
  color?: string
  className?: string
}

export function GlowPulse({
  children,
  color = '#6366f1',
  className = '',
}: GlowPulseProps) {
  return (
    <motion.span
      className={className}
      style={{ display: 'inline-block', color }}
      animate={{
        textShadow: [
          `0 0 8px ${color}40`,
          `0 0 20px ${color}80`,
          `0 0 8px ${color}40`,
        ],
      }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.span>
  )
}

/* ─────────────────────────────────────────────────────────
   7. AnimatedSection
   Scroll-triggered wrapper — fades + slides up the whole
   section when it enters the viewport.
───────────────────────────────────────────────────────── */
interface AnimatedSectionProps {
  children: ReactNode
  delay?: number
  className?: string
  style?: CSSProperties
  as?: 'section' | 'div' | 'article'
}

export function AnimatedSection({
  children,
  delay = 0,
  className = '',
  style,
  as = 'div',
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })

  const Tag = as

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: EASE_OUT_EXPO }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────
   8. PageTitle
   Full page-title block: eyebrow label + animated h1 +
   subtitle. Used at the top of every page.
───────────────────────────────────────────────────────── */
interface PageTitleProps {
  eyebrow?: string
  title: string
  subtitle?: string
  titleGradient?: boolean
  align?: 'left' | 'center'
  titleClassName?: string
}

export function PageTitle({
  eyebrow,
  title,
  subtitle,
  titleGradient = false,
  align = 'left',
  titleClassName = '',
}: PageTitleProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'items-start'

  return (
    <div className={`flex flex-col gap-1 ${alignClass}`}>
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--brand-600)' }}
        >
          {eyebrow}
        </motion.p>
      )}

      {titleGradient ? (
        <GradientHeading
          as="h1"
          delay={eyebrow ? 0.06 : 0}
          className={`text-2xl font-bold tracking-tight ${titleClassName}`}
        >
          {title}
        </GradientHeading>
      ) : (
        <BlurReveal
          as="h1"
          delay={eyebrow ? 0.06 : 0}
          className={`text-2xl font-bold tracking-tight ${titleClassName}`}
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </BlurReveal>
      )}

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: EASE_OUT_EXPO }}
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   9. CountUp
   Animates a number from 0 to its value — for stats cards.
───────────────────────────────────────────────────────── */
interface CountUpProps {
  value: number
  duration?: number
  className?: string
  style?: CSSProperties
}

export function CountUp({ value, duration = 1.2, className = '', style }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = value / (duration * 60)
    const id = setInterval(() => {
      start += step
      if (start >= value) { setDisplayed(value); clearInterval(id) }
      else setDisplayed(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(id)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className} style={style}>
      {displayed}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────
   10. SlideIn
   Slides in from left or right — for panel headings.
───────────────────────────────────────────────────────── */
interface SlideInProps {
  children: ReactNode
  from?: 'left' | 'right' | 'bottom'
  delay?: number
  className?: string
  style?: CSSProperties
}

export function SlideIn({
  children,
  from = 'bottom',
  delay = 0,
  className = '',
  style,
}: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px 0px' })

  const initial: TargetAndTransition =
    from === 'left'  ? { opacity: 0, x: -20 } :
    from === 'right' ? { opacity: 0, x: 20 }  :
                       { opacity: 0, y: 16 }

  const animate: TargetAndTransition = inView
    ? { opacity: 1, x: 0, y: 0 }
    : initial

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.45, delay, ease: EASE_OUT_EXPO }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
