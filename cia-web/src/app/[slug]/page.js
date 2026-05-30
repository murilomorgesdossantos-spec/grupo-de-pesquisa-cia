"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getProjectBySlug, getCurrentUser, isAdmin, updateProject } from '../firebase';
import 'react-quill-new/dist/quill.snow.css';

// Carrega o React Quill e o Módulo de Imagem juntos e apenas no cliente!
const EditorAvancado = dynamic(
    async () => {
        const RQ = await import('react-quill-new');
        const ReactQuill = RQ.default;
        const Quill = RQ.Quill;
        const BlotFormatter = (await import('quill-blot-formatter')).default;

        // Regista o módulo de redimensionamento no motor do Quill
        if (Quill && !Quill.imports['modules/blotFormatter']) {
            Quill.register('modules/blotFormatter', BlotFormatter);
        }

        return function EditorPronto(props) {
            return <ReactQuill {...props} />;
        };
    },
    { ssr: false, loading: () => <p style={{ color: 'var(--text-muted)' }}>A carregar ferramentas do editor...</p> }
);

export default function ProjetoDetalhe({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const slug = params.slug;
    
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [user, setUser] = useState(null);
    const [canEdit, setCanEdit] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editArea, setEditArea] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProjectAndUser = async () => {
            if (slug) {
                const projData = await getProjectBySlug(slug);
                setProject(projData);
                
                if (projData) {
                    setEditTitle(projData.title);
                    setEditArea(projData.area);
                    setEditDesc(projData.description);
                }

                const currentUser = await getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    const userIsAdmin = await isAdmin(currentUser.uid);
                    const isProjectEditor = projData?.editors?.includes(currentUser.uid);
                    
                    if (userIsAdmin || isProjectEditor) {
                        setCanEdit(true);
                    }
                }
                setLoading(false);
            }
        };
        fetchProjectAndUser();
    }, [slug]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProject(project.id, {
                title: editTitle,
                area: editArea,
                description: editDesc
            });
            setProject({ ...project, title: editTitle, area: editArea, description: editDesc });
            setIsEditing(false);
        } catch (error) {
            alert("Erro ao guardar: " + error.message);
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <main style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh' }}><p style={{ color: 'var(--text-muted)' }}>A procurar detalhes do projeto...</p></main>;
    if (!project) return <main style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh' }}><h1 style={{ color: '#f87171', marginBottom: '1.5rem' }}>Projeto não encontrado</h1><Link href="/projetos" className="btn btn-secondary">Voltar</Link></main>;

    // ==========================================
    // CONFIGURAÇÕES DO EDITOR (ULTRA CLEAN)
    // ==========================================
    const modules = {
        toolbar: [
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            
            [{ 'align': [] }],
            
            [{'list': 'ordered'}, {'list': 'bullet'}, { 'indent': '-1'}, { 'indent': '+1' }],
            
            ['link', 'image', 'video'],
            
            ['clean'] 
        ],
        clipboard: {
            matchVisual: false, 
        },
        blotFormatter: {} 
    };

    const formats = [
        'header', 'size', 
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'align', 
        'list', 'indent',
        'link', 'image', 'video'
    ];

    return (
        <main style={{ paddingTop: '120px', paddingBottom: '6rem', minHeight: '80vh' }}>
            <div className="container">
                <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
                    
                    {canEdit && (
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--accent)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>Modo de Criação Ativo</span>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm">Editar Página</button>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm" disabled={isSaving}>Cancelar</button>
                                    <button onClick={handleSave} className="btn btn-primary btn-sm" style={{ background: '#4ade80', color: '#000' }} disabled={isSaving}>
                                        {isSaving ? 'A guardar...' : 'Guardar Publicação'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {!isEditing ? (
                        <>
                            <span className="badge" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>{project.area}</span>
                            <h1 className="hero-title" style={{ marginBottom: '2rem', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>{project.title}</h1>
                            
                            {/* A MÁGICA ESTÁ AQUI: Adicionámos ql-snow e ql-editor para a visualização */}
                            <div className="ql-snow">
                                <div 
                                    className="ql-editor rich-text-content" 
                                    style={{ padding: 0, color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8' }}
                                    dangerouslySetInnerHTML={{ __html: project.description?.replace(/&nbsp;/g, ' ') }}
                                />
                            </div>
                        </>
                    ) : (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <select 
                                value={editArea} 
                                onChange={(e) => setEditArea(e.target.value)} 
                                className="form-input"
                                style={{ fontSize: '0.85rem', width: 'auto', display: 'inline-block', marginBottom: '1.5rem', appearance: 'auto' }}
                                required
                            >
                                <option value="" disabled>Selecione a área...</option>
                                <option value="Controle">Controle</option>
                                <option value="Instrumentação Biomedica">Instrumentação Biomedica</option>
                                <option value="IA">IA</option>
                            </select>

                            <input 
                                type="text" 
                                value={editTitle} 
                                onChange={(e) => setEditTitle(e.target.value)} 
                                className="form-input"
                                style={{ fontSize: '2.5rem', fontWeight: 800, padding: '1rem', marginBottom: '1.5rem' }} 
                                placeholder="Título do Projeto" 
                            />
                            
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Corpo da Página</h3>
                            
                            <EditorAvancado 
                                theme="snow" 
                                value={editDesc} 
                                onChange={setEditDesc} 
                                modules={modules}
                                formats={formats} 
                                placeholder="Escreva os detalhes, cole imagens e redimensione-as clicando nelas..."
                            />
                        </div>
                    )}
                    
                    <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                        <Link href="/projetos" className="link-arrow">&larr; Voltar para a lista</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}