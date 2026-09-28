import Link from 'next/link';
import '../inner-pages.css';

function ResearchDiagram() {
    return (
        <div className="ip-research-diagram" aria-hidden="true">
            <div className="ip-diagram-top"><span>SISTEMAS EM CONEXÃO</span><span>FIG. 01</span></div>
            <svg viewBox="0 0 480 400" fill="none">
                <g className="ip-diagram-grid" stroke="currentColor" strokeWidth="0.6">
                    <path d="M0 80H480M0 160H480M0 240H480M0 320H480M80 0V400M160 0V400M240 0V400M320 0V400M400 0V400" />
                    <circle cx="240" cy="204" r="158" strokeDasharray="3 7" />
                    <path d="M240 24V384M60 204H420" />
                </g>
                <g className="ip-diagram-rings" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="195" cy="177" r="89" />
                    <circle cx="285" cy="177" r="89" />
                    <circle cx="240" cy="255" r="89" />
                </g>
                <path d="M152 130L329 130L240 284L152 130Z" stroke="currentColor" strokeDasharray="4 5" opacity="0.45" />
                <g className="ip-diagram-nodes" fill="currentColor">
                    <circle cx="152" cy="130" r="5" /><circle cx="329" cy="130" r="5" /><circle cx="240" cy="284" r="5" />
                    <circle className="ip-diagram-core" cx="240" cy="204" r="7" />
                </g>
                <g fill="currentColor" fontSize="10" fontFamily="monospace" letterSpacing="1">
                    <text x="122" y="114">CONTROLE</text><text x="317" y="114">IA</text><text x="180" y="307">INSTRUMENTAÇÃO</text>
                </g>
            </svg>
            <div className="ip-diagram-bottom"><span className="ip-status-dot" /> Ciência que conecta possibilidades.</div>
        </div>
    );
}

export default function SobrePage() {
    return (
        <main className="ip-page">
            <section className="ip-shell ip-about-hero">
                <div className="ip-hero-copy">
                    <p className="ip-eyebrow"><span /> Nossa Identidade</p>
                    <h1>Sobre o<br /><span>Grupo CIA.</span></h1>
                    <p className="ip-lead">Inovação, pesquisa rigorosa e tecnologia de ponta aplicadas ao desenvolvimento do futuro.</p>
                    <a href="#nossa-essencia" className="ip-text-link">Conheça nossa essência <span aria-hidden="true">↓</span></a>
                </div>
                <ResearchDiagram />
            </section>

            <section id="nossa-essencia" className="ip-shell ip-authority">
                <div className="ip-section-label"><span>01 / QUEM SOMOS</span><span className="ip-label-line" /></div>
                <div className="ip-authority-content">
                    <h2>Autoridade em<br /><span>Pesquisa Científica.</span></h2>
                    <p>O Grupo CIA (Controle, Instrumentação Biomédica e Inteligência Artificial) é um núcleo de excelência sediado no Instituto Federal do Paraná, no Campus Campo Largo. Atuamos no desenvolvimento de sistemas complexos que unem os conhecimentos dos cursos de Automação Industrial e Engenharia Elétrica, para a solução de problemas.</p>
                </div>
                <div className="ip-campus">
                    <div className="ip-campus-mark" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
                    <div className="ip-campus-location"><p className="ip-micro">NOSSO PONTO DE PARTIDA</p><h3>IFPR Campo Largo</h3><p>Sede de Inovação Regional</p></div>
                    <div className="ip-campus-field"><h3>CIA</h3><p>Controle, Instrumentação Biomédica e Inteligência Artificial.</p></div>
                    <span className="ip-campus-arrow" aria-hidden="true">↗</span>
                </div>
            </section>

            <section className="ip-principles">
                <div className="ip-shell">
                    <div className="ip-section-label"><span>02 / O QUE NOS MOVE</span><span className="ip-label-line" /></div>
                    <div className="ip-principles-heading"><h2>Uma base sólida.<br /><span>Um futuro aberto.</span></h2><p>Os princípios que orientam nossa pesquisa.</p></div>
                    <div className="ip-principle-grid">
                        <article className="ip-principle"><div className="ip-card-meta"><span>01</span><span>Objetivo</span></div><div className="ip-principle-symbol ip-symbol-mission" aria-hidden="true"><i /><i /><i /></div><h3>Missão</h3><p>Promover o desenvolvimento tecnológico através da pesquisa científica.</p></article>
                        <article className="ip-principle"><div className="ip-card-meta"><span>02</span><span>Futuro</span></div><div className="ip-principle-symbol ip-symbol-vision" aria-hidden="true"><i /><i /><i /></div><h3>Visão</h3><p>Ser um grupo de referência em processos que envolvam controle, instrumentação biomédica e IA.</p></article>
                        <article className="ip-principle"><div className="ip-card-meta"><span>03</span><span>Cultura</span></div><div className="ip-principle-symbol ip-symbol-values" aria-hidden="true"><i /><i /><i /></div><h3>Valores</h3><p>Ética profissional, rigor científico e pensamento disruptivo.</p></article>
                    </div>
                </div>
            </section>

            <section className="ip-shell ip-quote-section">
                <span className="ip-quote-mark" aria-hidden="true">“</span>
                <blockquote>“Transformamos a complexidade das coisas em <span>soluções que impactam a vida e a indústria.</span>”</blockquote>
                <Link href="/projetos" className="ip-text-link">Explore nossos projetos <span aria-hidden="true">↗</span></Link>
            </section>
        </main>
    );
}
