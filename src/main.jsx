import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import home from './pages/home.html?raw';
import resources from './pages/resources.html?raw';
import updates from './pages/updates.html?raw';
import community from './pages/community.html?raw';

const pages = {
  '/': home, '/index.html': home,
  '/resources': resources, '/resources.html': resources,
  '/updates': updates, '/updates.html': updates,
  '/community': community, '/community.html': community,
};
function getContent(path) {
  const html = pages[path] || home;
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  return body.innerHTML
    .replaceAll('index.html', '/')
    .replaceAll('resources.html', '/resources')
    .replaceAll('updates.html', '/updates')
    .replaceAll('community.html', '/community');
}
function App() {
  const [path, setPath] = useState(location.pathname);
  const [markup, setMarkup] = useState(getContent(path));
  useEffect(() => {
    function onPop() { setPath(location.pathname); }
    function onClick(e) {
      const a = e.target.closest('a');
      if (!a || a.target || a.origin !== location.origin || !pages[a.pathname]) return;
      e.preventDefault(); history.pushState({}, '', a.pathname + a.hash); setPath(a.pathname);
      if (a.hash) requestAnimationFrame(() => document.querySelector(a.hash)?.scrollIntoView({ behavior: 'smooth' }));
      else window.scrollTo(0, 0);
    }
    window.addEventListener('popstate', onPop); document.addEventListener('click', onClick);
    return () => { window.removeEventListener('popstate', onPop); document.removeEventListener('click', onClick); };
  }, []);
  useEffect(() => { setMarkup(getContent(path)); }, [path]);
  useEffect(() => {
    const currentPath = location.pathname === '/index.html' ? '/' : location.pathname;
    document.querySelectorAll('.primary-nav a').forEach(link => {
      const active = link.pathname === currentPath;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }, [markup]);
  useEffect(() => {
    const app = document.getElementById('site-content'); if (!app) return;
    const toggle = app.querySelector('.menu-toggle'), nav = app.querySelector('.primary-nav');
    const menu = () => { const open = toggle?.getAttribute('aria-expanded') !== 'true'; toggle?.setAttribute('aria-expanded', String(open)); toggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); nav?.classList.toggle('is-open', open); };
    toggle?.addEventListener('click', menu);
    const search = app.querySelector('#resource-search'), semester = app.querySelector('#semester-filter'), college = app.querySelector('#college-filter');
    const filter = () => {
      if (!search) return;
      let shown = 0;
      app.querySelectorAll('.resource-card').forEach(card => {
        const selected = semester?.value || 'all', type = card.dataset.semester || 'all';
        const selectedCollege = college?.value || 'all', cardCollege = card.dataset.college || 'all';
        const matchesSearch = (card.dataset.search || card.textContent).toLowerCase().includes(search.value.trim().toLowerCase());
        const matchesSemester = selected === 'all' || type === selected || type === 'both';
        const matchesCollege = selectedCollege === 'all' || cardCollege === selectedCollege;
        const match = matchesSearch && matchesSemester && matchesCollege;
        card.hidden = !match; if (match) shown++;
      });
      const count = app.querySelector('#resource-count'), empty = app.querySelector('#empty-state');
      if (count) count.textContent = `${shown} item${shown === 1 ? '' : 's'}`;
      if (empty) empty.hidden = shown !== 0;
    };
    search?.addEventListener('input', filter); semester?.addEventListener('change', filter); college?.addEventListener('change', filter); filter();
    return () => { toggle?.removeEventListener('click', menu); search?.removeEventListener('input', filter); semester?.removeEventListener('change', filter); college?.removeEventListener('change', filter); };
  }, [markup]);
  useEffect(() => {
    const title = path.includes('resources') ? 'Resources' : path.includes('updates') ? 'Projects' : path.includes('community') ? 'Community' : 'Personal Website';
    document.title = `DD FRIMPONG | ${title}`;
  }, [path]);
  return <div id="site-content" dangerouslySetInnerHTML={{ __html: markup }} />;
}

createRoot(document.getElementById('root')).render(<App />);

