"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    getCurrentUser, isAdmin, createPost, getPosts, getUserProfile, 
    addComment, getComments, softDeletePost, softDeleteComment 
} from '../firebase';

// IMPORTA O NOVO SISTEMA DE MODAIS
import { useModal } from '../components/ModalProvider';

export default function ForumPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // INICIA AS FUNÇÕES DO MODAL
    const { showAlert, showConfirm } = useModal();
    
    // Estados da Criação de Tópico
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados dos Comentários
    const [activePostId, setActivePostId] = useState(null);
    const [comments, setComments] = useState({});
    const [newCommentText, setNewCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    // ==========================================
    // ESTADOS: Modal de Perfil de Terceiros
    // ==========================================
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedUserProfile, setSelectedUserProfile] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    useEffect(() => {
        const initForum = async () => {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                router.push('/login');
                return;
            }
            setUser(currentUser);
            const adminStatus = await isAdmin(currentUser.uid);
            setUserIsAdmin(adminStatus);
            await fetchPosts();
        };
        initForum();
    }, [router]);

    const fetchPosts = async () => {
        try {
            const data = await getPosts();
            setPosts(data);
        } catch (error) {
            console.error("Erro ao carregar posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setIsSubmitting(true);
        try {
            const userProf = await getUserProfile(user.uid);
            const freshName = userProf?.firstName ? `${userProf.firstName} ${userProf.lastName}` : user.email.split('@')[0];
            
            await createPost(title, content, user.uid, user.email, freshName);
            setTitle('');
            setContent('');
            await fetchPosts(); 
        } catch (error) {
            showAlert("Erro", "Erro ao publicar o tópico. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleComments = async (postId) => {
        if (activePostId === postId) {
            setActivePostId(null);
            return;
        }
        setActivePostId(postId);
        const postComments = await getComments(postId);
        setComments(prev => ({ ...prev, [postId]: postComments }));
    };

    const handleAddComment = async (postId) => {
        if (!newCommentText.trim()) return;
        setIsSubmittingComment(true);
        try {
            const userProf = await getUserProfile(user.uid);
            const freshName = userProf?.firstName ? `${userProf.firstName} ${userProf.lastName}` : user.email.split('@')[0];
            
            await addComment(postId, newCommentText, user.uid, freshName);
            setNewCommentText('');
            const updatedComments = await getComments(postId);
            setComments(prev => ({ ...prev, [postId]: updatedComments }));
        } catch (error) {
            showAlert("Erro", "Erro ao enviar comentário.");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeletePost = (post) => {
        showConfirm(
            "Excluir Tópico", 
            "Deseja realmente apagar esta postagem?", 
            async () => {
                const deletedBy = (userIsAdmin && post.userId !== user.uid) ? 'admin' : 'author';
                try {
                    await softDeletePost(post.id, deletedBy);
                    await fetchPosts();
                } catch (error) {
                    showAlert("Erro", "Erro ao excluir a postagem.");
                }
            }
        );
    };

    const handleDeleteComment = (postId, comment) => {
        showConfirm(
            "Excluir Comentário", 
            "Deseja realmente apagar este comentário?", 
            async () => {
                const deletedBy = (userIsAdmin && comment.userId !== user.uid) ? 'admin' : 'author';
                try {
                    await softDeleteComment(postId, comment.id, deletedBy);
                    const updatedComments = await getComments(postId);
                    setComments(prev => ({ ...prev, [postId]: updatedComments }));
                } catch (error) {
                    showAlert("Erro", "Erro ao excluir o comentário.");
                }
            }
        );
    };

    const handleUserClick = async (targetUserId, fallbackName) => {
        setIsProfileModalOpen(true);
        setIsLoadingProfile(true);
        try {
            const profileData = await getUserProfile(targetUserId);
            if (profileData) {
                setSelectedUserProfile(profileData);
            } else {
                setSelectedUserProfile({ firstName: fallbackName, lastName: '', role: 'user' });
            }
        } catch (error) {
            console.error("Erro ao buscar perfil", error);
            setSelectedUserProfile({ firstName: fallbackName, lastName: '', role: 'user' });
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'Agora mesmo';
        return timestamp.toDate().toLocaleString('pt-BR', { 
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).replace(', ', ' às ');
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

    if (loading || !user) {
        return <main style={{ paddingTop: '150px', textAlign: 'center', minHeight: 'calc(100vh - 200px)' }}><p style={{ color: 'var(--text-muted)' }}>Carregando fórum...</p></main>;
    }

    return (
        <main style={{ paddingTop: '80px', paddingBottom: '6rem', minHeight: 'calc(100vh - 200px)' }}>
            
            <section className="section" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
                <div className="container hero-container">
                    <div className="hero-content text-center">
                        <div className="badge">Comunidade Científica</div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                            Fórum de <span className="text-gradient">Discussões.</span>
                        </h1>
                        <p className="hero-subtitle" style={{ margin: '0 auto', maxWidth: '600px' }}>
                            Compartilhe conhecimento, dúvidas e inovações com a equipe.
                        </p>
                    </div>
                </div>
            </section>

            <section className="section" style={{ paddingTop: '0' }}>
                <div className="container forum-layout">
                    
                    <aside>
                        <div className="post-creator">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Iniciar Discussão</h2>
                            <form onSubmit={handleCreatePost}>
                                <div className="form-group">
                                    <label className="form-label">Título do Tópico</label>
                                    <input type="text" className="form-input" placeholder="Inserir texto" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Conteúdo</label>
                                    <textarea className="form-input" placeholder="Escreva os detalhes da sua dúvida ou ideia aqui..." value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={isSubmitting}>
                                    {isSubmitting ? 'Publicando...' : 'Publicar Tópico'}
                                </button>
                            </form>
                        </div>
                    </aside>

                    <div>
                        {posts.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Nenhuma discussão iniciada ainda. Seja o primeiro!</div>
                        ) : (
                            posts.map((post) => (
                                /* A MÁGICA ESTÁ AQUI: Se estiver deletado, retorna null e não desenha nada! */
                                post.deleted ? null : (
                                    <div key={post.id} className="post-card">
                                        <div className="post-header-info">
                                            <div className="post-author-badge">
                                                <div 
                                                    className="author-avatar" 
                                                    style={{ cursor: 'pointer', transition: '0.2s' }} 
                                                    onClick={() => handleUserClick(post.userId, post.authorName)}
                                                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                                                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                                >
                                                    {getInitial(post.authorName)}
                                                </div>
                                                <div>
                                                    <h3 
                                                        style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.1rem', cursor: 'pointer' }}
                                                        onClick={() => handleUserClick(post.userId, post.authorName)}
                                                    >
                                                        {post.authorName}
                                                    </h3>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Pesquisador</span>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDateTime(post.createdAt)}</span>
                                                {(userIsAdmin || user.uid === post.userId) && (
                                                    <button onClick={() => handleDeletePost(post)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                                                        Excluir Tópico
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{post.title}</h3>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem', wordBreak: 'break-word' }}>{post.content}</p>
                                        
                                        <button onClick={() => toggleComments(post.id)} className="btn btn-secondary btn-sm" style={{ background: activePostId === post.id ? 'rgba(37, 99, 235, 0.05)' : 'transparent', borderColor: activePostId === post.id ? 'var(--accent)' : 'var(--border)', color: activePostId === post.id ? 'var(--accent)' : 'var(--text-secondary)' }}>
                                            {activePostId === post.id ? 'Ocultar Comentários' : 'Ver Comentários / Responder'}
                                        </button>

                                        {activePostId === post.id && (
                                            <div className="comment-section">
                                                
                                                {comments[post.id]?.length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                                        {comments[post.id].map(comment => (
                                                            /* MÁGICA DOS COMENTÁRIOS: Se estiver deletado, também retorna null! */
                                                            comment.deleted ? null : (
                                                                <div key={comment.id} className="comment-bubble">
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                                                                        <div>
                                                                            <span 
                                                                                style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                                                                                onClick={() => handleUserClick(comment.userId, comment.authorName)}
                                                                            >
                                                                                {comment.authorName}
                                                                            </span>
                                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{formatDateTime(comment.createdAt)}</span>
                                                                        </div>
                                                                        
                                                                        {(userIsAdmin || user.uid === comment.userId) && (
                                                                            <button onClick={() => handleDeleteComment(post.id, comment)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.8, fontWeight: '500' }}>
                                                                                Excluir
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{comment.content}</p>
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>Nenhum comentário ainda.</p>
                                                )}

                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input 
                                                        type="text" 
                                                        className="form-input" 
                                                        placeholder="Escreva a sua resposta..." 
                                                        value={newCommentText} 
                                                        onChange={(e) => setNewCommentText(e.target.value)}
                                                        onKeyDown={(e) => { if(e.key === 'Enter') handleAddComment(post.id); }}
                                                        style={{ margin: 0, flex: 1, padding: '0.6rem 1rem' }}
                                                    />
                                                    <button onClick={() => handleAddComment(post.id)} className="btn btn-primary btn-sm" disabled={isSubmittingComment || !newCommentText.trim()}>
                                                        Enviar
                                                    </button>
                                                </div>

                                            </div>
                                        )}

                                    </div>
                                )
                            ))
                        )}
                    </div>

                </div>
            </section>

            {/* ========================================== */}
            {/* MODAL DE PERFIL DE TERCEIROS */}
            {/* ========================================== */}
            {isProfileModalOpen && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', 
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{ 
                        background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', 
                        padding: '2rem', width: '100%', maxWidth: '380px', 
                        boxShadow: 'var(--shadow-card)', position: 'relative',
                        textAlign: 'center'
                    }}>
                        
                        <button 
                            onClick={() => setIsProfileModalOpen(false)} 
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            &times;
                        </button>

                        {isLoadingProfile ? (
                            <p style={{ color: 'var(--text-muted)', margin: '2rem 0' }}>Buscando informações...</p>
                        ) : selectedUserProfile ? (
                            <>
                                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--accent)', margin: '0 auto 1rem auto' }}>
                                    {getInitial(selectedUserProfile.firstName)}
                                </div>
                                
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                                    {selectedUserProfile.firstName} {selectedUserProfile.lastName}
                                </h3>
                                
                                <span style={{ display: 'inline-block', fontSize: '0.8rem', background: selectedUserProfile.role === 'admin' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(37, 99, 235, 0.1)', color: selectedUserProfile.role === 'admin' ? '#dc2626' : 'var(--accent)', padding: '0.2rem 0.8rem', borderRadius: '20px', fontWeight: '600', marginBottom: '1.5rem' }}>
                                    {selectedUserProfile.role === 'admin' ? 'Administrador' : 'Pesquisador'}
                                </span>

                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                                    {selectedUserProfile.lattesLink ? (
                                        <a 
                                            href={selectedUserProfile.lattesLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="btn btn-primary" 
                                            style={{ width: '100%', textDecoration: 'none' }}
                                        >
                                            Aceder ao Currículo Lattes
                                        </a>
                                    ) : (
                                        <button className="btn btn-secondary" style={{ width: '100%', cursor: 'not-allowed', opacity: 0.6 }} disabled>
                                            Lattes não associado
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p style={{ color: '#dc2626' }}>Erro ao carregar perfil.</p>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}