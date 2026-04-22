import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import HeroScene from "@/components/three/HeroScene";
import AmbientScene from "@/components/three/AmbientScene";
import WaitlistForm from "@/components/WaitlistForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/* ---------- Small building blocks ---------- */

function Badge({ children, color = "#ff4500" }) {
  return (
    <span
      className="inline-flex items-center gap-2 border-2 px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-mono"
      style={{ borderColor: color, color }}
      data-testid="badge"
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
      />
      {children}
    </span>
  );
}

function SectionLabel({ num, title }) {
  return (
    <div className="flex items-baseline gap-5 mb-10">
      <div className="font-mono text-sm text-[#6b6358]">{num}</div>
      <div className="flex-1 border-t border-dashed border-[#0a0a0a]/30" />
      <div className="font-display text-2xl sm:text-3xl uppercase">{title}</div>
    </div>
  );
}

/* ---------- Marquee (top ticker) ---------- */
function Marquee() {
  const items = [
    "PORTFOLIOROASTER",
    "★",
    "ANDROID CLOSED TESTING",
    "★",
    "100% FREE",
    "★",
    "BRUTALLY HONEST AI",
    "★",
    "JOIN THE WAITLIST",
    "★",
  ];
  return (
    <div className="border-y-2 border-[#0a0a0a] bg-[#0a0a0a] text-[#f5f0e8] overflow-hidden">
      <div className="flex marquee-track whitespace-nowrap py-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex shrink-0">
            {items.map((t, j) => (
              <span
                key={j}
                className="font-display text-xl sm:text-2xl mx-6"
                style={{ color: t === "★" ? "#ff4500" : "#f5f0e8" }}
              >
                {t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero({ count }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacityTitle = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  return (
    <section ref={ref} className="relative min-h-[92vh] pt-6 pb-20 paper-grain">
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10">
        {/* top bar */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-mono uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#ff4500] rounded-full" />
            <span>portfolioroaster</span>
          </div>
          <div className="hidden sm:block text-[#6b6358]">
            [ coming soon — v0.1 ]
          </div>
          <div className="text-[#6b6358]">
            {count != null ? `${count} on the list` : "—"}
          </div>
        </div>

        {/* issue tag */}
        <div className="mt-16 sm:mt-20">
          <span className="stamp">↗ closed beta · dec 2025</span>
        </div>

        {/* Title + scene */}
        <div className="grid lg:grid-cols-12 gap-10 mt-6">
          <motion.div
            style={prefersReducedMotion ? {} : { y: yTitle, opacity: opacityTitle }}
            className="lg:col-span-7"
          >
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="font-display uppercase leading-[0.85] text-[18vw] sm:text-[13vw] lg:text-[10.5vw]"
            >
              ROAST <br />
              <span className="italic font-serif-i text-[#ff4500] normal-case tracking-tight">
                my portfolio
              </span>
              <span className="caret" />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-8 max-w-xl font-serif-i italic text-xl sm:text-2xl leading-snug text-[#0a0a0a]"
            >
              An AI that reviews your developer portfolio like a brutal senior
              FAANG engineer. Specific callouts. Zero comfort.{" "}
              <span className="not-italic font-mono text-[#ff4500]">No fluff.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Badge>Android only</Badge>
              <Badge color="#0a0a0a">100% free</Badge>
              <Badge color="#c8a951">Closed testing</Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-10 max-w-xl"
            >
              <WaitlistForm source="hero" />
              <p className="mt-3 text-xs font-mono text-[#6b6358]">
                We email you the Play Store closed-testing invite. No spam. Unsubscribe anytime.
              </p>
            </motion.div>
          </motion.div>

          {/* 3D scene */}
          <div className="lg:col-span-5 relative h-[420px] sm:h-[520px] lg:h-[640px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <HeroScene />
              <div className="noise-overlay" />
            </motion.div>

            {/* floating annotation */}
            <div
              className="absolute bottom-6 left-6 bg-[#0a0a0a] text-[#f5f0e8] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ transform: "rotate(-4deg)" }}
            >
              <span className="text-[#ff4500]">▶</span> live roast preview
            </div>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-5 h-8 border-2 border-[#0a0a0a] rounded-full relative overflow-hidden">
            <span className="scroll-dot block w-1 h-1 bg-[#ff4500] rounded-full absolute top-1.5 left-1/2 -translate-x-1/2" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#6b6358]">
            scroll
          </span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Verdict / stats ---------- */
function Verdict() {
  return (
    <section className="relative bg-[#0a0a0a] text-[#f5f0e8] py-20 sm:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#ff4500] mb-4">
                ▶ THE VERDICT
              </div>
              <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase leading-[0.9]">
                People pay for <br />
                <span className="italic font-serif-i text-[#ff4500]">honesty</span>, not comfort.
              </h2>
              <p className="mt-6 font-serif-i italic text-xl sm:text-2xl text-[#e8d9b0] max-w-xl leading-snug">
                "Your GitHub has 47 repos and zero READMEs. That tells me you don't care about other humans reading your code."
              </p>
              <div className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-[#6b7280]">
                — portfolioroaster, to somebody last tuesday
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-3 gap-4">
            {[
              { n: "5", l: "brutal callouts" },
              { n: "5", l: "exact fixes" },
              { n: "∞", l: "free during beta" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 * i }}
                className="border-2 border-[#f5f0e8] p-5 text-center"
                style={{ boxShadow: "6px 6px 0 0 #ff4500" }}
              >
                <div className="font-display text-5xl sm:text-6xl text-[#ff4500]">
                  {s.n}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa] mt-1">
                  {s.l}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ambient 3D in background */}
      <div className="pointer-events-none absolute -right-20 -top-20 w-[420px] h-[420px] opacity-70">
        <AmbientScene color="#ff4500" />
      </div>
    </section>
  );
}

/* ---------- Features grid with tilt ---------- */
function Features() {
  const items = [
    {
      icon: "🎯",
      tag: "Specific",
      title: "Named, painful callouts.",
      body: "Not 'add more projects'. Things like: 'Your landing page hero uses the word synergy.' Specific enough to screenshot.",
    },
    {
      icon: "🔥",
      tag: "Brutal",
      title: "FAANG-senior tone.",
      body: "Dry humor, zero patience for generic portfolios. The kind of feedback you'd pay ₹5,000 for from a friend you don't have.",
    },
    {
      icon: "🛠️",
      tag: "Actionable",
      title: "Exact fixes, not vibes.",
      body: "Every callout ships with a fix. 'Rename that repo. Rewrite that README. Kill that testimonial.' You leave with a checklist.",
    },
    {
      icon: "📲",
      tag: "Mobile-first",
      title: "Native Android app.",
      body: "Upload your resume PDF, paste your portfolio URL, or link your GitHub — roast lands in seconds. Share the card anywhere.",
    },
    {
      icon: "📸",
      tag: "Shareable",
      title: "Memeable roast cards.",
      body: "Every roast auto-generates a screenshot-worthy card. Post it. Tag it. Laugh at yourself in public for clout.",
    },
    {
      icon: "🆓",
      tag: "Free",
      title: "100% free during beta.",
      body: "No paywall. No credit card. No 'upgrade to see results'. While we're in closed testing — every feature is unlocked.",
    },
  ];

  return (
    <section id="features" className="relative py-24 sm:py-32 paper-grain">
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10">
        <SectionLabel num="01" title="Why get roasted" />

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-display uppercase text-6xl sm:text-7xl lg:text-8xl leading-[0.88] max-w-4xl"
        >
          The feedback <br />
          <span className="italic font-serif-i text-[#ff4500] normal-case">
            nobody will give you
          </span>{" "}
          to your face.
        </motion.h2>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.12 }}
              className="tilt-card relative bg-[#f5f0e8] border-2 border-[#0a0a0a] p-6 hard-shadow"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="text-3xl mb-3">{it.icon}</div>
              <span className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff4500]">
                {it.tag}
              </span>
              <h3 className="font-display text-2xl uppercase leading-tight mb-2">
                {it.title}
              </h3>
              <p className="text-sm text-[#0a0a0a]/80 leading-relaxed">
                {it.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Drop your portfolio",
      d: "Paste a URL, link your GitHub, or upload a PDF resume. Works with anything a recruiter would click.",
    },
    {
      n: "02",
      t: "AI reads every pixel",
      d: "Our roaster parses your projects, commit history, README quality, copy, layout, and tech stack mentions.",
    },
    {
      n: "03",
      t: "Get roasted. Get better.",
      d: "A score out of 10, 5 brutal callouts, 5 exact fixes, and a shareable card. All in under 15 seconds.",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 bg-[#efe7d6] border-y-2 border-[#0a0a0a] overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10">
        <SectionLabel num="02" title="How it works" />

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-display uppercase text-5xl sm:text-6xl leading-[0.9]"
            >
              Three taps.<br />
              <span className="italic font-serif-i text-[#ff4500] normal-case">
                one honest verdict.
              </span>
            </motion.h2>
            <p className="mt-6 font-serif-i italic text-lg text-[#0a0a0a]/80 max-w-md">
              No sign-up gauntlet. No 12-step onboarding. Open the app, paste your thing, read the bad news.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className="group flex gap-6 items-start border-l-4 border-[#0a0a0a] pl-6 py-2 hover:border-[#ff4500] transition-colors"
              >
                <div className="font-display text-6xl sm:text-7xl text-[#ff4500] leading-none shrink-0 group-hover:scale-110 transition-transform origin-left">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-display uppercase text-2xl sm:text-3xl leading-tight">
                    {s.t}
                  </h3>
                  <p className="mt-2 text-[#0a0a0a]/80 max-w-md leading-relaxed">
                    {s.d}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* background 3D */}
      <div className="pointer-events-none absolute -left-32 bottom-0 w-[420px] h-[420px] opacity-50">
        <AmbientScene color="#c8a951" />
      </div>
    </section>
  );
}

/* ---------- Sample roast card (3D tilted preview) ---------- */
function SampleRoast() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1.02, 0.95]);

  return (
    <section ref={ref} className="relative py-24 sm:py-32 paper-grain">
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10">
        <SectionLabel num="03" title="Sample roast" />

        <motion.div
          style={{ rotate, scale }}
          className="mx-auto max-w-3xl bg-[#0a0a0a] text-[#f5f0e8] border-2 border-[#ff4500] p-8 sm:p-12"
          data-testid="sample-roast-card"
        >
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-[#a1a1aa]">
            <span>roast_id: #0042</span>
            <span className="text-[#ff4500]">verified brutality</span>
          </div>

          <div className="mt-8 flex items-end gap-6">
            <div className="font-display text-[10rem] sm:text-[13rem] leading-none text-[#ff4500]">
              3
            </div>
            <div className="pb-6 font-display text-5xl text-[#f5f0e8]/50">/10</div>
          </div>

          <p className="mt-4 font-serif-i italic text-xl sm:text-2xl text-[#e8d9b0] leading-snug max-w-xl">
            "Looks like a portfolio built in a sprint retro nobody invited you to."
          </p>

          <div className="mt-10 grid sm:grid-cols-2 gap-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff4500] mb-3">
                ⚠ CALLOUTS
              </div>
              <ul className="space-y-2 text-sm">
                <li className="border-l-4 border-[#ff4500] pl-3">
                  Your hero says "passionate full-stack dev". So does everyone.
                </li>
                <li className="border-l-4 border-[#ff4500] pl-3">
                  No project has a live demo. Just GitHub links to unfinished code.
                </li>
                <li className="border-l-4 border-[#ff4500] pl-3">
                  Your "About" section is 6 paragraphs. Nobody is reading that.
                </li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#34c759] mb-3">
                ✓ FIXES
              </div>
              <ul className="space-y-2 text-sm">
                <li className="border-l-4 border-[#34c759] pl-3">
                  Rewrite the hero: specific stack, specific outcome, specific number.
                </li>
                <li className="border-l-4 border-[#34c759] pl-3">
                  Deploy your top 3 projects. Vercel takes 90 seconds. No excuse.
                </li>
                <li className="border-l-4 border-[#34c759] pl-3">
                  Kill 5 of those 6 paragraphs. Keep one sentence. Move on.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#f5f0e8]/10 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a1a1aa]">
              shared 1,247× on twitter
            </span>
            <span className="font-display text-[#ff4500] text-xl">PORTFOLIOROASTER</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FAQ() {
  const faqs = [
    {
      q: "Is it really free?",
      a: "Yes — 100% free during closed testing. Every feature is unlocked while we collect feedback. If we ever add a paid tier later, anyone who joined the waitlist keeps free access for the beta period.",
    },
    {
      q: "Why Android only?",
      a: "We shipped Android first because it's fastest to iterate on and our first testers are on Android. iOS is next — put your email in the waitlist and you'll get pinged the moment it's live.",
    },
    {
      q: "How do I get the closed-testing link?",
      a: "Join the waitlist with your email. We approve testers in small batches via Google Play Console. You'll get an email with the opt-in link and install instructions.",
    },
    {
      q: "Is my portfolio data stored?",
      a: "Your roast is saved to your account so you can revisit it. Portfolio content is used only to generate the roast — we don't sell data, we don't train on it, we don't leak it.",
    },
    {
      q: "How brutal is 'brutal'?",
      a: "Brutal as in specific and honest. Not cruel. If your portfolio has a 9/10 shipping product, the roast will say so. If it has 47 repos and zero READMEs, the roast will say that too.",
    },
    {
      q: "Can I roast someone else's portfolio?",
      a: "Technically yes. Morally? That's between you and your group chat. We don't judge.",
    },
  ];

  return (
    <section id="faq" className="py-24 sm:py-32 bg-[#0a0a0a] text-[#f5f0e8]">
      <div className="max-w-4xl mx-auto px-6 sm:px-10">
        <div className="flex items-baseline gap-5 mb-10">
          <div className="font-mono text-sm text-[#a1a1aa]">04</div>
          <div className="flex-1 border-t border-dashed border-[#f5f0e8]/25" />
          <div className="font-display text-2xl sm:text-3xl uppercase">FAQ</div>
        </div>

        <h2 className="font-display uppercase text-5xl sm:text-6xl leading-[0.9] mb-10">
          Asked & <span className="italic font-serif-i text-[#ff4500] normal-case">answered.</span>
        </h2>

        <Accordion type="single" collapsible className="space-y-3" data-testid="faq-accordion">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-2 border-[#f5f0e8]/20 data-[state=open]:border-[#ff4500] bg-[#18181b] px-5"
            >
              <AccordionTrigger className="font-display uppercase text-xl text-left hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="font-serif-i italic text-lg text-[#e8d9b0] leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
function FinalCTA({ count }) {
  return (
    <section className="relative py-28 sm:py-36 paper-grain overflow-hidden">
      <div className="pointer-events-none absolute -right-24 -top-24 w-[500px] h-[500px] opacity-80">
        <AmbientScene color="#ff4500" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <span className="stamp">↗ FINAL WARNING</span>
          <h2 className="mt-8 font-display uppercase text-6xl sm:text-7xl lg:text-8xl leading-[0.85]">
            Stop hiding <br />
            <span className="italic font-serif-i text-[#ff4500] normal-case">
              a bad portfolio.
            </span>
          </h2>
          <p className="mt-6 font-serif-i italic text-xl sm:text-2xl text-[#0a0a0a]/80 max-w-2xl mx-auto leading-snug">
            Get the feedback that actually ships you a job. Join {count ?? "the"} other
            devs waiting to get wrecked (respectfully).
          </p>

          <div className="mt-10 max-w-xl mx-auto">
            <WaitlistForm source="footer" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Badge>Android only</Badge>
            <Badge color="#0a0a0a">100% free</Badge>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-[#f5f0e8] py-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="font-display text-2xl text-[#ff4500]">PORTFOLIOROASTER</div>
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#6b7280] mt-1">
            © {new Date().getFullYear()} — built with spite & coffee
          </div>
        </div>
        <div className="flex gap-6 font-mono text-xs uppercase tracking-[0.2em]">
          <a href="#features" className="hover:text-[#ff4500]" data-testid="footer-features">Features</a>
          <a href="#faq" className="hover:text-[#ff4500]" data-testid="footer-faq">FAQ</a>
          <a href="mailto:hello@portfolioroaster.app" className="hover:text-[#ff4500]" data-testid="footer-contact">Contact</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Landing (root) ---------- */
export default function Landing() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/waitlist/count`);
        setCount(data?.total ?? 0);
      } catch (e) {
        setCount(0);
      }
    })();
  }, []);

  return (
    <div data-testid="landing-page" className="min-h-screen">
      <Marquee />
      <Hero count={count} />
      <Verdict />
      <Features />
      <HowItWorks />
      <SampleRoast />
      <FAQ />
      <FinalCTA count={count} />
      <Footer />
    </div>
  );
}
