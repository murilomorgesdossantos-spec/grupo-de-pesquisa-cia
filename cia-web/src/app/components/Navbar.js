"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, isAdmin, logoutUser, getUserProfile, updateUserProfile } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    
    // Estados do Menu Flutuante
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editLattes, setEditLattes] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const adminStatus = await isAdmin(currentUser.uid);
                setUserIsAdmin(adminStatus);
                
                // Busca inicial
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

    const handleLogout = async (e) => {
        e.preventDefault();
        await logoutUser();
        window.location.href = '/login';
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
        } catch (error) {
            alert("Erro ao salvar perfil.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const closeMenu = () => {
        setIsMobileOpen(false);
        setIsProfileMenuOpen(false);
    };

    // MÁGICA AQUI: Garante que os dados estão atualizados ao abrir o menu
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
        return user?.email.charAt(0).toUpperCase();
    };

    return (
        <header className="header" id="header" style={{ background: 'rgba(6, 9, 19, 0.95)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
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
                        
                        {!isChecking && (
                            !user ? (
                                <li><Link href="/login" className="btn btn-primary btn-sm nav-btn" onClick={closeMenu}>Login</Link></li>
                            ) : (
                                <>
                                    {userIsAdmin && (
                                        <li><Link href="/admin" className="nav-link" style={{ color: 'var(--accent)', fontWeight: 600 }} onClick={closeMenu}>Painel Admin</Link></li>
                                    )}
                                    
                                    <li style={{ position: 'relative', marginLeft: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="user-profile-mobile">
                                        <div 
                                            onClick={toggleProfileMenu}
                                            style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                                        >
                                            {getInitial()}
                                        </div>
                                        
                                        {isProfileMenuOpen && (
                                            <div className="profile-dropdown-box" style={{ position: 'absolute', top: '50px', right: '0', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', width: '280px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1000 }}>
                                                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Meu Perfil</h4>
                                                
                                                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Primeiro Nome</label>
                                                        <input type="text" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Último Nome</label>
                                                        <input type="text" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Link do Lattes (URL)</label>
                                                        <input type="url" value={editLattes} onChange={(e) => setEditLattes(e.target.value)} placeholder="http://lattes.cnpq.br/..." style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                                                    </div>
                                                    
                                                    <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }} disabled={isSavingProfile}>
                                                        {isSavingProfile ? 'Salvando...' : 'Atualizar Dados'}
                                                    </button>
                                                </form>

                                                <button onClick={handleLogout} style={{ width: '100%', marginTop: '0.5rem', background: 'none', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}>
                                                    Sair da Conta
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                </>
                            )
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}