"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProjects } from '../firebase';

export default function ProjetosPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch (error) {
                console.error("Erro ao carregar projetos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    return (
        /* Reduzimos o padding-top do main para compensar apenas a Navbar fixa */
        <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)' }}>
            <section className="section" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
                <div className="container">
                    <div className="text-center">
                        <div className="badge">Portfólio Científico</div>
                        {/* Como tiramos o hero, ajustamos o tamanho da fonte direto na tag h1 para manter o padrão */}
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                            Nossos <span className="text-gradient">Projetos.</span>
                        </h1>
                        <p className="hero-subtitle">Conheça as iniciativas e pesquisas desenvolvidas pelo grupo CIA.</p>
                    </div>
                </div>
            </section>

            <section className="section" style={{ paddingTop: '0' }}>
                <div className="container">
                    {loading ? (
                        <div className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                            Carregando projetos...
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                            Nenhum projeto encontrado.
                        </div>
                    ) : (
                        <div className="grid" style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                            gap: '2rem' 
                        }}>
                            {projects.map((proj) => (
                                <div key={proj.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                                    <div style={{ marginBottom: '2rem' }}>
                                        <span className="badge" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', marginBottom: '1rem' }}>
                                            {proj.area}
                                        </span>
                                        <h3 style={{ color: 'var(--text-primary)' }}>{proj.title}</h3>
                                    </div>
                                    <Link href={`/${proj.slug || 'erro-sem-slug'}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                                        Saiba mais
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}