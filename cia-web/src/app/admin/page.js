"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    getCurrentUser, isAdmin, createProject, getProjects, 
    updateProject, deleteProject, getUsersList, updateUserRole 
} from '../firebase';

// 1. IMPORTA O HOOK DO MODAL
import { useModal } from '../components/ModalProvider'; 

export default function AdminPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [currentUserUid, setCurrentUserUid] = useState(null);
    const [activeTab, setActiveTab] = useState('projects'); 
    
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    
    const [isEditing, setIsEditing] = useState(false);
    const [projId, setProjId] = useState('');
    const [projTitle, setProjTitle] = useState('');
    const [projArea, setProjArea] = useState('');
    const [projDesc, setProjDesc] = useState('');
    const [projEditors, setProjEditors] = useState([]); 
    const [isSaving, setIsSaving] = useState(false);

    // 2. INICIA AS FUNÇÕES DO MODAL
    const { showAlert, showConfirm } = useModal(); 

    useEffect(() => {
        const checkAccess = async () => {
            const user = await getCurrentUser();
            if (!user) { router.push('/login'); return; }
            setCurrentUserUid(user.uid);
            
            const adminCheck = await isAdmin(user.uid);
            if (!adminCheck) { setIsAuthorized(false); } 
            else { setIsAuthorized(true); loadProjects(); loadUsers(); }
        };
        checkAccess();
    }, [router]);

    const loadProjects = async () => {
        const data = await getProjects();
        setProjects(data);
    };

    const loadUsers = async () => {
        const data = await getUsersList();
        setUsers(data);
    };

    const createSlug = (text) => {
        return text.toString().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "") 
            .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');            
    };

    const handleSaveProject = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const data = { title: projTitle, slug: createSlug(projTitle), area: projArea, description: projDesc, editors: projEditors };

        try {
            if (isEditing) { await updateProject(projId, data); } 
            else { await createProject(data); }
            resetForm();
            await loadProjects();
        } catch (err) {
            // 3. USA O MODAL DE ALERTA NO LUGAR DO ALERT NATIVO
            showAlert("Erro", "Erro ao salvar o projeto. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const editProject = (p) => {
        setIsEditing(true); setProjId(p.id); setProjTitle(p.title);
        setProjArea(p.area || ''); setProjDesc(p.description); setProjEditors(p.editors || []); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 4. USA O MODAL DE CONFIRMAÇÃO NO LUGAR DO CONFIRM NATIVO
    const handleDeleteProject = (id) => {
        showConfirm(
            "Excluir Projeto", 
            "Tem a certeza que deseja excluir este projeto permanentemente?", 
            async () => {
                await deleteProject(id);
                await loadProjects();
            }
        );
    };

    const resetForm = () => {
        setIsEditing(false); setProjId(''); setProjTitle(''); setProjArea(''); setProjDesc(''); setProjEditors([]);
    };

    const handleToggleRole = async (uid, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        await updateUserRole(uid, newRole);
        await loadUsers();
    };

    if (isAuthorized === null) {
        return <main style={{ paddingTop: '150px', textAlign: 'center', minHeight: 'calc(100vh - 200px)' }}><p style={{ color: 'var(--text-muted)' }}>Verificando credenciais...</p></main>;
    }

    if (isAuthorized === false) {
        return (
            <main style={{ paddingTop: '150px', textAlign: 'center', minHeight: 'calc(100vh - 200px)' }}>
                <h1 style={{ color: '#dc2626', fontSize: '2.5rem', marginBottom: '1rem' }}>Acesso Restrito</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Você não tem privilégios de administrador.</p>
                <button onClick={() => router.push('/')} className="btn btn-primary">Voltar para a Home</button>
            </main>
        );
    }

    const inputStyle = { 
        width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', 
        padding: '0.875rem 1rem', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', marginBottom: '1.25rem', transition: 'border-color 0.2s'
    };
    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' };

    return (
        <main style={{ paddingTop: '80px', paddingBottom: '6rem', minHeight: 'calc(100vh - 200px)' }}>
            <div className="container" style={{ paddingTop: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>Painel de Controle</h1>
                
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <button onClick={() => setActiveTab('projects')} style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: activeTab === 'projects' ? 'var(--accent)' : 'var(--text-muted)', borderBottom: activeTab === 'projects' ? '2px solid var(--accent)' : 'none', paddingBottom: '0.5rem' }}>Projetos do Portfólio</button>
                    <button onClick={() => setActiveTab('users')} style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: activeTab === 'users' ? 'var(--accent)' : 'var(--text-muted)', borderBottom: activeTab === 'users' ? '2px solid var(--accent)' : 'none', paddingBottom: '0.5rem' }}>Gerenciar Equipe</button>
                </div>

                {activeTab === 'projects' && (
                    <div style={{ display: 'grid', gap: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
                        <div className="post-creator">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>{isEditing ? 'Editar Projeto' : 'Novo Projeto'}</h2>
                            <form onSubmit={handleSaveProject}>
                                <label style={labelStyle}>Título do Projeto</label>
                                <input type="text" style={inputStyle} value={projTitle} onChange={(e) => setProjTitle(e.target.value)} required placeholder="Ex: Levitador PID" />

                                <label style={labelStyle}>Área de Pesquisa</label>
                                <select style={{...inputStyle, appearance: 'auto'}} value={projArea} onChange={(e) => setProjArea(e.target.value)} required>
                                    <option value="" disabled>Selecione a área...</option>
                                    <option value="Controle">Controle</option>
                                    <option value="Instrumentação Biomedica">Instrumentação Biomedica</option>
                                    <option value="IA">IA</option>
                                </select>

                                <label style={labelStyle}>Descrição Inicial / Resumo</label>
                                <textarea style={{...inputStyle, minHeight: '120px', resize: 'vertical'}} value={projDesc} onChange={(e) => setProjDesc(e.target.value)} placeholder="(Opcional) Esta é a descrição base..."></textarea>

                                <label style={labelStyle}>Permissões de Edição</label>
                                <div style={{...inputStyle, height: 'auto', maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem'}}>
                                    {users.length === 0 ? <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Carregando utilizadores...</span> : (
                                        users.map(u => (
                                            <label key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                <input type="checkbox" checked={projEditors.includes(u.uid)} onChange={(e) => { if (e.target.checked) setProjEditors([...projEditors, u.uid]); else setProjEditors(projEditors.filter(id => id !== u.uid)); }} />
                                                {u.email} {u.role === 'admin' && <span style={{fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '600'}}>(Admin)</span>}
                                            </label>
                                        ))
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSaving}>{isSaving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Publicar Projeto')}</button>
                                    {isEditing && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar</button>}
                                </div>
                            </form>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {projects.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Nenhum projeto cadastrado.</p> : null}
                            {projects.map(proj => (
                                <div key={proj.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-card)' }}>
                                    <div style={{ flex: '1 1 min-content', minWidth: '0' }}>
                                        <span style={{ fontSize: '0.7rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent)', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '600' }}>{proj.area}</span>
                                        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '0.2rem', wordBreak: 'break-word', color: 'var(--text-primary)' }}>{proj.title}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/{proj.slug}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button onClick={() => editProject(proj)} className="btn btn-secondary btn-sm">Editar</button>
                                        <button onClick={() => handleDeleteProject(proj.id)} className="btn btn-secondary btn-sm" style={{ color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.3)' }}>Excluir</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {users.map(u => {
                            const isAdminUser = u.role === 'admin';
                            const isMe = u.uid === currentUserUid;
                            return (
                                <div key={u.uid} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-card)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 min-content', minWidth: '0' }}>
                                        <div style={{ minWidth: '40px', width: '40px', height: '40px', borderRadius: '50%', background: isAdminUser ? 'rgba(37, 99, 235, 0.1)' : 'rgba(0, 0, 0, 0.03)', border: `1px solid ${isAdminUser ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: isAdminUser ? 'var(--accent)' : 'var(--text-secondary)' }}>
                                            {u.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: '0' }}>
                                            <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', wordBreak: 'break-all', color: 'var(--text-primary)' }}>{u.email} {isMe && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'normal' }}>(Você)</span>}</h3>
                                            <span style={{ fontSize: '0.8rem', color: isAdminUser ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600 }}>{isAdminUser ? 'Administrador' : 'Pesquisador'}</span>
                                        </div>
                                    </div>
                                    {!isMe && (
                                        <button onClick={() => handleToggleRole(u.uid, u.role)} className="btn btn-secondary btn-sm" style={{ color: isAdminUser ? '#dc2626' : '#16a34a', borderColor: isAdminUser ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)', width: 'max-content' }}>
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