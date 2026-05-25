"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    getCurrentUser, isAdmin, createPost, getPosts, getUserProfile, 
    addComment, getComments, softDeletePost, softDeleteComment 
} from '../firebase';

export default function ForumPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados da Criação de Tópico
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados dos Comentários
    const [activePostId, setActivePostId] = useState(null);
    const [comments, setComments] = useState({});
    const [newCommentText, setNewCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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
            // MÁGICA 1: Pega o nome mais atualizado 1 milissegundo antes de postar
            const userProf = await getUserProfile(user.uid);
            const freshName = userProf?.firstName ? `${userProf.firstName} ${userProf.lastName}` : user.email.split('@')[0];
            
            await createPost(title, content, user.uid, user.email, freshName);
            setTitle('');
            setContent('');
            await fetchPosts(); 
        } catch (error) {
            alert("Erro ao publicar o tópico.");
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
            // MÁGICA 2: Pega o nome mais atualizado 1 milissegundo antes de comentar
            const userProf = await getUserProfile(user.uid);
            const freshName = userProf?.firstName ? `${userProf.firstName} ${userProf.lastName}` : user.email.split('@')[0];
            
            await addComment(postId, newCommentText, user.uid, freshName);
            setNewCommentText('');
            const updatedComments = await getComments(postId);
            setComments(prev => ({ ...prev, [postId]: updatedComments }));
        } catch (error) {
            alert("Erro ao enviar comentário.");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeletePost = async (post) => {
        if (!confirm("Deseja realmente apagar esta postagem?")) return;
        const deletedBy = (userIsAdmin && post.userId !== user.uid) ? 'admin' : 'author';
        try {
            await softDeletePost(post.id, deletedBy);
            await fetchPosts();
        } catch (error) {
            alert("Erro ao excluir a postagem.");
        }
    };

    const handleDeleteComment = async (postId, comment) => {
        if (!confirm("Deseja realmente apagar este comentário?")) return;
        const deletedBy = (userIsAdmin && comment.userId !== user.uid) ? 'admin' : 'author';
        try {
            await softDeleteComment(postId, comment.id, deletedBy);
            const updatedComments = await getComments(postId);
            setComments(prev => ({ ...prev, [postId]: updatedComments }));
        } catch (error) {
            alert("Erro ao excluir o comentário.");
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
        return <main style={{ paddingTop: '150px', textAlign: 'center', minHeight: '80vh' }}><p style={{ color: 'var(--text-muted)' }}>Carregando fórum...</p></main>;
    }

    return (
        <main style={{ paddingTop: '100px', paddingBottom: '6rem', minHeight: '80vh' }}>
            <section className="hero section" style={{ minHeight: 'auto', paddingBottom: '4rem' }}>
                <div className="container hero-container">
                    <div className="hero-content text-center">
                        <div className="badge">Comunidade Científica</div>
                        <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>Fórum de <span className="text-gradient">Discussões.</span></h1>
                        <p className="hero-subtitle">Compartilhe conhecimento, dúvidas e inovações com a equipe.</p>
                    </div>
                </div>
            </section>

            <section className="section" style={{ paddingTop: '0' }}>
                <div className="container forum-layout">
                    
                    <aside>
                        <div className="post-creator">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Iniciar Discussão</h2>
                            <form onSubmit={handleCreatePost}>
                                <div className="form-group">
                                    <label className="form-label">Título do Tópico</label>
                                    <input type="text" className="form-input" placeholder="Ex: Filtro de ruído no ESP32" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
                                post.deleted ? (
                                    <div key={post.id} className="post-card" style={{ opacity: 0.5, padding: '1rem 1.5rem' }}>
                                        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                                            🚫 Esta postagem foi deletada {post.deletedBy === 'admin' ? 'por um administrador' : 'pelo autor'}.
                                        </p>
                                    </div>
                                ) : (
                                    <div key={post.id} className="post-card">
                                        <div className="post-header-info">
                                            <div className="post-author-badge">
                                                <div className="author-avatar">{getInitial(post.authorName)}</div>
                                                <div>
                                                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.1rem' }}>{post.authorName}</h3>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Pesquisador</span>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDateTime(post.createdAt)}</span>
                                                {(userIsAdmin || user.uid === post.userId) && (
                                                    <button onClick={() => handleDeletePost(post)} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                                                        Excluir Tópico
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#fff' }}>{post.title}</h3>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem', wordBreak: 'break-word' }}>{post.content}</p>
                                        
                                        <button onClick={() => toggleComments(post.id)} className="btn btn-secondary btn-sm" style={{ background: activePostId === post.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent', borderColor: activePostId === post.id ? 'var(--accent)' : 'var(--border)', color: activePostId === post.id ? 'var(--accent)' : 'var(--text-secondary)' }}>
                                            {activePostId === post.id ? 'Ocultar Comentários' : 'Ver Comentários / Responder'}
                                        </button>

                                        {activePostId === post.id && (
                                            <div className="comment-section">
                                                
                                                {comments[post.id]?.length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                                        {comments[post.id].map(comment => (
                                                            comment.deleted ? (
                                                                <div key={comment.id} className="comment-bubble" style={{ opacity: 0.5, padding: '0.75rem 1rem' }}>
                                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                                                                        🚫 Comentário deletado {comment.deletedBy === 'admin' ? 'por um administrador' : 'pelo autor'}.
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <div key={comment.id} className="comment-bubble">
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                                                                        <div>
                                                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{comment.authorName}</span>
                                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{formatDateTime(comment.createdAt)}</span>
                                                                        </div>
                                                                        
                                                                        {(userIsAdmin || user.uid === comment.userId) && (
                                                                            <button onClick={() => handleDeleteComment(post.id, comment)} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.8 }}>
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
                                                        placeholder="Escreva sua resposta..." 
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
        </main>
    );
}