import Link from 'next/link';

export default function Home() {
    return (
        <main style={{ paddingTop: '80px' }}>
            {/* HERO SECTION */}
            <section className="hero section">
                <div className="container hero-container">
                    <div className="hero-content text-center">
                        <div className="badge">Instituto Federal do Paraná</div>
                        <h1 className="hero-title">Controle, Instrumentação Biomédica e <span className="text-gradient">Inteligência Artificial.</span></h1>
                        <p className="hero-subtitle">Desenvolvendo o futuro da tecnologia!</p>
                        <div className="hero-actions" style={{ justifyContent: 'center' }}>
                            <Link href="/projetos" className="btn btn-primary">Explorar Projetos</Link>
                            <Link href="/sobre" className="btn btn-secondary">Conhecer o Grupo</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOBRE PREVIEW */}
            <section className="section about-preview">
                <div className="container">
                    <div className="about-grid">
                        <div className="about-text">
                            <h2 className="section-title">Pesquisa que transcende a teoria.</h2>
                            <p>O grupo CIA atua na fronteira do conhecimento tecnológico, transformando conceitos complexos de engenharia e automação em soluções tangíveis para a indústria e a sociedade.</p>
                            <Link href="/sobre" className="link-arrow">Descubra nossa história <span>&rarr;</span></Link>
                        </div>
                        <div className="about-stats">
                            <div className="stat-card">
                                <h3>Controle</h3>
                                <p>Sistemas Dinâmicos aplicados no ensino de controle.</p>
                            </div>
                            <div className="stat-card">
                                <h3>Instrumentação Biomedica</h3>
                                <p>Instrumentação e Sinais Vitais aplicados a um aprendizado diferente.</p>
                            </div>
                            <div className="stat-card">
                                <h3>IA</h3>
                                <p>Machine Learning e entendimento simplificado dos processos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="section cta-section">
                <div className="container text-center">
                    <div className="cta-box">
                        <h2 className="section-title">Acesse nosso fórum  de debates.</h2>
                        <p className="section-subtitle">Junte-se à discussão no fórum ou acompanhe nossas publicações.</p>
                        <Link href="/forum" className="btn btn-primary">Acessar Fórum</Link>
                    </div>
                </div>
            </section>
        </main>
    );
}