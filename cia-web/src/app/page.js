import Link from 'next/link';

export default function Home() {
    return (
        <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)' }}>
            
            {/* HERO SECTION - COMPACTO E DIRETO */}
            <section className="section" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
                <div className="container hero-container">
                    <div className="hero-content text-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="badge">Instituto Federal do Paraná</div>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', marginBottom: '1.5rem', color: 'var(--text-primary)', fontWeight: 'bold', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                            Controle, Instrumentação Biomédica e <span className="text-gradient">Inteligência Artificial.</span>
                        </h1>
                        <p className="hero-subtitle" style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                            Desenvolvendo o futuro da tecnologia!
                        </p>
                        <div className="hero-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Link href="/projetos" className="btn btn-primary">Explorar Projetos</Link>
                            <Link href="/sobre" className="btn btn-secondary">Conhecer o Grupo</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOBRE PREVIEW - FUNDO DE CONTRASTE (CINZA ULTRA CLARO) */}
            <section className="section" style={{ background: 'var(--bg-surface)', paddingTop: '4rem', paddingBottom: '4rem' }}>
                <div className="container">
                    <div className="about-grid" style={{ alignItems: 'start' }}>
                        
                        {/* AQUI: Removi o position sticky. Agora o texto fica fixo no lugar dele! */}
                        <div className="about-text">
                            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>Pesquisa que transcende a teoria.</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                                O grupo CIA atua na fronteira do conhecimento tecnológico, transformando conceitos complexos de engenharia e automação em soluções tangíveis para a indústria e a sociedade.
                            </p>
                            <Link href="/sobre" className="link-arrow">Descubra nossa história <span>&rarr;</span></Link>
                        </div>
                        
                        <div className="about-stats" style={{ display: 'grid', gap: '1.5rem' }}>
                            {/* Cards brancos sobre fundo cinza = Profundidade elegante */}
                            <div className="stat-card" style={{ background: 'var(--bg-base)' }}>
                                <h3 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>Controle</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sistemas Dinâmicos aplicados no ensino de controle.</p>
                            </div>
                            <div className="stat-card" style={{ background: 'var(--bg-base)' }}>
                                <h3 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>Instrumentação Biomédica</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Instrumentação e Sinais Vitais aplicados a um aprendizado diferente.</p>
                            </div>
                            <div className="stat-card" style={{ background: 'var(--bg-base)' }}>
                                <h3 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>IA</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Machine Learning e entendimento simplificado dos processos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FINAL - VOLTA PARA O FUNDO BRANCO */}
            <section className="section cta-section" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                <div className="container text-center">
                    <div className="cta-box" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Acesse nosso fórum de debates.</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Junte-se à discussão no fórum ou acompanhe nossas publicações.</p>
                        <Link href="/forum" className="btn btn-primary">Acessar Fórum</Link>
                    </div>
                </div>
            </section>
            
        </main>
    );
}