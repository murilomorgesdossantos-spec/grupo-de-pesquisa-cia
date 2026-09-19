'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function PaginaSecreta() {
  const [user, setUser] = useState(null);
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verifica se o utilizador está logado e carrega as mensagens
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Puxa as respostas do Firestore
    const q = query(collection(db, 'respostas_diego'), orderBy('createdAt', 'asc'));
    const unsubscribeDb = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(fetchedMessages);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDb();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !reply.trim()) return;

    try {
      await addDoc(collection(db, 'respostas_diego'), {
        text: reply,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Membro do CIA',
        createdAt: serverTimestamp()
      });
      setReply('');
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Agora mesmo';
    return timestamp.toDate().toLocaleString('pt-PT', { 
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).replace(', ', ' às ');
  };

  if (loading) {
    return (
      <main style={{ paddingTop: '150px', textAlign: 'center', minHeight: 'calc(100vh - 200px)' }}>
        <p style={{ color: 'var(--text-muted)' }}>A carregar tópico...</p>
      </main>
    );
  }

  // Ecrã de bloqueio para quem não está logado
  if (!user) {
    return (
      <main style={{ paddingTop: '150px', textAlign: 'center', minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 'bold' }}>Acesso Restrito</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Tem de estar logado na plataforma para aceder a este tópico secreto.</p>
        <Link href="/login" className="btn btn-primary">
          Fazer Login
        </Link>
      </main>
    );
  }

  return (
    <main style={{ paddingTop: '80px', paddingBottom: '6rem', minHeight: 'calc(100vh - 200px)' }}>
      
      {/* Cabeçalho da secção */}
      <section className="section" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
        <div className="container hero-container">
          <div className="hero-content text-center">
            <div className="badge">Tópico Privado</div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
              Discussão <span className="text-gradient">Secreta.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Conteúdo Central */}
      <section className="section" style={{ paddingTop: '0' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div className="post-card">
            
            {/* Informações do Autor (Murilo) */}
            <div className="post-header-info">
              <div className="post-author-badge">
                <div className="author-avatar" style={{ cursor: 'default' }}>
                  M
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.1rem' }}>
                    Murilo
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Autor do Tópico</span>
                </div>
              </div>
            </div>
            
            {/* Título da Pergunta */}
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Beatriz, o que você acha da gente arrumar uma namorada para o Diego?
            </h3>
            
            {/* Área de Comentários Integrada */}
            <div className="comment-section">
              
              {messages.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  Nenhuma resposta ainda. Seja o primeiro!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {messages.map((msg) => (
                    <div key={msg.id} className="comment-bubble">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {msg.userName}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                            {formatDateTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{msg.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Caixa de Texto Igual à do Fórum */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Escreva a sua resposta..." 
                  value={reply} 
                  onChange={(e) => setReply(e.target.value)}
                  style={{ margin: 0, flex: 1, padding: '0.6rem 1rem' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={!reply.trim()}>
                  Enviar
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}