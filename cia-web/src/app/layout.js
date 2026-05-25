import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Configurações de SEO (Aparece na aba do navegador e no Google)
export const metadata = {
  title: "CIA - Pesquisa e Inovação",
  description: "Grupo de Pesquisa em Controle, Instrumentação Biomédica e Inteligência Artificial do IFPR.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="ambient-glow"></div> {/* Efeito visual de fundo em todas as páginas */}
        
        <Navbar />
        
        {/* Aqui no {children} é onde o Next.js vai injetar o page.js que estiver sendo acessado */}
        {children} 
        
        <Footer />
      </body>
    </html>
  );
}