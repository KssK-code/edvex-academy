'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './landing.css'

gsap.registerPlugin(ScrollTrigger)

type Lang = 'es' | 'en'

const WA_INFO    = 'https://wa.me/5215612510794?text=Hola,%20quiero%20información%20sobre%20EDVEX%20Academy'
const WA_REGULAR = 'https://wa.me/5215612510794?text=Quiero%20el%20plan%20regular%20de%206%20meses%20de%20EDVEX'
const WA_EXPRESS = 'https://wa.me/5215612510794?text=Quiero%20el%20plan%20express%20de%203%20meses%20de%20EDVEX'

function trackContact() {
  try {
    if (typeof window !== 'undefined') {
      (window as Window & { fbq?: (e: string, n: string) => void }).fbq?.('track', 'Contact')
    }
  } catch { /* silent */ }
}

/* ── SVG ICONS ── */
const IconDevice = () => (
  <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
)
const IconShield = () => (
  <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
)
const IconZap = () => (
  <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
)
const IconAward = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
)
const IconGlobe = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
)
const IconBuilding = () => (
  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
)
const IconCheck = () => (
  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
)
const IconLock = () => (
  <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
)

const LogoSvg = ({ id }: { id: string }) => (
  <svg viewBox="0 0 60 60" fill="none">
    <polygon points="30,3 55,17 55,43 30,57 5,43 5,17" fill="none" stroke={`url(#${id})`} strokeWidth="2.5"/>
    <circle cx="30" cy="30" r="7" fill={`url(#${id})`}/>
    <circle cx="30" cy="30" r="3.5" fill="#080C14"/>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA"/>
        <stop offset="100%" stopColor="#2563EB"/>
      </linearGradient>
    </defs>
  </svg>
)

const WaIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

/* ── DATA ── */
const BENEFITS = [
  {
    Icon: IconDevice,
    es: { title: 'Desde tu celular o PC', desc: 'Estudia cuando quieras, donde quieras. Sin horarios fijos, sin trasladarte.' },
    en: { title: 'From your phone or PC', desc: 'Study whenever you want, wherever you are. No fixed schedules, no commuting.' },
  },
  {
    Icon: IconShield,
    es: { title: 'Sin examen final', desc: 'Nada de exámenes CENEVAL ni trámites complicados. Tu certificado es por actividades completadas.' },
    en: { title: 'No final exam', desc: 'No CENEVAL exams or complicated paperwork. Your certificate is based on completed activities.' },
  },
  {
    Icon: IconZap,
    es: { title: '6 meses o 3 meses Express', desc: 'Elige tu ritmo. Regular en 6 meses o acelera al doble con el plan Express en solo 3 meses.' },
    en: { title: '6 months or 3 months Express', desc: 'Choose your pace. Regular 6-month program or double the speed with Express in just 3 months.' },
  },
  {
    Icon: IconAward,
    es: { title: 'Certificado reconocido', desc: 'Certificado con validez oficial para continuar en universidades de México y Estados Unidos.' },
    en: { title: 'Recognized certificate', desc: 'Certificate with official validity to continue at universities in Mexico and the United States.' },
  },
  {
    Icon: IconGlobe,
    es: { title: 'Mexicanos y Americanos', desc: 'No importa tu ciudadanía — podemos certificarte si eres ciudadano mexicano o americano.' },
    en: { title: 'Mexicans & Americans', desc: 'Regardless of citizenship — we certify Mexican or American citizens.' },
  },
  {
    Icon: IconBuilding,
    es: { title: 'Continúa en la universidad', desc: 'Tu certificado te abre las puertas a universidades en México y USA. El siguiente paso es tuyo.' },
    en: { title: 'Continue at university', desc: 'Your certificate opens doors to universities in Mexico and the USA.' },
  },
]

