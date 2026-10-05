import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:{default:'Antojitos Cakes',template:'%s · Antojitos Cakes'},referrer:'no-referrer',description:'Tu próximo antojo, a un pedido de distancia.',icons:{icon:'/brand/logo.jpg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
