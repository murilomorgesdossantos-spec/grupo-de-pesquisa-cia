"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from 'next-themes';
import { auth, isAdmin, logoutUser, getUserProfile, updateUserProfile } from '../firebase';
import { useModal } from './ModalProvider';
import './navigation.css';

const links = [{ href: '/', label: 'Home' }, { href: '/sobre', label: 'Sobre' }, { href: '/projetos', label: 'Projetos' }, { href: '/forum', label: 'Fórum' }];
const themes = [{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Dark' }, { value: 'magenta', label: 'Magenta' }];
const subscribeMounted = () => () => {};

function ArrowIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { resolvedTheme, setTheme } = useTheme();
    const theme = resolvedTheme;
    const mounted = useSyncExternalStore(subscribeMounted, () => true, () => false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editLattes, setEditLattes] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState('');
    const themeMenuRef = useRef(null);
    const themeButtonRef = useRef(null);
    const mobileButtonRef = useRef(null);
    const profileButtonRef = useRef(null);
    const profileDialogRef = useRef(null);
    const { showConfirm } = useModal();

    useEffect(() => {
        let active = true;
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setUserIsAdmin(false);
            if (!currentUser) { setProfile(null); setIsChecking(false); return; }
            try {
                const [adminStatus, userProf] = await Promise.all([isAdmin(currentUser.uid), getUserProfile(currentUser.uid)]);
                if (!active || auth.currentUser?.uid !== currentUser.uid) return;
                setUserIsAdmin(adminStatus);
                setProfile(userProf);
                setEditFirstName(userProf?.firstName || '');
                setEditLastName(userProf?.lastName || '');
                setEditLattes(userProf?.lattesLink || '');
            } catch {
                // Authentication remains usable if extra profile data is temporarily unavailable.
            } finally { if (active) setIsChecking(false); }
        });
        return () => { active = false; unsubscribe(); };
    }, []);

    useEffect(() => {
        if (!isThemeMenuOpen) return;
        (themeMenuRef.current?.querySelector('[aria-checked="true"]') || themeMenuRef.current?.querySelector('[role="menuitemradio"]'))?.focus();
        const closeOutside = (event) => { if (!themeMenuRef.current?.contains(event.target)) setIsThemeMenuOpen(false); };
        document.addEventListener('pointerdown', closeOutside);
        return () => document.removeEventListener('pointerdown', closeOutside);
    }, [isThemeMenuOpen]);

    useEffect(() => {
        if (!isProfileMenuOpen) return;
        const previouslyFocused = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        const profileTrigger = profileButtonRef.current;
        document.body.style.overflow = 'hidden';
        profileDialogRef.current?.querySelector('input')?.focus();
        const handleKey = (event) => {
            if (event.key === 'Escape') { setIsProfileMenuOpen(false); return; }
            if (event.key !== 'Tab') return;
            const focusable = profileDialogRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href]');
            if (!focusable?.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKey);
            (profileTrigger || previouslyFocused)?.focus();
        };
    }, [isProfileMenuOpen]);

    const closeMenu = () => { setIsMobileOpen(false); setIsThemeMenuOpen(false); };
    const handleLogout = () => {
        setIsProfileMenuOpen(false);
        closeMenu();
        showConfirm('Sair da Conta', 'Tem certeza que deseja sair do sistema?', async () => {
            await logoutUser();
            window.location.href = '/login';
        });
    };
    const handleSaveProfile = async (event) => {
        event.preventDefault();
        if (!user || isSavingProfile) return;
        setIsSavingProfile(true);
        setProfileError('');
        try {
            const changes = { firstName: editFirstName, lastName: editLastName, lattesLink: editLattes };
            await updateUserProfile(user.uid, changes);
            setProfile({ ...profile, ...changes });
            setIsProfileMenuOpen(false);
        } catch { setProfileError('Não foi possível salvar as alterações do perfil. Tente novamente.'); }
        finally { setIsSavingProfile(false); }
    };
    const openProfile = async () => {
        setProfileError('');
        setIsThemeMenuOpen(false);
        setIsProfileMenuOpen(true);
        try {
            const userProf = await getUserProfile(user.uid);
            if (userProf) {
                setProfile(userProf);
                setEditFirstName(userProf.firstName || '');
                setEditLastName(userProf.lastName || '');
                setEditLattes(userProf.lattesLink || '');
            }
        } catch { setProfileError('Não foi possível atualizar os dados do perfil. Tente novamente.'); }
    };
    const handleThemeChange = (newTheme) => { setTheme(newTheme); setIsThemeMenuOpen(false); themeButtonRef.current?.focus(); };
    const handleThemeKeys = (event) => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const options = Array.from(themeMenuRef.current.querySelectorAll('[role="menuitemradio"]'));
        const index = options.indexOf(document.activeElement);
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[nextIndex]?.focus();
    };
    const handleHeaderKeys = (event) => {
        if (event.key !== 'Escape') return;
        if (isThemeMenuOpen) { setIsThemeMenuOpen(false); themeButtonRef.current?.focus(); }
        else if (isMobileOpen) { setIsMobileOpen(false); mobileButtonRef.current?.focus(); }
    };
    const initial = profile?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
    const isActive = (href) => href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(`${href}/`);

    return (
        <>
            <a className="nav-skip-link" href="#main-content">Pular para o conteúdo</a>
            <header className="site-header" id="header" onKeyDown={handleHeaderKeys}>
                <div className="site-header-inner">
                    <Link href="/" className="site-wordmark" onClick={closeMenu} aria-label="CIA — página inicial"><span className="site-wordmark-logo">CIA<span>.</span></span><span className="site-wordmark-caption">GRUPO DE<br />PESQUISA</span></Link>
                    <button ref={mobileButtonRef} type="button" className={`nav-mobile-toggle ${isMobileOpen ? 'is-open' : ''}`} onClick={() => setIsMobileOpen(!isMobileOpen)} aria-expanded={isMobileOpen} aria-controls="site-navigation" aria-label={isMobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}><span /><span /></button>
                    <nav id="site-navigation" className={`nav-navigation ${isMobileOpen ? 'is-open' : ''}`} aria-label="Navegação principal">
                        <ul className="nav-links">
                            {links.map(({ href, label }) => <li key={href}><Link href={href} className="nav-page-link" aria-current={isActive(href) ? 'page' : undefined} onClick={closeMenu}>{label}</Link></li>)}
                            {userIsAdmin && <li><Link href="/admin" className="nav-page-link nav-admin-link" aria-current={isActive('/admin') ? 'page' : undefined} onClick={closeMenu}>Painel Admin</Link></li>}
                        </ul>
                        <div className="nav-actions">
                            {mounted && <div className="nav-theme" ref={themeMenuRef} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsThemeMenuOpen(false); }}>
                                <button ref={themeButtonRef} type="button" className="nav-theme-trigger" onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} aria-label="Escolher tema de aparência" aria-expanded={isThemeMenuOpen} aria-haspopup="menu" aria-controls="nav-theme-options">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" /><path d="M12 4a8 8 0 0 1 0 16V4Z" fill="currentColor" /></svg><span>Tema</span><svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                                </button>
                                {isThemeMenuOpen && <div id="nav-theme-options" className="nav-theme-options" role="menu" aria-label="Tema de aparência" onKeyDown={handleThemeKeys}>
                                    {themes.map(({ value, label }) => <button key={value} type="button" role="menuitemradio" aria-checked={theme === value} onClick={() => handleThemeChange(value)}><span className={`nav-theme-swatch nav-theme-swatch-${value}`} aria-hidden="true" />{label}{theme === value && <svg className="nav-theme-check" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}</button>)}
                                </div>}
                            </div>}
                            {isChecking ? <span className="nav-auth-loading" aria-label="Verificando sessão" /> : !user ? <Link href="/login" className="nav-login" onClick={closeMenu}>Entrar <ArrowIcon /></Link> : <button ref={profileButtonRef} type="button" className="nav-profile-trigger" onClick={openProfile} aria-label="Abrir configurações do meu perfil" aria-haspopup="dialog">{initial}</button>}
                        </div>
                    </nav>
                </div>
            </header>
            {isProfileMenuOpen && <div className="nav-profile-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setIsProfileMenuOpen(false); }}>
                <section ref={profileDialogRef} className="nav-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="nav-profile-title">
                    <div className="nav-profile-heading"><div><p className="nav-profile-eyebrow">SUA CONTA CIA</p><h2 id="nav-profile-title">Configurações do Perfil</h2></div><button type="button" className="nav-profile-close" onClick={() => setIsProfileMenuOpen(false)} aria-label="Fechar configurações do perfil"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button></div>
                    <form onSubmit={handleSaveProfile} className="nav-profile-form" aria-busy={isSavingProfile}>
                        <div><label htmlFor="nav-first-name">Primeiro Nome</label><input id="nav-first-name" name="given-name" autoComplete="given-name" value={editFirstName} onChange={(event) => setEditFirstName(event.target.value)} /></div>
                        <div><label htmlFor="nav-last-name">Último Nome</label><input id="nav-last-name" name="family-name" autoComplete="family-name" value={editLastName} onChange={(event) => setEditLastName(event.target.value)} /></div>
                        <div><label htmlFor="nav-lattes">Link do Lattes (URL)</label><input id="nav-lattes" name="lattes" type="url" value={editLattes} onChange={(event) => setEditLattes(event.target.value)} placeholder="http://lattes.cnpq.br/..." /></div>
                        {profileError && <p className="nav-profile-error" role="alert">{profileError}</p>}
                        <div className="nav-profile-buttons"><button type="button" className="nav-profile-cancel" onClick={() => setIsProfileMenuOpen(false)}>Cancelar</button><button type="submit" className="nav-profile-save" disabled={isSavingProfile}>{isSavingProfile ? 'Salvando...' : 'Atualizar Dados'}</button></div>
                    </form>
                    <div className="nav-profile-logout"><button type="button" onClick={handleLogout}>Sair da Conta <ArrowIcon /></button></div>
                </section>
            </div>}
        </>
    );
}
