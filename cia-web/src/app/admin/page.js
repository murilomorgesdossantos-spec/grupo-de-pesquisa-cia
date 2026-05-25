"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    getCurrentUser, 
    isAdmin, 
    createProject, 
    getProjects, 
    updateProject, 
    deleteProject, 
    getUsersList, 
    updateUserRole 
} from '../firebase';

export default function AdminPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [currentUserUid, setCurrentUserUid] = useState(null);
    const [activeTab, setActiveTab] = useState('projects'); // 'projects' ou 'users'
    
    // Dados
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Form States (Estado do Formulário de Projetos)
    const [isEditing, setIsEditing] = useState(false);
    const [projId, setProjId] = useState('');
    const [projTitle, setProjTitle] = useState('');
    const [projArea, setProjArea] = useState('');
    const [projDesc, setProjDesc] = useState('');
    const [projEditors, setProjEditors] = useState([]); // <- Estado para os Editores
    const [isSaving, setIsSaving] = useState(false);

    // 1. VERIFICAÇÃO DE SEGURANÇA
    useEffect(() => {
        const checkAccess = async () => {
            const user = await getCurrentUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setCurrentUserUid(user.uid);
            
            const adminCheck = await isAdmin(user.uid);
            if (!adminCheck) {
                setIsAuthorized(false);
            } else {
                setIsAuthorized(true);
                loadProjects();
                loadUsers();
            }
        };
        checkAccess();
    }, [router]);

    // 2. CARREGAMENTO DE DADOS
    const loadProjects = async () => {
        const data = await getProjects();
        setProjects(data);
    };

    const loadUsers = async () => {
        const data = await getUsersList();
        setUsers(data);
    };

    // 3. FUNÇÃO PARA GERAR A URL LIMPA (SLUG)
    const createSlug = (text) => {
        return text.toString().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "") 
            .replace(/\s+/g, '-')           
            .replace(/[^\w\-]+/g, '')       
            .replace(/\-\-+/g, '-')         
            .replace(/^-+/, '')             
            .replace(/-+$/, '');            
    };

    // 4. LÓGICA DO FORMULÁRIO DE PROJETOS
    const handleSaveProject = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Objeto com os dados do projeto a ser salvo
        const data = {
            title: projTitle,
            slug: createSlug(projTitle),
            area: projArea,
            description: projDesc,
            editors: projEditors // Salva a lista de quem tem permissão
        };

        try {
            if (isEditing) {
                await updateProject(projId, data);
            } else {
                await createProject(data);
            }
            resetForm();
            await loadProjects();
        } catch (err) {
            alert("Erro ao salvar o projeto.");
        } finally {
            setIsSaving(false);
        }
    };

    const editProject = (p) => {
        setIsEditing(true);
        setProjId(p.id);
        setProjTitle(p.title);
        setProjArea(p.area || '');
        setProjDesc(p.description);
        setProjEditors(p.editors || []); // Carrega os editores antigos ou array vazio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteProject = async (id) => {
        if (confirm("Tem certeza que deseja excluir este projeto permanentemente?")) {
            await deleteProject(id);
            await loadProjects();
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setProjId('');
        setProjTitle('');
        setProjArea('');
        setProjDesc('');
        setProjEditors([]); // Limpa as permissões
    };

    // 5. LÓGICA DE USUÁRIOS
    const handleToggleRole = async (uid, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        await updateUserRole(uid, newRole);
        await loadUsers();
    };

    // ==========================================
    // RENDERIZAÇÃO CONDICIONAL (Telas de Bloqueio)
    // ==========================================
    if (isAuthorized === null) {
        return (
            <main style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh' }}>
                <p style={{ color: 'var(--text-muted)' }}>Verificando credenciais de administrador...</p>
            </main>
        );
    }

    if (isAuthorized === false) {
        return (
            <main style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh' }}>
                <h1 style={{ color: '#f87171', fontSize: '2.5rem', marginBottom: '1rem' }}>Acesso Restrito</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Você não tem privilégios de administrador para acessar esta área.</p>
                <button onClick={() => router.push('/')} className="btn btn-primary">Voltar para a Home</button>
            </main>
        );
    }

    // Estilos do formulário
    const inputStyle = { width: '100%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.875rem 1rem', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', marginBottom: '1.25rem' };
    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' };

    return (
        <main style={{ paddingTop: '120px', paddingBottom: '6rem', minHeight: '80vh' }}>
            <div className="container">
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Painel de Controle</h1>
                
                {/* TABS DE NAVEGAÇÃO */}
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <button onClick={() => setActiveTab('projects')} style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: activeTab === 'projects' ? 'var(--accent)' : 'var(--text-muted)', borderBottom: activeTab === 'projects' ? '2px solid var(--accent)' : 'none', paddingBottom: '0.5rem' }}>
                        Projetos do Portfólio
                    </button>
                    <button onClick={() => setActiveTab('users')} style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: activeTab === 'users' ? 'var(--accent)' : 'var(--text-muted)', borderBottom: activeTab === 'users' ? '2px solid var(--accent)' : 'none', paddingBottom: '0.5rem' }}>
                        Gerenciar Equipe
                    </button>
                </div>

                {/* CONTEÚDO DAS ABAS */}
                {activeTab === 'projects' && (
                    <div style={{ display: 'grid', gap: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
                        
                        {/* FORMULÁRIO DE PROJETO (Esquerda) */}
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '16px', position: 'sticky', top: '100px' }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
                                {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
                            </h2>
                            <form onSubmit={handleSaveProject}>
                                <label style={labelStyle}>Título do Projeto</label>
                                <input type="text" style={inputStyle} value={projTitle} onChange={(e) => setProjTitle(e.target.value)} required placeholder="Ex: Levitador PID" />

                                <label style={labelStyle}>Área de Pesquisa</label>
                                <select style={{...inputStyle, appearance: 'auto', backgroundColor: '#0a0e1c'}} value={projArea} onChange={(e) => setProjArea(e.target.value)} required>
                                    <option value="" disabled>Selecione a área...</option>
                                    <option value="Controle">Controle</option>
                                    <option value="Instrumentação Biomedica">Instrumentação Biomedica</option>
                                    <option value="IA">IA</option>
                                </select>

                                <label style={labelStyle}>Descrição Inicial / Resumo</label>
                                <textarea style={{...inputStyle, minHeight: '120px', resize: 'vertical'}} value={projDesc} onChange={(e) => setProjDesc(e.target.value)} placeholder="(Opcional) Esta é a descrição base. O conteúdo rico é editado na própria página do projeto."></textarea>

                                {/* LISTA DE SELEÇÃO DE EDITORES */}
                                <label style={labelStyle}>Permissões de Edição (Quem pode editar a página?)</label>
                                <div style={{...inputStyle, height: 'auto', maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem'}}>
                                    {users.length === 0 ? (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Carregando usuários...</span>
                                    ) : (
                                        users.map(u => (
                                            <label key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                <input 
                                                    type="checkbox" 
                                                    style={{ cursor: 'pointer' }}
                                                    checked={projEditors.includes(u.uid)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setProjEditors([...projEditors, u.uid]);
                                                        else setProjEditors(projEditors.filter(id => id !== u.uid));
                                                    }}
                                                />
                                                {u.email} {u.role === 'admin' && <span style={{fontSize: '0.75rem', color: 'var(--accent)'}}>(Admin)</span>}
                                            </label>
                                        ))
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSaving}>
                                        {isSaving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Publicar Projeto')}
                                    </button>
                                    {isEditing && (
                                        <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar</button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* LISTA DE PROJETOS (Direita) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {projects.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Nenhum projeto cadastrado.</p> : null}
                            {projects.map(proj => (
                                <div key={proj.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: '1 1 min-content', minWidth: '0' }}>
                                        <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>{proj.area}</span>
                                        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '0.2rem', wordBreak: 'break-word' }}>{proj.title}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/{proj.slug}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button onClick={() => editProject(proj)} className="btn btn-secondary btn-sm">Editar</button>
                                        <button onClick={() => handleDeleteProject(proj.id)} className="btn btn-secondary btn-sm" style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}>Excluir</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ABA DA EQUIPE */}
                {activeTab === 'users' && (
                    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {users.map(u => {
                            const isAdminUser = u.role === 'admin';
                            const isMe = u.uid === currentUserUid;
                            return (
                                <div key={u.uid} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 min-content', minWidth: '0' }}>
                                        <div style={{ minWidth: '40px', width: '40px', height: '40px', borderRadius: '50%', background: isAdminUser ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isAdminUser ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {u.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: '0' }}>
                                            <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', wordBreak: 'break-all' }}>{u.email} {isMe && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Você)</span>}</h3>
                                            <span style={{ fontSize: '0.8rem', color: isAdminUser ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>{isAdminUser ? 'Administrador' : 'Pesquisador'}</span>
                                        </div>
                                    </div>
                                    {!isMe && (
                                        <button 
                                            onClick={() => handleToggleRole(u.uid, u.role)} 
                                            className="btn btn-secondary btn-sm" 
                                            style={{ color: isAdminUser ? '#f87171' : '#4ade80', borderColor: isAdminUser ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)', width: 'max-content' }}
                                        >
                                            {isAdminUser ? 'Remover Admin' : 'Promover a Admin'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}