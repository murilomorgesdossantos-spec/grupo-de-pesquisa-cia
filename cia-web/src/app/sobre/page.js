export default function SobrePage() {
    return (
        <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)' }}>
            {/* HERO SECTION - SOBRE COMPACTO */}
            <section className="section" style={{ paddingTop: '4rem', paddingBottom: '1rem' }}>
                <div className="container hero-container">
                    <div className="hero-content text-center">
                        <div className="badge">Nossa Identidade</div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                            Sobre o <span className="text-gradient">Grupo CIA.</span>
                        </h1>
                        <p className="hero-subtitle" style={{ margin: '0 auto', maxWidth: '600px' }}>
                            Inovação, pesquisa rigorosa e tecnologia de ponta aplicadas ao desenvolvimento do futuro.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECÇÃO: AUTORIDADE */}
            <section className="section" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                <div className="container">
                    <div className="about-grid">
                        <div className="about-text">
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Autoridade em Pesquisa Científica.</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                O Grupo CIA (Controle, Instrumentação Biomédica e Inteligência Artificial) é um núcleo de excelência sediado no Instituto Federal do Paraná, no Campus Campo Largo. Atuamos no desenvolvimento de sistemas complexos que unem os conhecimentos dos cursos de Automação Industrial e Engenharia Elétrica, para a solução de problemas.
                            </p>
                        </div>
                        <div className="about-stats">
                            <div className="stat-card">
                                <h3 style={{ color: 'var(--text-primary)' }}>IFPR Campo Largo</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Sede de Inovação Regional</p>
                            </div>
                            <div className="stat-card">
                                <h3 style={{ color: 'var(--accent)' }}>CIA</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Controle, Instrumentação Biomédica e Inteligência Artificial.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECÇÃO: MISSÃO, VISÃO E VALORES */}
            {/* Usando o bg-surface para criar contraste entre a seção e os cards brancos */}
            <section className="section" style={{ background: 'var(--bg-surface)', paddingTop: '4rem', paddingBottom: '4rem' }}>
                <div className="container">
                    <div className="about-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="stat-card" style={{ background: 'var(--bg-base)' }}>
                            <span className="badge" style={{ marginBottom: '1rem' }}>Objetivo</span>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Missão</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Promover o desenvolvimento tecnológico através da pesquisa científica.</p>
                        </div>
                        
                        <div className="stat-card" style={{ background: 'var(--bg-base)' }}>
                            <span className="badge" style={{ marginBottom: '1rem' }}>Futuro</span>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Visão</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Ser um grupo de referência em processos que envolvam controle, instrumentação biomédica e IA.</p>
                        </div>
                        
                        <div className="stat-card" style={{ background: 'var(--bg-base)' }}>
                            <span className="badge" style={{ marginBottom: '1rem' }}>Cultura</span>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Valores</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Ética profissional, rigor científico e pensamento disruptivo.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* SECÇÃO DE CITAÇÃO (QUOTE) */}
            <section className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
                <div className="container text-center">
                    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', maxWidth: '900px', margin: '0 auto', lineHeight: 1.3, color: 'var(--text-primary)' }}>
                        "Transformamos a complexidade das coisas em <span className="text-gradient">soluções que impactam a vida e a indústria.</span>"
                    </h2>
                </div>
            </section>
        </main>
    );
}