const QUIEN = [
  { icon: '👷', es: { t: 'Trabajadores', d: 'Que no pueden ir a la escuela por su horario de trabajo.' }, en: { t: 'Workers', d: "Who can't attend school due to their work schedule." } },
  { icon: '👨‍👩‍👧', es: { t: 'Padres de familia', d: 'Que dejaron la prepa y quieren terminarla sin dejar su hogar.' }, en: { t: 'Parents', d: 'Who left school and want to finish without leaving home.' } },
  { icon: '🌎', es: { t: 'Hispanos en USA', d: 'Ciudadanos americanos o residentes que necesitan su diploma.' }, en: { t: 'Hispanics in USA', d: 'American citizens or residents who need their diploma.' } },
  { icon: '🏠', es: { t: 'Zona fronteriza', d: 'Personas en ciudades fronterizas que quieren un certificado binacional.' }, en: { t: 'Border region', d: 'People in border cities who want a binational certificate.' } },
  { icon: '📈', es: { t: 'Quienes buscan ascender', d: 'Que necesitan su prepa para acceder a mejores empleos o la universidad.' }, en: { t: 'Career advancers', d: 'Who need their diploma for better jobs or university access.' } },
  { icon: '⏰', es: { t: 'Los que no tienen tiempo', d: '3 o 6 meses desde tu celular — el tiempo que tengas es suficiente.' }, en: { t: 'Busy people', d: '3 or 6 months from your phone — whatever time you have is enough.' } },
]

