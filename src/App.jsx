import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Stars, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Volume2, VolumeX, Sparkles as SparkleIcon, Heart, Flame, Gift, ArrowDown } from 'lucide-react';

// Keep the greeting UI usable even on browsers/devices where WebGL is unavailable.
class SceneErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.warn('3D scene unavailable; showing the greeting without WebGL.', error); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Flame3D() {
  const flame = useRef();
  const glow = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (flame.current) {
      flame.current.scale.set(1 + Math.sin(t * 5) * .055, 1 + Math.sin(t * 7) * .09, 1);
      flame.current.rotation.z = Math.sin(t * 3) * .07;
    }
    if (glow.current) glow.current.material.opacity = .25 + (Math.sin(t * 4) + 1) * .09;
  });
  return (
    <group position={[0, .65, 0]}>
      <mesh ref={glow} position={[0, .28, -.18]}>
        <circleGeometry args={[1.25, 48]} />
        <meshBasicMaterial color="#ff9d35" transparent opacity={.35} />
      </mesh>
      <mesh ref={flame} position={[0, .3, .08]}>
        <sphereGeometry args={[.34, 32, 32]} />
        <meshStandardMaterial color="#ffb13b" emissive="#ff641f" emissiveIntensity={2.6} roughness={.25} />
      </mesh>
      <mesh position={[0, .35, .13]} scale={[.17, .27, .17]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#fff5bd" />
      </mesh>
      <pointLight position={[0, .7, .7]} color="#ff9b31" intensity={4.5} distance={6} />
    </group>
  );
}

function Diya() {
  const bowl = useRef();
  useFrame(({ clock }) => {
    if (bowl.current) bowl.current.rotation.y = Math.sin(clock.elapsedTime * .35) * .08;
  });
  return (
    <group ref={bowl}>
      <mesh position={[0, -.12, 0]} rotation={[Math.PI, 0, 0]} scale={[1.18, .52, .85]}>
        <sphereGeometry args={[.8, 64, 32, 0, Math.PI * 2, 0, Math.PI * .58]} />
        <meshStandardMaterial color="#b95a2d" metalness={.72} roughness={.22} />
      </mesh>
      <mesh position={[0, -.08, 0]} scale={[1.12, .16, .82]}>
        <torusGeometry args={[.72, .065, 16, 64]} />
        <meshStandardMaterial color="#ffcf78" metalness={.8} roughness={.2} />
      </mesh>
      <mesh position={[0, -.42, 0]} scale={[.78, .16, .62]}>
        <sphereGeometry args={[.8, 32, 16]} />
        <meshStandardMaterial color="#73351f" metalness={.45} roughness={.34} />
      </mesh>
      <Flame3D />
    </group>
  );
}

function FloatingDiya({ position, scale = 1 }) {
  return <group position={position} scale={scale}><Float speed={1.2} rotationIntensity={.12} floatIntensity={.22}><Diya /></Float></group>;
}

function Mandala({ position = [0, 0, -2], scale = 1 }) {
  const ref = useRef();
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * .035; });
  const petals = useMemo(() => Array.from({ length: 12 }, (_, i) => i * Math.PI / 6), []);
  return (
    <group ref={ref} position={position} scale={scale}>
      {petals.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0]} rotation={[0, 0, a]}>
          <circleGeometry args={[.42, 32]} />
          <meshBasicMaterial color={i % 2 ? '#d88d42' : '#f4c36e'} transparent opacity={.14} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh><ringGeometry args={[1.75, 1.79, 96]} /><meshBasicMaterial color="#f4c36e" transparent opacity={.25} /></mesh>
      <mesh><ringGeometry args={[.68, .72, 96]} /><meshBasicMaterial color="#f4c36e" transparent opacity={.24} /></mesh>
    </group>
  );
}

function Scene() {
  const reduced = useReducedMotion();
  return (
    <>
      <color attach="background" args={['#10091d']} />
      <fog attach="fog" args={['#10091d', 8, 24]} />
      <ambientLight intensity={1.1} />
      <Stars radius={35} depth={28} count={reduced ? 350 : 1400} factor={2.2} saturation={.35} fade speed={.35} />
      <Sparkles count={reduced ? 20 : 90} scale={[13, 8, 6]} size={2.4} speed={.25} color="#ffd58d" />
      <Mandala position={[-4.6, 1.8, -3]} scale={1.2} />
      <Mandala position={[4.7, -1.3, -4]} scale={1.55} />
      <FloatingDiya position={[0, -.65, 0]} scale={1.45} />
      <FloatingDiya position={[-3.3, -2.3, -1.3]} scale={.55} />
      <FloatingDiya position={[3.45, -2.1, -1.5]} scale={.5} />
    </>
  );
}

