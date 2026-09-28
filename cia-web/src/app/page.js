import Link from 'next/link';
import ResearchLab from './components/ResearchLab';
import Reveal from './components/Reveal';
import './home.css';

const areas = [
  { code: 'C', name: 'Controle', text: 'Sistemas Dinâmicos aplicados no ensino de controle.', type: 'control', tags: 'SISTEMAS / AUTOMAÇÃO' },
  { code: 'I', name: 'Instrumentação Biomédica', text: 'Instrumentação e Sinais Vitais aplicados a um aprendizado diferente.', type: 'bio', tags: 'SINAIS / VIDA' },
  { code: 'A', name: 'Inteligência Artificial', text: 'Machine Learning e entendimento simplificado dos processos.', type: 'ai', tags: 'DADOS / APRENDIZADO' },
];
function Arrow({ diagonal = false }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function AreaGraphic({ type }) {
  return <svg viewBox="0 0 320 128" fill="none" aria-hidden="true" className={`area-graphic ${type}`}>
    {[24, 64, 104].map(y => <path key={y} d={`M0 ${y}H320`} stroke="currentColor" opacity=".1" />)}
    {type === 'control' && <><path d="M0 104H45V24H94V104H144V24H193V104H242V24H294V104H320" stroke="currentColor" opacity=".22" /><path d="M0 104H40C64 104 55 0 84 25S99 104 133 104 148 5 180 26 194 104 226 104 249 8 278 24 294 104 320 104" stroke="currentColor" strokeWidth="2" /><circle cx="180" cy="26" r="5" fill="currentColor" /></>}
    {type === 'bio' && <><path d="M0 68H58L69 56 84 79 103 16 122 111 139 54 151 68H209L220 56 235 79 254 16 273 111 290 54 302 68H320" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="151" cy="68" r="5" fill="currentColor" /></>}
    {type === 'ai' && <>{[28, 64, 100].flatMap((y, i) => [24, 64, 104].map((z, j) => <path key={`${i}-${j}`} d={`M70 ${y} 160 ${z} 250 ${y}`} stroke="currentColor" opacity=".23" />))}{[70, 160, 250].flatMap(x => [24, 64, 104].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="currentColor" opacity={x === 160 ? 1 : .55} />))}</>}
  </svg>;
}
export default function Home() {
  return <main className="cia-home">
    <section className="home-hero container" aria-labelledby="hero-heading">
      <div className="hero-editorial">
        <div className="home-eyebrow"><span className="status-dot" /> Instituto Federal do Paraná <span className="eyebrow-end">/ CIA</span></div>
        <h1 id="hero-heading">Ciência em<br /><span>movimento.</span></h1>
        <p className="hero-discipline">Controle, Instrumentação Biomédica<br className="desktop-break" /> e Inteligência Artificial.</p>
        <p className="hero-tagline">Desenvolvendo o futuro da tecnologia!</p>
        <div className="home-actions"><Link href="/projetos" className="btn btn-primary">Explorar Projetos <Arrow /></Link><Link href="/sobre" className="home-text-link">Conhecer o Grupo <Arrow diagonal /></Link></div>
        <div className="hero-footnote"><span className="tiny-cross">+</span> Pesquisa que conecta conhecimento e possibilidades.</div>
      </div>
      <ResearchLab />
    </section>
    <div className="research-strip"><div className="container"><span>IFPR <b>Campo Largo</b></span><span>Engenharia Elétrica</span><span className="strip-plus">+</span><span>Automação Industrial</span><a href="#pesquisa">Explore nossa pesquisa <span aria-hidden="true">↓</span></a></div></div>
    <section className="research-section container" id="pesquisa" aria-labelledby="research-heading">
      <Reveal className="section-intro"><div><span className="section-index">01 / CONHECIMENTO EM PRÁTICA</span><h2 id="research-heading">Pesquisa que<br />transcende a teoria<span className="accent-period">.</span></h2></div><div className="intro-copy"><p>O grupo CIA atua na fronteira do conhecimento tecnológico, transformando conceitos complexos de engenharia e automação em soluções tangíveis para a indústria e a sociedade.</p><Link href="/sobre" className="home-text-link">Descubra nossa história <Arrow /></Link></div></Reveal>
      <div className="research-cards">{areas.map((area, i) => <Reveal key={area.code} delay={i * 80} className="research-card"><div className="card-top"><span className="area-letter">{area.code}</span><span className="section-index">0{i + 1}</span></div><AreaGraphic type={area.type} /><span className="area-tags">{area.tags}</span><h3>{area.name}</h3><p>{area.text}</p><Link href="/projetos" className="area-link" aria-label={`Explorar projetos de ${area.name}`}>Explorar projetos <Arrow diagonal /></Link></Reveal>)}</div>
    </section>
    <section className="home-community container" aria-labelledby="community-heading"><Reveal className="community-panel"><div className="community-orbits" aria-hidden="true"><span /><span /><span /><b>+</b></div><div className="community-content"><span className="section-index">02 / CONEXÕES QUE GERAM IDEIAS</span><h2 id="community-heading">A próxima descoberta<br />começa com uma conversa.</h2><h3>Acesse nosso fórum de debates.</h3><p>Junte-se à discussão no fórum ou acompanhe nossas publicações.</p><Link href="/forum" className="btn community-button">Acessar Fórum <Arrow diagonal /></Link></div><span className="community-caption">CONHECIMENTO É CONSTRUÇÃO COLETIVA.</span></Reveal></section>
  </main>;
}
