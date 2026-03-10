'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import './landing.css'

type Lang = 'es' | 'en'

const WA_INFO    = 'https://wa.me/5215612510794?text=Hola,%20quiero%20información%20sobre%20EDVEX%20Academy'
const WA_REGULAR = 'https://wa.me/5215612510794?text=Quiero%20el%20plan%20regular%20de%206%20meses%20de%20EDVEX'
const WA_EXPRESS = 'https://wa.me/5215612510794?text=Quiero%20el%20plan%20express%20de%203%20meses%20de%20EDVEX'

function trackContact() {
  try {
    if (typeof window !== 'undefined') {
      (window as Window & { fbq?: (event: string, name: string) => void }).fbq?.('track', 'Contact')
    }
  } catch {
  }
}

const WaIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const LogoSvg = ({ id }: { id: string }) => (
  <svg viewBox="0 0 60 60" fill="none">
    <polygon points="30,3 55,17 55,43 30,57 5,43 5,17" fill="none" stroke={`url(#${id})`} strokeWidth="2.5" />
    <circle cx="30" cy="30" r="7" fill={`url(#${id})`} />
    <circle cx="30" cy="30" r="3.5" fill="#050c18" />
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1ad9ff" />
        <stop offset="100%" stopColor="#0044ee" />
      </linearGradient>
    </defs>
  </svg>
)

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('es')

  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => { document.documentElement.style.scrollBehavior = prev }
  }, [])

  return (
    <div className={`edvex-landing${lang === 'en' ? ' lang-en' : ''}`}>

      {/* ── NAV ── */}
      <nav>
        <div className="nav-logo">
          <LogoSvg id="ng" />
          <div>
            <div className="nav-logo-text">EDVEX</div>
            <div className="nav-logo-sub">Academy</div>
          </div>
        </div>
        <div className="nav-right">
          <div className="lang-toggle">
            <button
              className={`lang-btn${lang === 'es' ? ' active' : ''}`}
              onClick={() => setLang('es')}
            >ES</button>
            <button
              className={`lang-btn${lang === 'en' ? ' active' : ''}`}
              onClick={() => setLang('en')}
            >EN</button>
          </div>
          <a href="#planes" className="btn-ingresar">
            <span className="es">Ver Planes</span>
            <span className="en">View Plans</span>
          </a>
          <Link href="/login" className="btn-ingresar">Ingresar</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />

        <div className="hero-badge">
          <span className="badge-dot" />
          <span className="es">🎓 Válida en México y USA · 100% Online</span>
          <span className="en">🎓 Valid in Mexico &amp; USA · 100% Online</span>
        </div>

        <h1 className="hero-title">
          <span className="es"><span className="grad">Tu Prepa</span><br />en 6 meses</span>
          <span className="en"><span className="grad">Your Diploma</span><br />in 6 months</span>
        </h1>

        <p className="hero-sub">
          <span className="es">
            Sin ir a la escuela. Sin examen final. Desde tu celular o PC.<br />
            <strong>Certificado reconocido en universidades de México y USA.</strong>
          </span>
          <span className="en">
            No classroom. No final exam. From your phone or PC.<br />
            <strong>Certificate recognized at universities in Mexico &amp; USA.</strong>
          </span>
        </p>

        <div className="hero-btns">
          <a href={WA_INFO} target="_blank" rel="noopener noreferrer" className="btn-wa" onClick={trackContact}>
            <WaIcon />
            <span className="es">Quiero Información</span>
            <span className="en">Get Information</span>
          </a>
          <a href="#planes" className="btn-sec">
            <span className="es">Ver Planes y Precios →</span>
            <span className="en">View Plans &amp; Pricing →</span>
          </a>
        </div>

        <div className="flags">
          <div className="flag-pill">
            🇲🇽{' '}
            <span className="es">Ciudadanos Mexicanos</span>
            <span className="en">Mexican Citizens</span>
          </div>
          <span className="flag-sep">+</span>
          <div className="flag-pill">
            🇺🇸{' '}
            <span className="es">Ciudadanos Americanos</span>
            <span className="en">American Citizens</span>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num">6</div>
            <div className="stat-label">
              <span className="es">Meses Prepa</span>
              <span className="en">Months Diploma</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-num">3</div>
            <div className="stat-label">
              <span className="es">Meses Express</span>
              <span className="en">Months Express</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-num">$150</div>
            <div className="stat-label">
              <span className="es">USD / Mes</span>
              <span className="en">USD / Month</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-num">100%</div>
            <div className="stat-label">
              <span className="es">En Línea</span>
              <span className="en">Online</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ── */}
      <section className="benefits">
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="tag-line">
            <span className="es">Por qué EDVEX</span>
            <span className="en">Why EDVEX</span>
          </div>
          <h2 className="sec-title">
            <span className="es">Todo lo que necesitas,<br />nada de lo que no</span>
            <span className="en">Everything you need,<br />nothing you don&apos;t</span>
          </h2>
        </div>

        <div className="benefits-grid">
          {[
            {
              icon: '📱',
              es: { title: 'Desde tu celular o PC', desc: 'Estudia cuando quieras, donde quieras. Sin horarios fijos, sin trasladarte.' },
              en: { title: 'From your phone or PC', desc: 'Study whenever you want, wherever you are. No fixed schedules, no commuting.' },
            },
            {
              icon: '🚫',
              es: { title: 'Sin examen final', desc: 'Nada de exámenes CENEVAL ni trámites complicados. Tu certificado es por actividades completadas.' },
              en: { title: 'No final exam', desc: 'No CENEVAL exams or complicated paperwork. Your certificate is based on completed activities.' },
            },
            {
              icon: '⚡',
              es: { title: '6 meses o 3 meses Express', desc: 'Elige tu ritmo. Programa regular en 6 meses o acelera al doble con el track Express en solo 3 meses.' },
              en: { title: '6 months or 3 months Express', desc: 'Choose your pace. Regular 6-month program or double the speed with Express track in just 3 months.' },
            },
            {
              icon: '🎓',
              es: { title: 'Certificado reconocido', desc: 'Certificado con validez para continuar en universidades de México y Estados Unidos.' },
              en: { title: 'Recognized certificate', desc: 'Certificate valid to continue at universities in Mexico and the United States.' },
            },
            {
              icon: '🇲🇽🇺🇸',
              es: { title: 'Mexicanos y Americanos', desc: 'No importa tu ciudadanía — podemos certificarte si eres ciudadano mexicano o americano.' },
              en: { title: 'Mexicans & Americans', desc: 'Regardless of your citizenship — we can certify you whether you\'re Mexican or American.' },
            },
            {
              icon: '🏛️',
              es: { title: 'Continúa en la universidad', desc: 'Tu certificado te abre las puertas a universidades en México y USA. El siguiente paso es tuyo.' },
              en: { title: 'Continue at university', desc: 'Your certificate opens doors to universities in Mexico and the USA. The next step is yours.' },
            },
          ].map((b, i) => (
            <div className="benefit-card" key={i}>
              <div className="benefit-icon">{b.icon}</div>
              <div className="benefit-title">
                <span className="es">{b.es.title}</span>
                <span className="en">{b.en.title}</span>
              </div>
              <div className="benefit-desc">
                <span className="es">{b.es.desc}</span>
                <span className="en">{b.en.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALIDEZ ── */}
      <section style={{ padding: '90px 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="tag-line">
            <span className="es">Validez Oficial</span>
            <span className="en">Official Validity</span>
          </div>
          <h2 className="sec-title">
            <span className="es">Un certificado,<br />dos países</span>
            <span className="en">One certificate,<br />two countries</span>
          </h2>
          <p className="sec-sub">
            <span className="es">Tu certificado de preparatoria tiene reconocimiento oficial tanto en México como en Estados Unidos.</span>
            <span className="en">Your high school diploma has official recognition in both Mexico and the United States.</span>
          </p>
        </div>

        <div className="validez-grid">
          <div className="validez-card mx">
            <div className="validez-flag">🇲🇽</div>
            <div className="validez-title">
              <span className="es">México</span>
              <span className="en">Mexico</span>
            </div>
            <ul className="validez-items">
              {[
                { es: 'Convenio con institución educativa oficial', en: 'Agreement with official educational institution' },
                { es: 'Certificado con validez SEP', en: 'SEP-valid certificate' },
                { es: 'Acceso a universidades mexicanas', en: 'Access to Mexican universities' },
                { es: 'Para ciudadanos mexicanos y residentes', en: 'For Mexican citizens and residents' },
              ].map((item, i) => (
                <li key={i}>
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
                <li key={i}>
                  <span className="es">{item.es}</span>
                  <span className="en">{item.en}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── PLANES ── */}
      <section className="benefits" id="planes">
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="tag-line">
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

        <div className="planes-grid">
          {/* Plan Regular */}
          <div className="plan-card regular">
            <div className="plan-badge">
              <span className="es">Programa Regular</span>
              <span className="en">Regular Program</span>
            </div>
            <div className="plan-name">
              <span className="es">Prepa en 6 Meses</span>
              <span className="en">Diploma in 6 Months</span>
            </div>
            <div className="plan-price">
              <span className="amount">$150</span>
              <span className="period"> USD/<span className="es">mes</span><span className="en">month</span></span>
            </div>
            <div className="plan-total">
              <span className="es">+ $50 inscripción · Total: <strong>$950 USD</strong> + $450 titulación</span>
              <span className="en">+ $50 enrollment · Total: <strong>$950 USD</strong> + $450 certification</span>
            </div>
            <ul className="plan-features">
              {[
                { es: '6 meses de acceso completo', en: '6 months full access' },
                { es: 'Estudia a tu ritmo', en: 'Study at your own pace' },
                { es: 'Sin examen final', en: 'No final exam' },
                { es: 'Plataforma bilingüe ES/EN', en: 'Bilingual platform ES/EN' },
                { es: 'Soporte por WhatsApp', en: 'WhatsApp support' },
                { es: 'Certificado válido MX + USA', en: 'Certificate valid MX + USA' },
              ].map((f, i) => (
                <li key={i}>
                  <span className="es">{f.es}</span>
                  <span className="en">{f.en}</span>
                </li>
              ))}
            </ul>
            <a href={WA_REGULAR} target="_blank" rel="noopener noreferrer" className="btn-plan outline" onClick={trackContact}>
              <span className="es">Empezar Ahora →</span>
              <span className="en">Start Now →</span>
            </a>
          </div>

          {/* Plan Express */}
          <div className="plan-card express">
            <div className="plan-badge">
              ⚡ <span className="es">Express — Más Popular</span>
              <span className="en">Express — Most Popular</span>
            </div>
            <div className="plan-name">
              <span className="es">Prepa en 3 Meses</span>
              <span className="en">Diploma in 3 Months</span>
            </div>
            <div className="plan-price">
              <span className="amount">$300</span>
              <span className="period"> USD/<span className="es">mes</span><span className="en">month</span></span>
            </div>
            <div className="plan-total">
              <span className="es">+ $50 inscripción · Total: <strong>$950 USD</strong> + $450 titulación</span>
              <span className="en">+ $50 enrollment · Total: <strong>$950 USD</strong> + $450 certification</span>
            </div>
            <ul className="plan-features">
              {[
                { es: '3 meses — terminas más rápido', en: '3 months — finish faster' },
                { es: 'Ritmo intensivo pero manejable', en: 'Intensive but manageable pace' },
                { es: 'Sin examen final', en: 'No final exam' },
                { es: 'Plataforma bilingüe ES/EN', en: 'Bilingual platform ES/EN' },
                { es: 'Soporte prioritario por WhatsApp', en: 'Priority WhatsApp support' },
                { es: 'Certificado válido MX + USA', en: 'Certificate valid MX + USA' },
              ].map((f, i) => (
                <li key={i}>
                  <span className="es">{f.es}</span>
                  <span className="en">{f.en}</span>
                </li>
              ))}
            </ul>
            <a href={WA_EXPRESS} target="_blank" rel="noopener noreferrer" className="btn-plan" onClick={trackContact}>
              <span className="es">Empezar Express →</span>
              <span className="en">Start Express →</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── PARA QUIÉN ── */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="tag-line">
            <span className="es">¿Es para mí?</span>
            <span className="en">Is this for me?</span>
          </div>
          <h2 className="sec-title">
            <span className="es">Diseñado para personas<br />como tú</span>
            <span className="en">Designed for people<br />like you</span>
          </h2>
        </div>

        <div className="quien-grid">
          {[
            { icon: '👷', es: { title: 'Trabajadores', desc: 'Que no pueden ir a la escuela por su horario de trabajo.' }, en: { title: 'Workers', desc: "Who can't attend school due to their work schedule." } },
            { icon: '👨‍👩‍👧', es: { title: 'Padres de familia', desc: 'Que dejaron la prepa y quieren terminarla sin dejar su hogar.' }, en: { title: 'Parents', desc: 'Who left school and want to finish without leaving home.' } },
            { icon: '🌎', es: { title: 'Hispanos en USA', desc: 'Ciudadanos americanos o residentes que necesitan su diploma.' }, en: { title: 'Hispanics in the USA', desc: 'American citizens or residents who need their diploma.' } },
            { icon: '🏠', es: { title: 'Zona fronteriza', desc: 'Personas en ciudades fronterizas que quieren un certificado binacional.' }, en: { title: 'Border region', desc: 'People in border cities who want a binational certificate.' } },
            { icon: '📈', es: { title: 'Quienes buscan ascender', desc: 'Que necesitan su prepa para acceder a mejores empleos o la universidad.' }, en: { title: 'Career advancers', desc: 'Who need their diploma for better jobs or university access.' } },
            { icon: '⏰', es: { title: 'Los que no tienen tiempo', desc: '3 o 6 meses desde tu celular — el tiempo que tengas es suficiente.' }, en: { title: 'Busy people', desc: '3 or 6 months from your phone — whatever time you have is enough.' } },
          ].map((q, i) => (
            <div className="quien-card" key={i}>
              <div className="quien-icon">{q.icon}</div>
              <div className="quien-text">
                <strong>
                  <span className="es">{q.es.title}</span>
                  <span className="en">{q.en.title}</span>
                </strong>
                <span className="es">{q.es.desc}</span>
                <span className="en">{q.en.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section className="proceso">
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="tag-line">
            <span className="es">Cómo funciona</span>
            <span className="en">How it works</span>
          </div>
          <h2 className="sec-title">
            <span className="es">4 pasos para tu certificado</span>
            <span className="en">4 steps to your certificate</span>
          </h2>
        </div>

        <div className="proceso-steps">
          {[
            { num: '1', es: { title: 'Te inscribes', desc: 'Pago de $50 USD de inscripción y eliges tu plan.' }, en: { title: 'You enroll', desc: 'Pay $50 USD enrollment fee and choose your plan.' } },
            { num: '2', es: { title: 'Accedes a la plataforma', desc: 'Tu acceso llega por WhatsApp. Estudia desde cualquier dispositivo.' }, en: { title: 'Access the platform', desc: 'Your access arrives via WhatsApp. Study from any device.' } },
            { num: '3', es: { title: 'Completas las materias', desc: 'Sin examen final. Solo completa las actividades de cada materia.' }, en: { title: 'Complete your courses', desc: 'No final exam. Just complete the activities for each subject.' } },
            { num: '4', es: { title: 'Recibes tu certificado', desc: 'Titulación por $450 USD. Certificado válido en México y USA.' }, en: { title: 'Receive your certificate', desc: 'Certification for $450 USD. Valid in Mexico and USA.' } },
          ].map((s, i) => (
            <div className="step" key={i}>
              <div className="step-num">{s.num}</div>
              <div className="step-title">
                <span className="es">{s.es.title}</span>
                <span className="en">{s.en.title}</span>
              </div>
              <div className="step-desc">
                <span className="es">{s.es.desc}</span>
                <span className="en">{s.en.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="cta-final">
        <div className="tag-line">
          <span className="es">¿Listo para empezar?</span>
          <span className="en">Ready to start?</span>
        </div>
        <h2 className="sec-title">
          <span className="es">Tu prepa te espera.<br />Solo falta el primer paso.</span>
          <span className="en">Your diploma is waiting.<br />Just take the first step.</span>
        </h2>
        <p className="cta-final-sub">
          <span className="es">Miles de personas en México y USA ya terminaron su prepa con nosotros. En 6 meses —o 3— puedes ser el siguiente.</span>
          <span className="en">Thousands of people in Mexico and the USA have already completed their diploma with us. In 6 months — or 3 — you could be next.</span>
        </p>
        <a
          href={WA_INFO}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-wa"
          style={{ display: 'inline-flex', margin: '0 auto' }}
          onClick={trackContact}
        >
          <WaIcon />
          <span className="es">Quiero Empezar Ahora</span>
          <span className="en">I Want to Start Now</span>
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-logo">
          <div style={{ width: 28, height: 28 }}>
            <LogoSvg id="fg" />
          </div>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: '1rem',
            background: 'var(--grad)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>EDVEX Academy</span>
        </div>
        <p className="footer-text">
          edvexacademy.online ·{' '}
          <span className="es">Preparatoria · Secundaria · Diplomados</span>
          <span className="en">High School · Secondary · Diplomas</span>
        </p>
      </footer>

      {/* ── FLOATING WA ── */}
      <a href={WA_INFO} target="_blank" rel="noopener noreferrer" className="wa-float" onClick={trackContact}>
        <svg viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

    </div>
  )
}
