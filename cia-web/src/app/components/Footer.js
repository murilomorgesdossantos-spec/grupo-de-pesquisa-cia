import Link from 'next/link';
import './navigation.css';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <div className="site-footer-top">
                    <div className="site-footer-description"><span className="site-footer-eyebrow"><span aria-hidden="true" /> GRUPO DE PESQUISA CIA</span><p>Controle, Instrumentação Biomédica<br className="site-footer-break" /> e Inteligência Artificial.</p></div>
                    <div className="site-footer-campus"><span className="site-footer-label">ONDE A CIÊNCIA ACONTECE</span><p>Instituto Federal do Paraná<br /><span>Campus Campo Largo</span></p></div>
                    <nav className="site-footer-links" aria-label="Navegação do rodapé"><Link href="/sobre">Sobre <span aria-hidden="true">↗</span></Link><Link href="/projetos">Projetos <span aria-hidden="true">↗</span></Link><Link href="/forum">Fórum <span aria-hidden="true">↗</span></Link></nav>
                </div>
                <div className="site-footer-wordmark" aria-hidden="true">CIA<span>.</span></div>
                <div className="site-footer-bottom"><p>&copy; 2026 Grupo de Pesquisa CIA - IFPR. Todos os direitos reservados.</p><Link href="/" aria-label="CIA — voltar à página inicial">Ciência em movimento <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 15 15 5H5m10 0v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></Link></div>
            </div>
        </footer>
    );
}
