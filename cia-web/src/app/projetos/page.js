"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getProjects } from '../firebase';
import '../inner-pages.css';

const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

function ProjectDiagram({ variant }) {
    return (
        <svg className={`ip-project-diagram ip-project-diagram-${variant}`} viewBox="0 0 360 170" fill="none" aria-hidden="true">
            <g stroke="currentColor" opacity="0.12"><path d="M0 42H360M0 85H360M0 128H360M60 0V170M120 0V170M180 0V170M240 0V170M300 0V170" /></g>
            {variant === 0 ? <g stroke="currentColor"><circle cx="180" cy="85" r="56" /><circle cx="180" cy="85" r="39" opacity="0.5" /><circle cx="180" cy="85" r="20" opacity="0.3" /><path d="M75 85H285M180 12V158" strokeDasharray="3 5" opacity="0.5" /><circle cx="180" cy="29" r="4" fill="currentColor" /><circle cx="219" cy="85" r="4" fill="currentColor" /></g> : variant === 1 ? <g stroke="currentColor"><path d="M35 85H95L112 60L130 115L153 30L177 138L199 68L215 85H325" strokeWidth="1.5" /><path d="M35 105H325M35 65H325" strokeDasharray="2 6" opacity="0.3" /><circle cx="153" cy="30" r="4" fill="currentColor" /><circle cx="215" cy="85" r="4" fill="currentColor" /></g> : <g stroke="currentColor"><path d="M90 85L145 35L215 35L270 85L215 135L145 135L90 85ZM145 35L215 135M215 35L145 135M90 85H270M145 35V135M215 35V135" opacity="0.5" /><circle cx="90" cy="85" r="6" fill="currentColor" /><circle cx="145" cy="35" r="5" fill="currentColor" /><circle cx="215" cy="35" r="5" /><circle cx="270" cy="85" r="6" fill="currentColor" /><circle cx="215" cy="135" r="5" fill="currentColor" /><circle cx="145" cy="135" r="5" /></g>}
        </svg>
    );
}

export default function ProjetosPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [requestVersion, setRequestVersion] = useState(0);
    const [query, setQuery] = useState('');
    const [selectedArea, setSelectedArea] = useState('');

    useEffect(() => {
        let active = true;
        getProjects()
            .then((data) => { if (active) setProjects(data); })
            .catch(() => { if (active) setError(true); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [requestVersion]);

    const areas = useMemo(() => [...new Set(projects.map((project) => project.area?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [projects]);
    const visibleProjects = useMemo(() => projects
        .map((project, index) => ({ ...project, displayIndex: index + 1 }))
        .filter((project) => (!selectedArea || project.area?.trim() === selectedArea) && normalize(`${project.title} ${project.area}`).includes(normalize(query.trim()))), [projects, query, selectedArea]);

    function retry() {
        setError(false);
        setLoading(true);
        setRequestVersion((version) => version + 1);
    }

    function clearFilters() {
        setQuery('');
        setSelectedArea('');
    }

    return (
        <main className="ip-page">
            <section className="ip-shell ip-projects-hero">
                <div>
                    <p className="ip-eyebrow"><span /> Portfólio Científico</p>
                    <h1>Nossos<br /><span>Projetos.</span></h1>
                </div>
                <div className="ip-projects-intro"><span className="ip-intro-asterisk" aria-hidden="true">✳</span><p className="ip-lead">Conheça as iniciativas e pesquisas desenvolvidas pelo grupo CIA.</p><p className="ip-micro">DA INVESTIGAÇÃO À APLICAÇÃO</p></div>
            </section>

            <section className="ip-shell ip-projects-section" aria-label="Explore os projetos">
                <div className="ip-project-toolbar">
                    <div className="ip-toolbar-title"><span className="ip-micro">EXPLORE A PESQUISA</span><span className="ip-results-count" aria-live="polite">{loading ? 'Carregando…' : error ? 'Indisponível no momento' : `${visibleProjects.length} ${visibleProjects.length === 1 ? 'projeto' : 'projetos'}`}</span></div>
                    <div className="ip-search-field"><label htmlFor="project-search">Buscar por nome ou área</label><div className="ip-search-input"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg><input id="project-search" type="search" placeholder="O que você quer descobrir?" value={query} onChange={(event) => setQuery(event.target.value)} disabled={loading || error} /></div></div>
                </div>

                {!loading && !error && areas.length > 0 && <div className="ip-filter-row" role="group" aria-label="Filtrar por área de pesquisa"><button type="button" className={`ip-filter ${selectedArea === '' ? 'ip-filter-active' : ''}`} aria-pressed={selectedArea === ''} onClick={() => setSelectedArea('')}>Todas as áreas <span>{projects.length}</span></button>{areas.map((area) => <button type="button" className={`ip-filter ${selectedArea === area ? 'ip-filter-active' : ''}`} key={area} aria-pressed={selectedArea === area} onClick={() => setSelectedArea(area)}>{area}</button>)}</div>}

                {loading ? <div role="status"><span className="ip-sr-only">Carregando projetos...</span><div className="ip-project-grid" aria-hidden="true">{Array.from({ length: 3 }, (_, index) => <div key={index} className="ip-project-skeleton"><div /><span /><span /></div>)}</div></div> : error ? <div className="ip-empty" role="alert"><span className="ip-empty-symbol" aria-hidden="true">↻</span><h2>Não foi possível carregar os projetos.</h2><p>Confira sua conexão e tente novamente.</p><button type="button" className="ip-action-button" onClick={retry}>Tentar novamente <span aria-hidden="true">↗</span></button></div> : visibleProjects.length === 0 ? <div className="ip-empty" role="status"><span className="ip-empty-symbol" aria-hidden="true">⌕</span><h2>Nenhum projeto encontrado.</h2><p>{projects.length ? 'Experimente outro termo ou explore todas as áreas.' : 'As iniciativas do grupo aparecerão aqui assim que forem publicadas.'}</p>{(query || selectedArea) && <button type="button" className="ip-action-button" onClick={clearFilters}>Limpar filtros <span aria-hidden="true">↗</span></button>}</div> : <div className="ip-project-grid">{visibleProjects.map((project) => <article className="ip-project-card" key={project.id}><div className="ip-project-visual"><div className="ip-card-meta"><span>PROJETO / {String(project.displayIndex).padStart(2, '0')}</span><span className="ip-project-cross" aria-hidden="true">+</span></div><ProjectDiagram variant={normalize(project.area).includes('controle') ? 0 : normalize(project.area).includes('instrument') ? 1 : 2} /></div><div className="ip-project-card-body"><p className="ip-project-area">{project.area || 'Pesquisa'}</p><h2>{project.title}</h2><Link href={`/${project.slug || 'erro-sem-slug'}`} className="ip-project-link" aria-label={`Saiba mais sobre ${project.title}`}>Saiba mais <span aria-hidden="true">↗</span></Link></div></article>)}</div>}

                <div className="ip-projects-end"><span className="ip-micro">CONTROLE · INSTRUMENTAÇÃO · INTELIGÊNCIA ARTIFICIAL</span><Link className="ip-text-link" href="/sobre">Conheça o grupo <span aria-hidden="true">↗</span></Link></div>
            </section>
        </main>
    );
}

