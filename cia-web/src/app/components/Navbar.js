"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, isAdmin, logoutUser, getUserProfile, updateUserProfile } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from 'next-themes'; 

// IMPORTA O NOSSO NOVO SISTEMA DE MODAIS (Na mesma pasta)
import { useModal } from './ModalProvider'; 

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    
    // Temas
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false); 

    // Estados do Menu Flutuante do Perfil
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editLattes, setEditLattes] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // INICIA AS FUNÇÕES DO MODAL
    const { showAlert, showConfirm } = useModal();

    useEffect(() => {
        setMounted(true);
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const adminStatus = await isAdmin(currentUser.uid);
                setUserIsAdmin(adminStatus);
                
                const userProf = await getUserProfile(currentUser.uid);
                if (userProf) {
                    setProfile(userProf);
                    setEditFirstName(userProf.firstName || '');
                    setEditLastName(userProf.lastName || '');
                    setEditLattes(userProf.lattesLink || '');
                }
            } else {
                setUser(null);
                setProfile(null);
                setUserIsAdmin(false);
            }
            setIsChecking(false);
        });
        return () => unsubscribe();
    }, []);

    // LOGOUT COM CONFIRMAÇÃO ELEGANTE
    const handleLogout = (e) => {
        e.preventDefault();
        showConfirm(
            "Sair da Conta", 
            "Tem certeza que deseja sair do sistema?", 
            async () => {
                await logoutUser();
                window.location.href = '/login';
            }
        );
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            await updateUserProfile(user.uid, {
                firstName: editFirstName,
                lastName: editLastName,
                lattesLink: editLattes
            });
            setProfile({ ...profile, firstName: editFirstName, lastName: editLastName, lattesLink: editLattes });
            setIsProfileMenuOpen(false);
            // Opcional: Pode até colocar um showAlert de sucesso aqui se quiser!
            // showAlert("Sucesso", "Perfil atualizado com sucesso!");
        } catch (error) {
            // ALERTA DE ERRO USANDO O MODAL GLOBAL
            showAlert("Erro", "Não foi possível salvar as alterações do perfil. Tente novamente.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const closeMenu = () => {
        setIsMobileOpen(false);
        setIsThemeMenuOpen(false); 
    };

    const toggleProfileMenu = async () => {
        const willOpen = !isProfileMenuOpen;
        setIsProfileMenuOpen(willOpen);

        if (willOpen && user) {
            const userProf = await getUserProfile(user.uid);
            if (userProf) {
                setProfile(userProf);
                setEditFirstName(userProf.firstName || '');
                setEditLastName(userProf.lastName || '');
                setEditLattes(userProf.lattesLink || '');
            }
        }
    };

    const getInitial = () => {
        if (profile?.firstName) return profile.firstName.charAt(0).toUpperCase();
        return user?.email?.charAt(0).toUpperCase() || 'U';
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setIsThemeMenuOpen(false);
    };

    return (
        <>
            <header className="header" id="header" style={{ borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 100, background: 'var(--bg-surface)' }}>
                <div className="container nav-container">
                    <Link href="/" className="logo" onClick={closeMenu}>CIA<span className="logo-dot">.</span></Link>
                    
                    <button className={`mobile-menu ${isMobileOpen ? 'active' : ''}`} onClick={() => setIsMobileOpen(!isMobileOpen)}>
                        <span className="line"></span><span className="line"></span><span className="line"></span>
                    </button>
                    
                    <nav className={`nav-menu ${isMobileOpen ? 'active' : ''}`}>
                        <ul className="nav-list">
                            <li><Link href="/" className="nav-link" onClick={closeMenu}>Home</Link></li>
                            <li><Link href="/sobre" className="nav-link" onClick={closeMenu}>Sobre</Link></li>
                            <li><Link href="/projetos" className="nav-link" onClick={closeMenu}>Projetos</Link></li>
                            <li><Link href="/forum" className="nav-link" onClick={closeMenu}>Fórum</Link></li>
                            
                            {/* MENU DE TEMAS (DROPDOWN) */}
                            {mounted && (
                                <li style={{ position: 'relative' }}>
                                    <button 
                                        onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem', transition: '0.2s' }}
                                        title="Escolher Tema"
                                    >
                                        🎨 Tema
                                    </button>
                                    
                                    {isThemeMenuOpen && (
                                        <div style={{
                                            position: 'absolute', top: '100%', right: '50%', transform: 'translateX(50%)', marginTop: '15px',
                                            background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                            borderRadius: '12px', padding: '0.5rem', width: '130px',
                                            boxShadow: 'var(--shadow-card)', zIndex: 1000,
                                            display: 'flex', flexDirection: 'column', gap: '0.2rem'
                                        }}>
                                            <button 
                                                onClick={() => handleThemeChange('light')}
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', textAlign: 'left', background: theme === 'light' ? 'var(--bg-base)' : 'transparent', border: 'none', borderRadius: '8px', color: theme === 'light' ? 'var(--accent)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: '0.2s' }}
                                            >☀️ Claro</button>
                                            
                                            <button 
                                                onClick={() => handleThemeChange('dark')}
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', textAlign: 'left', background: theme === 'dark' ? 'var(--bg-base)' : 'transparent', border: 'none', borderRadius: '8px', color: theme === 'dark' ? 'var(--accent)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: '0.2s' }}
                                            >🌙 Dark</button>
                                            
                                            <button 
                                                onClick={() => handleThemeChange('magenta')}
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', textAlign: 'left', background: theme === 'magenta' ? 'var(--bg-base)' : 'transparent', border: 'none', borderRadius: '8px', color: theme === 'magenta' ? 'var(--accent)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: '0.2s' }}
                                            >🌺 Magenta</button>
                                        </div>
                                    )}
                                </li>
                            )}

                            {!isChecking && (
                                !user ? (
                                    <li><Link href="/login" className="btn btn-primary btn-sm nav-btn" onClick={closeMenu}>Login</Link></li>
                                ) : (
                                    <>
                                        {userIsAdmin && (
                                            <li><Link href="/admin" className="nav-link" style={{ color: 'var(--accent)', fontWeight: 600 }} onClick={closeMenu}>Painel Admin</Link></li>
                                        )}
                                        
                                        <li className="user-profile-mobile" style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center' }}>
                                            <div 
                                                onClick={toggleProfileMenu}
                                                style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', transition: 'transform 0.2s' }}
                                                title="Meu Perfil"
                                            >
                                                {getInitial()}
                                            </div>
                                        </li>
                                    </>
                                )
                            )}
                        </ul>
                    </nav>
                </div>
            </header>

            {/* MODAL DE PERFIL */}
            {isProfileMenuOpen && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', 
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{ 
                        background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', 
                        padding: '2rem', width: '100%', maxWidth: '420px', 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' 
                    }}>
                        
                        <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                            Configurações do Perfil
                        </h4>
                        
                        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Primeiro Nome</label>
                                <input type="text" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Último Nome</label>
                                <input type="text" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Link do Lattes (URL)</label>
                                <input type="url" value={editLattes} onChange={(e) => setEditLattes(e.target.value)} placeholder="http://lattes.cnpq.br/..." style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none' }} />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsProfileMenuOpen(false)} className="btn btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }} disabled={isSavingProfile}>
                                    {isSavingProfile ? 'Salvando...' : 'Atualizar Dados'}
                                </button>
                            </div>
                        </form>

                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: '0.2s', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                Sair da Conta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}