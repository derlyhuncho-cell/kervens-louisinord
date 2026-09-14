import './styles.css';

export const metadata = { title: 'Derly Huncho', description: 'Sit ofisyèl Derly Huncho' };

export default function RootLayout({ children }) {
  return <html lang="ht"><body>{children}</body></html>;
}
