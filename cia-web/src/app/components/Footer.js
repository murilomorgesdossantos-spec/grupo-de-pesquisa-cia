import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <Link href="/" className="logo">CIA<span className="logo-dot">.</span></Link>
                        <p>Controle, Instrumentação Biomédica e Inteligência Artificial.</p>
                    </div>
                    <div className="footer-links">
                        <Link href="/sobre">Sobre</Link>
                        <Link href="/projetos">Projetos</Link>
                        <Link href="/forum">Fórum</Link>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Grupo de Pesquisa CIA - IFPR. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}