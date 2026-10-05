'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="wrap section"><div className="empty-state"><h1>No pudimos cargar la página.</h1><p>Vuelve a intentar en un momento.</p><button className="btn" onClick={reset}>Reintentar</button><a className="text-link" href="/">Volver al inicio</a></div></main>}
