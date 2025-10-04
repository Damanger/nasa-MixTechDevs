import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { DEFAULT_LANG, LANG_EVENT, detectClientLanguage, getLanguageSafe, getTranslations } from '../i18n/translations.js';
import ChromaGrid from './ChromaGrid.jsx';

const BASE_MEMBERS = [
  { image: '/juan.webp', title: 'Juan Velasco', handle: '@juanramon-vr2406', borderColor: '#3B82F6', gradient: 'linear-gradient(145deg, #3B82F6, #000)', url: 'https://www.linkedin.com/in/juanramon-vr2406/', roleKey: 'pm' },
  { image: '/jovani.webp', title: 'Jovani Gallegos', handle: '@', borderColor: '#EF4444', gradient: 'linear-gradient(180deg, #EF4444, #000)', url: '', roleKey: 'ds' },
  { image: '/axel.webp', title: 'Axel García', handle: '@aisaac-gargon', borderColor: '#F59E0B', gradient: 'linear-gradient(145deg, #F59E0B, #000)', url: 'https://www.linkedin.com/in/aisaac-gargon/', roleKey: 'be' },
  { image: '/emanuel.webp', title: 'Emanuel Rosales', handle: '@emanuelazucarado', borderColor: '#8B5CF6', gradient: 'linear-gradient(180deg, #8B5CF6, #000)', url: 'https://www.instagram.com/emanuelazucarado?igsh=ZmFzZGdvZ2ozMW5n', roleKey: 'uiux' },
  { image: '/denisse.webp', title: 'Denisse García', handle: '@karen-denisse-garcía-lópez-50607235b', borderColor: '#EC4899', gradient: 'linear-gradient(145deg, #EC4899, #000)', url: 'https://www.linkedin.com/in/karen-denisse-garcía-lópez-50607235b/', roleKey: 'content' },
  { image: '/omar.webp', title: 'Omar Cruz', handle: '@omar-cruzr97', borderColor: '#10B981', gradient: 'linear-gradient(180deg, #10B981, #000)', url: 'https://www.linkedin.com/in/omar-cruzr97/', roleKey: 'felead' }
];

export default function TeamGrid({ initialLang = DEFAULT_LANG, radius = 300, damping = 0.45, fadeOut = 0.6, ease = 'power3.out' }) {
  const [lang, setLang] = useState(getLanguageSafe(initialLang));

  useEffect(() => {
    const preferred = detectClientLanguage(initialLang);
    setLang((p) => (p === preferred ? p : preferred));
    const h = (e) => setLang(getLanguageSafe(e.detail?.lang));
    window.addEventListener(LANG_EVENT, h);
    return () => window.removeEventListener(LANG_EVENT, h);
  }, [initialLang]);

  const items = useMemo(() => {
    const roles = getTranslations(lang).team.roles;
    return BASE_MEMBERS.map((m) => ({
      ...m,
      subtitle: roles[m.roleKey],
      role: roles[m.roleKey]
    }));
  }, [lang]);

  return (
    <motion.div
      style={{ position: 'relative' }}
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChromaGrid client:only="react" items={items} radius={radius} damping={damping} fadeOut={fadeOut} ease={ease} />
    </motion.div>
  );
}
