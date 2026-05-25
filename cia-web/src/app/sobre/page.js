export default function SobrePage() {
    return (
        <main style={{ paddingTop: '80px' }}>
            {/* HERO SECTION - SOBRE */}
            <section className="hero section" style={{ minHeight: '60vh' }}>
                <div className="container hero-container">
                    <div className="hero-content text-center">
                        <div className="badge">Nossa Identidade</div>
                        <h1 className="hero-title">Sobre o <span className="text-gradient">Grupo CIA.</span></h1>
                        <p className="hero-subtitle">Inovação, pesquisa rigorosa e tecnologia de ponta aplicadas ao desenvolvimento do futuro.</p>
                    </div>
                </div>
            </section>

            {/* SECÇÃO: AUTORIDADE */}
            <section className="section">
                <div className="container">
                    <div className="about-grid">
                        <div className="about-text">
                            <h2 className="section-title">Autoridade em Pesquisa Científica.</h2>
                            <p>O Grupo CIA (Controle, Instrumentação Biomédica e Inteligência Artificial) é um núcleo de excelência sediado no Instituto Federal do Paraná, no Campus Campo Largo. Atuamos no desenvolvimento de sistemas complexos que unem os conhecimentos dos cursos de Automação Industrial e Engenharia Elétrica, para a solução de problemas.</p>
                        </div>
                        <div className="about-stats">
                            <div className="stat-card">
                                <h3>IFPR Campo Largo</h3>
                                <p>Sede de Inovação Regional</p>
                            </div>
                            <div className="stat-card">
                                <h3>CIA</h3>
                                <p>Controle, Instrumentação Biomedica e Inteligência Artificial.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECÇÃO: MISSÃO, VISÃO E VALORES */}
            <section className="section" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="container">
                    <div className="about-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="stat-card">
                            <span className="badge" style={{ marginBottom: '1rem' }}>Objetivo</span>
                            <h3 className="card-title">Missão</h3>
                            <p className="card-text" style={{ color: 'var(--text-secondary)' }}>Promover o desenvolvimento tecnológico através da pesquisa científica.</p>
                        </div>
                        
                        <div className="stat-card">
                            <span className="badge" style={{ marginBottom: '1rem' }}>Futuro</span>
                            <h3 className="card-title">Visão</h3>
                            <p className="card-text" style={{ color: 'var(--text-secondary)' }}>Ser um grupo de referência em processos que envolvam controle, instrumentação biomédica e IA.</p>
                        </div>
                        
                        <div className="stat-card">
                            <span className="badge" style={{ marginBottom: '1rem' }}>Cultura</span>
                            <h3 className="card-title">Valores</h3>
                            <p className="card-text" style={{ color: 'var(--text-secondary)' }}>Ética profissional, rigor científico e pensamento disruptivo.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* SECÇÃO DE CITAÇÃO (QUOTE) */}
            <section className="section">
                <div className="container text-center">
                    <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', maxWidth: '900px', margin: '0 auto', lineHeight: 1.3 }}>
                        "Transformamos a complexidade das coisas em <span className="text-gradient">soluções que impactam a vida e a indústria.</span>"
                    </h2>
                </div>
            </section>
        </main>
    );
}