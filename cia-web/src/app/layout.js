import { Montserrat } from 'next/font/google';
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ThemeProvider from "./components/ThemeProvider";
import { ModalProvider } from "./components/ModalProvider"; // <-- Importação do novo Modal

// Configurando a fonte Montserrat
const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'], 
  display: 'swap',
});

// Configurações de SEO
export const metadata = {
  title: "CIA - Pesquisa e Inovação",
  description: "Grupo de Pesquisa em Controle, Instrumentação Biomédica e Inteligência Artificial do IFPR.",
};

export default function RootLayout({ children }) {
  return (
    // O suppressHydrationWarning é necessário para o next-themes funcionar perfeitamente
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={montserrat.className}>
        <ThemeProvider> {/* <-- Envolve o site com o provedor de temas */}
          <ModalProvider> {/* <-- Envolve o site com o provedor de modais/alertas */}
            <div className="ambient-glow"></div> 
            
            <Navbar />
            
            {/* Aqui no {children} é onde o Next.js vai injetar as páginas */}
            {children} 
            
            <Footer />
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}