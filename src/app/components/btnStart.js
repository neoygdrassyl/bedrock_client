import React, { useEffect, useState } from 'react';

export default function BtnStart() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollPage = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      className={`btn-scroll-top ${show ? 'show' : ''}`}
      onClick={scrollPage}
      aria-label="Ir al inicio"
      title="Ir al inicio"
    >
      <i className="fas fa-chevron-up" aria-hidden="true" />
    </button>
  );
}