const PLAN_FEATURES_REGULAR = [
  { es: '6 meses de acceso completo', en: '6 months full access' },
  { es: 'Estudia a tu ritmo', en: 'Study at your own pace' },
  { es: 'Sin examen final', en: 'No final exam' },
  { es: 'Plataforma bilingüe ES/EN', en: 'Bilingual platform ES/EN' },
  { es: 'Soporte por WhatsApp', en: 'WhatsApp support' },
  { es: 'Certificado válido MX + USA', en: 'Certificate valid MX + USA' },
]
const PLAN_FEATURES_EXPRESS = [
  { es: '3 meses — terminas más rápido', en: '3 months — finish faster' },
  { es: 'Ritmo intensivo pero manejable', en: 'Intensive but manageable pace' },
  { es: 'Sin examen final', en: 'No final exam' },
  { es: 'Plataforma bilingüe ES/EN', en: 'Bilingual platform ES/EN' },
  { es: 'Soporte prioritario por WhatsApp', en: 'Priority WhatsApp support' },
  { es: 'Certificado válido MX + USA', en: 'Certificate valid MX + USA' },
]

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('es')
  const navRef      = useRef<HTMLElement>(null)
  const badgeRef    = useRef<HTMLDivElement>(null)
  const titleRef    = useRef<HTMLHeadingElement>(null)
  const subRef      = useRef<HTMLParagraphElement>(null)
  const btnsRef     = useRef<HTMLDivElement>(null)
  const statsRef    = useRef<HTMLDivElement>(null)
  const benefitsRef = useRef<HTMLDivElement>(null)
  const statsBigRef = useRef<HTMLDivElement>(null)
  const planesRef   = useRef<HTMLDivElement>(null)
  const pasoRef     = useRef<HTMLDivElement>(null)
  const ctaRef      = useRef<HTMLElement>(null)

  /* ── Smooth scroll ── */
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => { document.documentElement.style.scrollBehavior = prev }
  }, [])

  /* ── GSAP animations ── */
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    /* 1. Nav scroll effect */
    const onScroll = () => {
      if (window.scrollY > 20) {
        nav.classList.add('scrolled')
      } else {
        nav.classList.remove('scrolled')
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    /* 2. Hero entrance */
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    if (badgeRef.current) {
      tl.fromTo(badgeRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5 }, 0.2)
    }
    if (titleRef.current) {
      const words = titleRef.current.querySelectorAll('.hw')
      tl.fromTo(words, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.4)
      tl.fromTo(titleRef.current, { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.39)
    }
    if (subRef.current) {
      tl.fromTo(subRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 0.75)
    }
    if (btnsRef.current) {
      tl.fromTo(btnsRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 0.9)
    }
    if (statsRef.current) {
      const items = statsRef.current.querySelectorAll('.hstat')
      tl.fromTo(items, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 }, 1.05)
      tl.fromTo(statsRef.current, { opacity: 0 }, { opacity: 1, duration: 0.01 }, 1.04)
    }

    /* 3. Benefits scroll trigger */
    if (benefitsRef.current) {
      const cards = benefitsRef.current.querySelectorAll('.benefit-card')
      gsap.fromTo(cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: benefitsRef.current, start: 'top 80%' },
        }
      )
    }

    /* 4. Stats counters */
    if (statsBigRef.current) {
      const counters = statsBigRef.current.querySelectorAll('[data-count]')
      counters.forEach(el => {
        const target = parseFloat(el.getAttribute('data-count') || '0')
        const suffix = el.getAttribute('data-suffix') || ''
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = (Number.isInteger(target) ? Math.round(obj.val) : obj.val.toFixed(0)) + suffix
          },
          scrollTrigger: { trigger: statsBigRef.current, start: 'top 80%', once: true },
        })
      })
    }

    /* 5. Pricing cards */
    if (planesRef.current) {
      const cards = planesRef.current.querySelectorAll('.plan-card')
      gsap.fromTo(cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: planesRef.current, start: 'top 80%' },
        }
      )
    }

    /* 6. Steps */
    if (pasoRef.current) {
      const steps = pasoRef.current.querySelectorAll('.step-card')
      gsap.fromTo(steps,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: pasoRef.current, start: 'top 80%' },
        }
      )
    }

    /* 7. CTA */
    if (ctaRef.current) {
      gsap.fromTo(ctaRef.current.querySelectorAll('.cta-title, .cta-sub, .cta-btns, .cta-guarantee'),
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 80%' },
        }
      )
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <div className={`edvex-landing${lang === 'en' ? ' lang-en' : ''}`}>

      {/* ════════ NAV ════════ */}
      <nav ref={navRef}>
        <div className="nav-logo">
          <LogoSvg id="nav-g" />
          <div>
            <div className="nav-logo-text">EDVEX</div>
            <div className="nav-logo-sub">Academy</div>
          </div>
        </div>

        <div className="nav-right">
          <div className="lang-toggle">
            <button className={`lang-btn${lang === 'es' ? ' active' : ''}`} onClick={() => setLang('es')}>ES</button>
            <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
          </div>
          <a href="#planes" className="nav-btn-ghost hide-mobile">
            <span className="es">Ver Planes</span>
            <span className="en">View Plans</span>
          </a>
          <Link href="/login" className="nav-btn-ghost">Ingresar</Link>
          <Link href="/register" className="nav-btn-fill">
            <span className="es">Crear cuenta</span>
            <span className="en">Sign up</span>
          </Link>
        </div>
      </nav>

      {/* ════════ HERO ════════ */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />

        <div ref={badgeRef} className="hero-badge">
          <span className="badge-dot" />
          <span className="es">🎓 Válido en México y USA · 100% Online</span>
          <span className="en">🎓 Valid in Mexico &amp; USA · 100% Online</span>
        </div>

        <h1 ref={titleRef} className="hero-title" style={{ opacity: 0 }}>
          <span className="es" style={{ display: 'block' }}>
            <span className="line-white">
              {'Tu Prepa en'.split(' ').map((w, i) => (
                <span key={i} className="hw" style={{ display: 'inline-block', marginRight: i < 2 ? '0.25em' : 0 }}>{w}</span>
              ))}
            </span>
            <span className="line-blue">
              {'6 meses'.split(' ').map((w, i) => (
                <span key={i} className="hw" style={{ display: 'inline-block', marginRight: i < 1 ? '0.25em' : 0 }}>{w}</span>
              ))}
            </span>
          </span>
          <span className="en" style={{ fontSize: '1em', lineHeight: 1.05 }}>
            <span className="line-white">
              {'Your Diploma in'.split(' ').map((w, i) => (
                <span key={i} className="hw" style={{ display: 'inline-block', marginRight: '0.25em' }}>{w}</span>
              ))}
            </span>
            <span className="line-blue">
              {'6 Months'.split(' ').map((w, i) => (
                <span key={i} className="hw" style={{ display: 'inline-block', marginRight: '0.25em' }}>{w}</span>
              ))}
            </span>
          </span>
        </h1>

        <p ref={subRef} className="hero-sub">
          <span className="es">
            Sin ir a la escuela. Sin examen final. Desde tu celular o PC.<br />
            <strong>Certificado reconocido en universidades de México y USA.</strong>
          </span>
          <span className="en">
            No classroom. No final exam. From your phone or PC.<br />
            <strong>Certificate recognized at universities in Mexico &amp; USA.</strong>
          </span>
        </p>

        <div ref={btnsRef} className="hero-btns">
          <Link href="/register" className="btn-primary">
            <span className="es">Crear cuenta gratis →</span>
            <span className="en">Create free account →</span>
          </Link>
          <a href="#como-funciona" className="btn-ghost">
            <span className="es">Ver cómo funciona</span>
            <span className="en">See how it works</span>
          </a>
        </div>

        <div ref={statsRef} className="hero-stats" style={{ opacity: 0 }}>
          <div className="hstat">
            <span className="hstat-num">6</span>
            <span className="hstat-label"><span className="es">Meses Prepa</span><span className="en">Months Diploma</span></span>
          </div>
          <div className="hstat">
            <span className="hstat-num">3</span>
            <span className="hstat-label"><span className="es">Meses Express</span><span className="en">Months Express</span></span>
          </div>
          <div className="hstat">
            <span className="hstat-num">$150</span>
            <span className="hstat-label">USD / <span className="es">mes</span><span className="en">month</span></span>
          </div>
          <div className="hstat">
            <span className="hstat-num">100%</span>
            <span className="hstat-label"><span className="es">En Línea</span><span className="en">Online</span></span>
          </div>
        </div>
      </section>

      {/* ════════ BENEFITS ════════ */}
      <section className="section benefits-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="tag">
              <span className="es">Por qué EDVEX</span>
              <span className="en">Why EDVEX</span>
            </div>
            <h2 className="sec-title">
              <span className="es">Todo lo que necesitas,<br />nada de lo que no</span>
              <span className="en">Everything you need,<br />nothing you don&apos;t</span>
            </h2>
          </div>

          <div ref={benefitsRef} className="benefits-grid">
            {BENEFITS.map(({ Icon, es, en }, i) => (
              <div className="benefit-card" key={i}>
                <div className="benefit-icon-wrap"><Icon /></div>
                <div className="benefit-title">
                  <span className="es">{es.title}</span>
                  <span className="en">{en.title}</span>
                </div>
                <div className="benefit-desc">
                  <span className="es">{es.desc}</span>
                  <span className="en">{en.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ ANIMATED STATS ════════ */}
      <div className="stats-section">
        <div ref={statsBigRef} className="stats-grid">
          <div className="stat-item">
            <div className="stat-big" data-count="500" data-suffix="+">0+</div>
            <div className="stat-lbl"><span className="es">Alumnos graduados</span><span className="en">Graduated students</span></div>
          </div>
          <div className="stat-item">
            <div className="stat-big" data-count="2" data-suffix="">0</div>
            <div className="stat-lbl"><span className="es">Países reconocidos</span><span className="en">Recognized countries</span></div>
          </div>
          <div className="stat-item">
            <div className="stat-big" data-count="6" data-suffix="">0</div>
            <div className="stat-lbl"><span className="es">Meses de programa</span><span className="en">Program months</span></div>
          </div>
          <div className="stat-item">
            <div className="stat-big" data-count="100" data-suffix="%">0%</div>
            <div className="stat-lbl"><span className="es">En línea siempre</span><span className="en">Always online</span></div>
          </div>
        </div>
      </div>

      {/* ════════ VALIDEZ ════════ */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <div className="tag">
              <span className="es">Validez Oficial</span>
              <span className="en">Official Validity</span>
            </div>
            <h2 className="sec-title">
              <span className="es">Un certificado, <span className="blue">dos países</span></span>
              <span className="en">One certificate, <span className="blue">two countries</span></span>
            </h2>
            <p className="sec-sub">
              <span className="es">Tu certificado de preparatoria tiene reconocimiento oficial tanto en México como en Estados Unidos.</span>
              <span className="en">Your high school diploma has official recognition in both Mexico and the United States.</span>
            </p>
          </div>
          <div className="validez-grid">
            <div className="validez-card mx">
              <div className="validez-flag">🇲🇽</div>
              <div className="validez-title"><span className="es">México</span><span className="en">Mexico</span></div>
              <ul className="validez-items">
                {[
                  { es: 'Convenio con institución educativa oficial', en: 'Agreement with official educational institution' },
                  { es: 'Certificado con validez SEP', en: 'SEP-valid certificate' },
                  { es: 'Acceso a universidades mexicanas', en: 'Access to Mexican universities' },
                  { es: 'Para ciudadanos mexicanos y residentes', en: 'For Mexican citizens and residents' },
                ].map((item, i) => (
                  <li className="validez-item" key={i}>
                    <IconCheck />
                    <span className="es">{item.es}</span>
                    <span className="en">{item.en}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="validez-card usa">
              <div className="validez-flag">🇺🇸</div>
              <div className="validez-title">USA</div>
              <ul className="validez-items">
                {[
                  { es: 'Convenio con Innovative Online Academy', en: 'Agreement with Innovative Online Academy' },
                  { es: 'Reconocido en California y más estados', en: 'Recognized in California and more states' },
                  { es: 'Acceso a universidades americanas', en: 'Access to American universities' },
                  { es: 'Para ciudadanos americanos e hispanos', en: 'For American and Hispanic citizens' },
                ].map((item, i) => (
                  <li className="validez-item" key={i}>
                    <IconCheck />
                    <span className="es">{item.es}</span>
                    <span className="en">{item.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ PLANES ════════ */}
      <section className="section planes-section" id="planes">
        <div className="section-inner">
          <div className="section-header">
            <div className="tag">
              <span className="es">Planes y Precios</span>
              <span className="en">Plans &amp; Pricing</span>
            </div>
            <h2 className="sec-title">
              <span className="es">Elige tu camino</span>
              <span className="en">Choose your path</span>
            </h2>
            <p className="sec-sub">
              <span className="es">Dos programas diseñados para adaptarse a tu ritmo y tu vida.</span>
              <span className="en">Two programs designed to fit your pace and your life.</span>
            </p>
          </div>

          <div ref={planesRef} className="planes-grid">
            {/* Plan Regular */}
            <div className="plan-card regular">
              <div className="plan-type"><span className="es">Programa Regular</span><span className="en">Regular Program</span></div>
              <div className="plan-name"><span className="es">Prepa en 6 Meses</span><span className="en">Diploma in 6 Months</span></div>
              <div className="plan-price">
                <span className="plan-amount">$150</span>
                <span className="plan-period">&nbsp;USD/<span className="es">mes</span><span className="en">month</span></span>
              </div>
              <div className="plan-note">
                <span className="es">+ $50 inscripción · Total: <strong>$950 USD</strong> + $450 titulación</span>
                <span className="en">+ $50 enrollment · Total: <strong>$950 USD</strong> + $450 certification</span>
              </div>
              <div className="plan-divider" />
              <ul className="plan-features">
                {PLAN_FEATURES_REGULAR.map((f, i) => (
                  <li className="plan-feature" key={i}>
                    <IconCheck />
                    <span className="es">{f.es}</span>
                    <span className="en">{f.en}</span>
                  </li>
                ))}
              </ul>
              <a href={WA_REGULAR} target="_blank" rel="noopener noreferrer" className="btn-plan-outline" onClick={trackContact}>
                <span className="es">Empezar ahora →</span>
                <span className="en">Start now →</span>
              </a>
            </div>

            {/* Plan Express */}
            <div className="plan-card express">
              <div className="plan-popular">
                <span className="es">Más popular</span>
                <span className="en">Most popular</span>
              </div>
              <div className="plan-type">⚡ <span className="es">Plan Express</span><span className="en">Express Plan</span></div>
              <div className="plan-name"><span className="es">Prepa en 3 Meses</span><span className="en">Diploma in 3 Months</span></div>
              <div className="plan-price">
                <span className="plan-amount">$300</span>
                <span className="plan-period">&nbsp;USD/<span className="es">mes</span><span className="en">month</span></span>
              </div>
              <div className="plan-note">
                <span className="es">+ $50 inscripción · Total: <strong>$950 USD</strong> + $450 titulación</span>
                <span className="en">+ $50 enrollment · Total: <strong>$950 USD</strong> + $450 certification</span>
              </div>
              <div className="plan-divider" />
              <ul className="plan-features">
                {PLAN_FEATURES_EXPRESS.map((f, i) => (
                  <li className="plan-feature" key={i}>
                    <IconCheck />
                    <span className="es">{f.es}</span>
                    <span className="en">{f.en}</span>
                  </li>
                ))}
              </ul>
              <a href={WA_EXPRESS} target="_blank" rel="noopener noreferrer" className="btn-plan-fill" onClick={trackContact}>
                <span className="es">Empezar Express →</span>
                <span className="en">Start Express →</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ PARA QUIÉN ════════ */}
      <section className="section quien-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="tag">
              <span className="es">¿Es para mí?</span>
              <span className="en">Is this for me?</span>
            </div>
            <h2 className="sec-title">
              <span className="es">Diseñado para personas <span className="blue">como tú</span></span>
              <span className="en">Designed for people <span className="blue">like you</span></span>
            </h2>
          </div>
          <div className="quien-grid">
            {QUIEN.map((q, i) => (
              <div className="quien-card" key={i}>
                <div className="quien-icon-wrap">{q.icon}</div>
                <div className="quien-text">
                  <strong>
                    <span className="es">{q.es.t}</span>
                    <span className="en">{q.en.t}</span>
                  </strong>
                  <span className="es">{q.es.d}</span>
                  <span className="en">{q.en.d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ PROCESO ════════ */}
      <section className="section proceso-section" id="como-funciona">
        <div className="section-inner">
          <div className="section-header">
            <div className="tag">
              <span className="es">Cómo funciona</span>
              <span className="en">How it works</span>
            </div>
            <h2 className="sec-title">
              <span className="es">4 pasos para tu certificado</span>
              <span className="en">4 steps to your certificate</span>
            </h2>
          </div>
          <div ref={pasoRef} className="proceso-grid">
            {[
              {
                n: '01',
                es: { t: 'Te inscribes', d: 'Pago de $50 USD de inscripción y eliges tu plan.' },
                en: { t: 'You enroll', d: 'Pay $50 USD enrollment fee and choose your plan.' },
              },
              {
                n: '02',
                es: { t: 'Accedes a la plataforma', d: 'Tu acceso llega por WhatsApp. Estudia desde cualquier dispositivo.' },
                en: { t: 'Access the platform', d: 'Your access arrives via WhatsApp. Study from any device.' },
              },
              {
                n: '03',
                es: { t: 'Completas las materias', d: 'Sin examen final. Solo completa las actividades de cada materia.' },
                en: { t: 'Complete your courses', d: 'No final exam. Just complete the activities for each subject.' },
              },
              {
                n: '04',
                es: { t: 'Recibes tu certificado', d: 'Titulación por $450 USD. Certificado válido en México y USA.' },
                en: { t: 'Receive your certificate', d: 'Certification for $450 USD. Valid in Mexico and USA.' },
              },
            ].map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-num-wrap">
                  <span className="step-num">{s.n}</span>
                </div>
                <div className="step-title">
                  <span className="es">{s.es.t}</span>
                  <span className="en">{s.en.t}</span>
                </div>
                <div className="step-desc">
                  <span className="es">{s.es.d}</span>
                  <span className="en">{s.en.d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA FINAL ════════ */}
      <section ref={ctaRef} className="cta-section">
        <div className="tag">
          <span className="es">¿Listo para empezar?</span>
          <span className="en">Ready to start?</span>
        </div>
        <h2 className="cta-title">
          <span className="es">Tu prepa te espera.<br />Solo falta el primer paso.</span>
          <span className="en">Your diploma is waiting.<br />Just take the first step.</span>
        </h2>
        <p className="cta-sub">
          <span className="es">Miles de personas en México y USA ya terminaron su prepa con nosotros. En 6 meses —o 3— puedes ser el siguiente.</span>
          <span className="en">Thousands in Mexico and USA already finished with us. In 6 months — or 3 — you could be next.</span>
        </p>
        <div className="cta-btns">
          <a href={WA_INFO} target="_blank" rel="noopener noreferrer" className="btn-wa" onClick={trackContact}>
            <WaIcon />
            <span className="es">Quiero empezar ahora</span>
            <span className="en">I want to start now</span>
          </a>
          <Link href="/register" className="btn-ghost">
            <span className="es">Crear cuenta gratis</span>
            <span className="en">Create free account</span>
          </Link>
        </div>
        <div className="cta-guarantee">
          <IconLock />
          <span className="es">Sin compromisos · Comienza gratis · Soporte por WhatsApp</span>
          <span className="en">No commitment · Start free · WhatsApp support</span>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer>
        <div className="footer-logo">
          <LogoSvg id="footer-g" />
          <span className="footer-brand">EDVEX Academy</span>
        </div>
        <div className="footer-right">
          <div className="footer-links">
            <a href="/login">Ingresar</a>
            <a href="/register"><span className="es">Registrarse</span><span className="en">Sign up</span></a>
            <a href="#planes"><span className="es">Planes</span><span className="en">Plans</span></a>
            <a href={WA_INFO} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
          <div className="footer-copy">
            © {new Date().getFullYear()} EDVEX Academy ·{' '}
            <span className="es">Preparatoria · Secundaria · Diplomados · 100% en línea</span>
            <span className="en">High School · Secondary · Diplomas · 100% online</span>
          </div>
        </div>
      </footer>

      {/* ════════ FLOATING WA ════════ */}
      <a href={WA_INFO} target="_blank" rel="noopener noreferrer" className="wa-float" onClick={trackContact}>
        <svg viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

    </div>
  )
}
