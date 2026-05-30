"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, loginUser, registerUser, loginWithGoogle, updateUserProfile, completeGoogleRegistration } from '../firebase';

export default function LoginPage() {
    const router = useRouter();
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Estados para o fluxo do Google
    const [isGoogleConfirming, setIsGoogleConfirming] = useState(false);
    const [googleAuthData, setGoogleAuthData] = useState(null);
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegistering) {
                await registerUser(email, password);
                if (auth.currentUser) {
                    await updateUserProfile(auth.currentUser.uid, { 
                        firstName: firstName.trim(), 
                        lastName: lastName.trim(),
                        role: 'user'
                    });
                }
            } else {
                await loginUser(email, password);
            }
            router.push('/');
            router.refresh(); 
        } catch (err) {
            setError(isRegistering ? "Erro ao criar conta." : "Credenciais inválidas.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            const { userCredential, isNewUser, suggestedFirstName, suggestedLastName } = await loginWithGoogle();

            if (isNewUser) {
                // Se é conta nova, preenche os nomes, salva os dados auth e muda a tela
                setFirstName(suggestedFirstName);
                setLastName(suggestedLastName);
                setGoogleAuthData({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email
                });
                setIsGoogleConfirming(true);
                setLoading(false);
            } else {
                // Se já tinha conta, entra direto
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') {
                setLoading(false);
            } else {
                setError("Erro ao comunicar com o Google.");
                setLoading(false);
            }
        }
    };

    // Função que finaliza a conta do Google APÓS a confirmação dos nomes
    const handleConfirmGoogle = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await completeGoogleRegistration(
                googleAuthData.uid, 
                googleAuthData.email, 
                firstName.trim(), 
                lastName.trim()
            );
            router.push('/');
            router.refresh();
        } catch (err) {
            setError("Erro ao finalizar o cadastro.");
            setLoading(false);
        }
    };

    return (
        /* Fundo da tela ligeiramente cinza para destacar o card branco */
        <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' }}>
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <div className="cta-box" style={{ maxWidth: '450px', margin: '0 auto', padding: '3rem 2rem', textAlign: 'center', background: '#ffffff' }}>
                    
                    {/* TELA 2: CONFIRMAÇÃO DO GOOGLE */}
                    {isGoogleConfirming ? (
                        <>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Confirme seus Dados</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                                Quase lá! Revise como seu nome aparecerá para os outros pesquisadores.
                            </p>

                            {error && <div style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500' }}>{error}</div>}

                            <form onSubmit={handleConfirmGoogle} style={{ textAlign: 'left' }}>
                                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label">E-mail (Fornecido pelo Google)</label>
                                    <input type="email" className="form-input" value={googleAuthData?.email} disabled style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--bg-surface)' }} />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                        <label className="form-label">Primeiro Nome</label>
                                        <input type="text" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                    </div>
                                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                        <label className="form-label">Último Nome</label>
                                        <input type="text" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                    {loading ? 'Finalizando...' : 'Concluir e Entrar'}
                                </button>
                            </form>
                        </>
                    ) : (
                        /* TELA 1: LOGIN / REGISTRO NORMAL */
                        <>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                {isRegistering ? 'Criar uma Conta' : 'Acesso ao Portal'}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                                {isRegistering ? 'Junte-se à nossa comunidade de pesquisa.' : 'Entre com suas credenciais de pesquisador.'}
                            </p>

                            {error && <div style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500' }}>{error}</div>}

                            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                                {isRegistering && (
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                                        <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                            <label className="form-label">Nome</label>
                                            <input type="text" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                        </div>
                                        <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                            <label className="form-label">Sobrenome</label>
                                            <input type="text" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                        </div>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">E-mail</label>
                                    <input type="email" className="form-input" placeholder="nome@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '2rem' }}>
                                    <label className="form-label">Senha</label>
                                    <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                    {loading ? 'Autenticando...' : (isRegistering ? 'Registrar' : 'Entrar')}
                                </button>
                            </form>

                            <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>OU</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                            </div>

                            <button onClick={handleGoogleSignIn} className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }} disabled={loading}>
                                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                Continuar com Google
                            </button>

                            <p style={{ marginTop: '2rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                {isRegistering ? 'Já tem uma conta? ' : 'Ainda não tem acesso? '}
                                <button onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>
                                    {isRegistering ? 'Faça login' : 'Registre-se'}
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}