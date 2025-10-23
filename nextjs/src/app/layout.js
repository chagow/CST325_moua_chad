import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import ThemeProvider from './theme/ThemeProvider';
import ThemeToggle from './theme/ThemeToggle';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <header style={{ display: 'flex', justifyContent: 'flex-end', padding: 12 }}>
            <ThemeToggle />
          </header>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