function Fireworks({ active }) {
  const particles = useMemo(() => Array.from({ length: 100 }, (_, i) => ({
    x: (Math.random() - .5) * 12,
    y: (Math.random() - .5) * 7,
    delay: Math.random() * 2,
    color: ['#ffc46b', '#f57d57', '#f5d89b', '#d99bfa'][i % 4]
  })), []);
  return <AnimatePresence>{active && particles.map((p, i) => (
    <motion.i key={i} className="firework-dot" style={{ left: `calc(50% + ${p.x}vw)`, top: `calc(50% + ${p.y}vh)`, background: p.color }}
      initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [0, -30, 55] }}
      transition={{ duration: 1.9, delay: p.delay * .3, repeat: 1 }} />
  ))}</AnimatePresence>;
}

export default function App() {
  const [sound, setSound] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const audioRef = useRef(null);
  const reduced = useReducedMotion();
  const greeting = 'May your home glow with happiness, your heart shine with peace, and every new beginning sparkle with endless possibilities. Wishing you and your loved ones a beautiful and prosperous Diwali!';

  const toggleSound = async () => {
    if (sound) {
      const audio = audioRef.current;
      if (audio) {
        const now = audio.context.currentTime;
        audio.master.gain.cancelScheduledValues(now);
        audio.master.gain.setTargetAtTime(0, now, .25);
        window.setTimeout(() => {
          audio.oscillators.forEach(osc => { try { osc.stop(); } catch {} });
          audio.context.close();
        }, 900);
        audioRef.current = null;
      }
      setSound(false);
      return;
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      await context.resume();
      const master = context.createGain();
      master.gain.setValueAtTime(0, context.currentTime);
      master.gain.setTargetAtTime(.035, context.currentTime, .8);
      master.connect(context.destination);
      const oscillators = [174.61, 261.63, 349.23].map((frequency, index) => {
        const oscillator = context.createOscillator();
        const voice = context.createGain();
        oscillator.type = index === 0 ? 'sine' : 'triangle';
        oscillator.frequency.value = frequency;
        voice.gain.value = index === 0 ? .42 : .16;
        oscillator.connect(voice); voice.connect(master); oscillator.start();
        return oscillator;
      });
      audioRef.current = { context, master, oscillators };
      setSound(true);
    } catch (error) { console.warn('Audio could not be started.', error); }
  };

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) { audio.oscillators.forEach(osc => { try { osc.stop(); } catch {} }); audio.context.close(); audioRef.current = null; }
  }, []);

  return (
    <main className="page-shell">
      <div className="canvas-layer" aria-hidden="true">
        <SceneErrorBoundary>
          <Canvas
            camera={{ position: [0, 0, 9], fov: 45 }}
            dpr={[1, 1.25]}
            gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
            fallback={null}
          >
            <Scene />
          </Canvas>
        </SceneErrorBoundary>
      </div>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="petal-field" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} className="drifting-petal" style={{ "--i": i, "--x": ((i * 37) % 100) + "%", "--delay": ((i % 9) * -2.3) + "s", "--duration": (15 + (i % 6) * 2) + "s" }} />)}</div>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Deepavali home"><span className="brand-mark">✺</span><span>DEEP<span className="brand-gold">AVALI</span></span></a>
        <div className="topbar-right"><span className="edition"><span className="live-dot" /> A FESTIVAL OF LIGHTS</span><button className="sound-button" onClick={toggleSound} aria-label={sound ? 'Turn sound off' : 'Turn sound on'}>{sound ? <Volume2 size={16}/> : <VolumeX size={16}/>}<span>{sound ? 'Sound on' : 'Sound off'}</span></button></div>
      </header>

      <section className="hero">
        <motion.div className="eyebrow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
          <span className="eyebrow-line" /> THE NIGHT IS MADE OF LIGHT <span className="eyebrow-line" />
        </motion.div>
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: .15 }}>
          <p className="pre-title">A little light. A lot of love.</p>
          <h1>Shubh <span className="title-script">Deepavali</span><span className="title-period">.</span></h1>
          <p className="hero-description">May the festival of lights illuminate your life<br className="desktop-break"/> with joy, prosperity & beautiful beginnings.</p>
        </motion.div>
        <motion.div className="diya-caption" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }}>
          <span className="caption-rule" /><span>LET YOUR INNER LIGHT SHINE</span><span className="caption-rule" />
        </motion.div>
        <motion.button className="wish-button" whileHover={{ scale: 1.045 }} whileTap={{ scale: .97 }} onClick={() => setRevealed(true)}>
          <SparkleIcon size={17} strokeWidth={1.7}/><span>Open your festive wish</span><span className="button-arrow">↗</span>
        </motion.button>
        <motion.div className="scroll-cue" animate={reduced ? {} : { y: [0, 7, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ArrowDown size={14}/><span>SCROLL TO FEEL THE MAGIC</span>
        </motion.div>
      </section>

      <section className="blessing-section">
        <div className="section-kicker"><span>01</span><span className="kicker-line" /> A WISH FROM THE HEART</div>
        <div className="blessing-grid">
          <div className="blessing-heading"><span className="tiny-lotus">❋</span><h2>Let light find<br/><em>its way to you.</em></h2></div>
          <div className="blessing-copy"><p>Some festivals are celebrated. Some are felt. Diwali is both — a reminder that even the smallest flame can brighten the darkest night.</p><p>May this season bring warmth to your home, calm to your mind, courage to your dreams, and people who make every moment golden.</p><div className="signature"><span className="signature-line"/><span>With warmth & light</span></div></div>
        </div>
      </section>

      <section className="virtues-section">
        <div className="section-kicker"><span>02</span><span className="kicker-line" /> MAY YOUR DAYS BE FILLED WITH</div>
        <div className="virtues-grid">
          <motion.article className="virtue-card" whileHover={{ y: -7 }}><span className="virtue-icon"><Flame size={20}/></span><span className="virtue-number">01 / LIGHT</span><h3>New beginnings</h3><p>May every sunrise bring a reason to hope and every diya remind you of your strength.</p></motion.article>
          <motion.article className="virtue-card" whileHover={{ y: -7 }}><span className="virtue-icon"><Heart size={20}/></span><span className="virtue-number">02 / LOVE</span><h3>Endless togetherness</h3><p>May your celebrations be surrounded by love, laughter, and the people who matter most.</p></motion.article>
          <motion.article className="virtue-card" whileHover={{ y: -7 }}><span className="virtue-icon"><Gift size={20}/></span><span className="virtue-number">03 / ABUNDANCE</span><h3>Dreams that bloom</h3><p>May prosperity find your doorstep and may your hard work turn into beautiful success.</p></motion.article>
        </div>
      </section>

      <section className="finale-section">
        <div className="finale-glow"/>
        <span className="finale-ornament">✺</span>
        <p className="finale-overline">FROM OUR HEARTS TO YOURS</p>
        <h2>Light up the world<br/><em>by being you.</em></h2>
        <p className="finale-sub">Wishing you a Diwali that's as wonderful as you are.</p>
        <div className="finale-blessing"><span>🪔</span><span>May your life always be full of light.</span><span>🪔</span></div>
        <span className="finale-sparkle">✧　✦　✧</span>
      </section>

      <footer className="footer"><a className="brand footer-brand" href="#"><span className="brand-mark">✺</span><span>DEEP<span className="brand-gold">AVALI</span></span></a><span>MADE WITH <span className="heart">♥</span> & A LITTLE BIT OF MAGIC</span><span className="footer-year">HAPPY DIWALI · 2026</span></footer>

      <AnimatePresence>
        {revealed && <motion.div className="wish-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="wish-modal" initial={{ y: 35, scale: .94 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .96 }} transition={{ type: 'spring', damping: 22 }}>
            <button className="modal-close" onClick={() => setRevealed(false)} aria-label="Close">×</button>
            <span className="modal-lamp">🪔</span><span className="modal-kicker">A WISH JUST FOR YOU</span>
            <h2>Happy <em>Diwali!</em></h2>
            <p>{greeting}</p>
            <div className="modal-divider">✦ ✧ ✦</div>
            <button className="share-button modal-share" onClick={() => setRevealed(false)}>Let the light spread <span aria-hidden="true">✦</span></button>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
      <Fireworks active={revealed} />
    </main>
  );
}
