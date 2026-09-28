'use client';
import { useEffect, useRef, useState } from 'react';
const modes = [
  { id: 'control', letter: 'C', name: 'Controle', label: 'Sistemas em equilíbrio', caption: 'Modelar. Compreender. Controlar.', description: 'Uma órbita de pontos representa a relação entre sistemas dinâmicos e equilíbrio.' },
  { id: 'bio', letter: 'I', name: 'Instrumentação', label: 'Sinais que revelam', caption: 'Medir. Interpretar. Transformar.', description: 'Uma hélice de pontos representa a leitura e a interpretação de sinais da vida.' },
  { id: 'ai', letter: 'A', name: 'IA', label: 'Conexões que aprendem', caption: 'Conectar. Aprender. Evoluir.', description: 'Uma esfera de pontos conectados representa uma rede de conhecimento.' },
];
export default function ResearchLab() {
  const [selected, setSelected] = useState(2);
  const [paused, setPaused] = useState(false);
  const canvasRef = useRef(null);
  const panelRef = useRef(null);
  const tabRefs = useRef([]);
  const mode = modes[selected];
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let width = 0, height = 0, frame = 0, phase = .55, last = 0;
    let inView = true, pointerX = 0, pointerY = 0;
    const points = Array.from({ length: 420 }, (_, i) => {
      const y = 1 - (i / 419) * 2;
      const r = Math.sqrt(1 - y * y);
      const angle = i * Math.PI * (3 - Math.sqrt(5));
      if (selected === 0) {
        const a = i / 420 * Math.PI * 2;
        const b = i * 2.399;
        return { x: (0.76 + .23 * Math.cos(b)) * Math.cos(a), y: .23 * Math.sin(b), z: (0.76 + .23 * Math.cos(b)) * Math.sin(a) };
      }
      if (selected === 1) {
        const a = i / 210 * Math.PI * 7;
        return { x: Math.cos(a) * .5, y: y * 1.08, z: Math.sin(a) * .5 };
      }
      return { x: Math.cos(angle) * r, y, z: Math.sin(angle) * r };
    });
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width * .35, height * .4);
      const angle = phase + pointerX * .2;
      const tilt = -.22 + pointerY * .15;
      const projected = points.map(p => {
        const x = p.x * Math.cos(angle) - p.z * Math.sin(angle);
        const z = p.x * Math.sin(angle) + p.z * Math.cos(angle);
        const y = p.y * Math.cos(tilt) - z * Math.sin(tilt);
        const depth = p.y * Math.sin(tilt) + z * Math.cos(tilt);
        const perspective = 3.6 / (3.6 - depth);
        return { x: width / 2 + x * scale * perspective, y: height / 2 + y * scale * perspective, depth, perspective };
      });
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const q = projected[(i + (selected === 2 ? 13 : 2)) % projected.length];
        if (Math.hypot(p.x - q.x, p.y - q.y) < scale * .34 && p.depth > -.4) {
          ctx.strokeStyle = `rgba(14,110,103,${.06 + (p.depth + 1) * .055})`;
          ctx.lineWidth = .65;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      projected.sort((a, b) => a.depth - b.depth).forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, (p.depth > .5 ? 2 : 1.25) * p.perspective, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(8,99,94,${.2 + (p.depth + 1) * .36})`;
        ctx.fill();
      });
    };
    const canAnimate = () => !paused && !preference.matches && inView && !document.hidden;
    const tick = time => {
      if (!canAnimate()) { frame = 0; return; }
      phase += Math.min((time - (last || time)) / 1000, .04) * .13;
      last = time; draw(); frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame); frame = 0; last = 0; draw();
      if (canAnimate()) frame = requestAnimationFrame(tick);
    };
    const resize = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); sync();
    });
    resize.observe(canvas);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    observer.observe(canvas);
    const move = e => {
      if (!finePointer.matches || preference.matches || paused) return;
      const rect = canvas.getBoundingClientRect();
      pointerX = (e.clientX - rect.left) / rect.width - .5;
      pointerY = (e.clientY - rect.top) / rect.height - .5;
    };
    const reset = () => { pointerX = 0; pointerY = 0; };
    const panel = panelRef.current;
    panel.addEventListener('pointermove', move); panel.addEventListener('pointerleave', reset);
    document.addEventListener('visibilitychange', sync); preference.addEventListener('change', sync);
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      panel.removeEventListener('pointermove', move); panel.removeEventListener('pointerleave', reset);
      document.removeEventListener('visibilitychange', sync); preference.removeEventListener('change', sync);
    };
  }, [selected, paused]);
  function handleKey(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % 3;
    else if (event.key === 'ArrowLeft') next = (index + 2) % 3;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 2;
    else return;
    event.preventDefault(); setSelected(next); tabRefs.current[next]?.focus();
  }
  return <div className="research-lab" ref={panelRef}>
    <div className="lab-toolbar"><span><span className="status-dot" /> CIA / EXPLORADOR DE PESQUISA</span><button type="button" className="lab-pause" aria-label={paused ? 'Retomar animação' : 'Pausar animação'} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 7 5-7 5Z" fill="currentColor" /></svg> : <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="2" /></svg>}</button></div>
    <div className="lab-visual"><div className="lab-grid" /><span className="lab-axis axis-top">Y</span><span className="lab-axis axis-right">X</span><div className="lab-orbit" /><canvas ref={canvasRef} aria-hidden="true" /><span className="lab-coordinate">C + I + A</span><span className="lab-marker">+</span></div>
    <div className="lab-tabs" role="tablist" aria-label="Explore as áreas de pesquisa">{modes.map((item, index) => <button key={item.id} ref={node => { tabRefs.current[index] = node; }} type="button" role="tab" id={`lab-tab-${item.id}`} aria-selected={selected === index} aria-controls="lab-panel" tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={e => handleKey(e, index)}><span>{item.letter}</span>{item.name}</button>)}</div>
    <div id="lab-panel" role="tabpanel" aria-labelledby={`lab-tab-${mode.id}`} className="lab-information" tabIndex={0}><div><span className="lab-kicker">{mode.caption}</span><h2>{mode.label}</h2></div><span className="lab-index">0{selected + 1}<span> / 03</span></span><p className="sr-only">{mode.description} Visualização conceitual, sem dados de medição.</p></div>
    <div className="lab-bottom"><span>VISUALIZAÇÃO CONCEITUAL</span><span>SELECIONE UMA ÁREA <span aria-hidden="true">↗</span></span></div>
  </div>;
}
