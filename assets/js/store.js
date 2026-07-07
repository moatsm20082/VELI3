/* ==========================================================================
   VELIX WEB SOLUTIONS — DATA STORE
   Lightweight localStorage-backed data layer that powers the dynamic
   Portfolio, News, Leads and Settings across the whole site + admin panel.

   IMPORTANT (read this before wiring a real backend):
   This is a client-side demo data layer. It lives in the visitor's own
   browser (localStorage), so it is perfect for demoing/managing content on
   one device, but it will NOT sync across different computers/phones or
   persist if someone clears their browser data. To make this a real
   production CMS, replace the functions in this file with calls to a real
   backend (Node/Express, Firebase, Supabase, etc.) — the rest of the site
   (portfolio.html, news.html, admin.html, chat-widget.js) already calls
   these functions, so you only need to change what's inside them.
   ========================================================================== */

(function (global) {
  const KEYS = {
    projects: 'velix_projects',
    news: 'velix_news',
    leads: 'velix_leads',
    settings: 'velix_settings',
    conversations: 'velix_conversations',
    activity: 'velix_activity',
    auth: 'velix_admin_auth'
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('VELIX store read error', key, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('VELIX store write error', key, e);
      return false;
    }
  }

  function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function logActivity(text, icon) {
    const activity = read(KEYS.activity, []);
    activity.unshift({ id: uid('act'), text, icon: icon || 'dot', at: new Date().toISOString() });
    write(KEYS.activity, activity.slice(0, 40));
  }

  /* ---------------------------------------------------------------------
     SEED DATA — shown the very first time, before an admin edits anything
     --------------------------------------------------------------------- */
  const SEED_PROJECTS = [
    {
      id: 'proj_seed_1',
      title: 'Marea — Fine Dining Restaurant',
      client: 'Marea Restaurant Group',
      category: 'Restaurant',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'Node.js'],
      completionDate: '2026-03-01',
      featured: true,
      description: 'A full digital experience for a fine-dining restaurant: real-time table reservations, a beautifully photographed digital menu, and an events booking flow — built to feel as considered as the food itself.',
      cover: '',
      gallery: { desktop: [], tablet: [], mobile: [] },
      beforeAfter: { before: '', after: '' }
    },
    {
      id: 'proj_seed_2',
      title: 'Origin — Specialty Coffee',
      client: 'Origin Coffee Roasters',
      category: 'E-Commerce',
      technologies: ['Shopify', 'Liquid', 'JavaScript'],
      completionDate: '2026-01-14',
      featured: true,
      description: 'An online store and brand hub for a specialty coffee roastery, with subscription ordering, a roast-origin storytelling section, and same-day delivery scheduling.',
      cover: '',
      gallery: { desktop: [], tablet: [], mobile: [] },
      beforeAfter: { before: '', after: '' }
    },
    {
      id: 'proj_seed_3',
      title: 'Meridian — Real Estate Platform',
      client: 'Meridian Properties',
      category: 'Real Estate',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      completionDate: '2025-11-20',
      featured: false,
      description: 'A luxury property platform with advanced map-based search, virtual tour embeds and a lead-qualification flow that routes serious buyers straight to an agent.',
      cover: '',
      gallery: { desktop: [], tablet: [], mobile: [] },
      beforeAfter: { before: '', after: '' }
    }
  ];

  const SEED_NEWS = [
    {
      id: 'news_seed_1',
      title: 'VELIX Web Solutions is now taking on Q3 projects',
      category: 'Studio News',
      cover: '',
      video: '',
      excerpt: "We're opening a limited number of Q3 project slots for new clients across Jordan and the Gulf.",
      body: "<p>We're opening a limited number of Q3 project slots for new clients across Jordan and the Gulf. If you've been thinking about a redesign or a new website built the right way, now is the time to reach out.</p><p>Every project starts with a free consultation — no pressure, just a clear plan.</p>",
      author: 'Moatasm Abdeen',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
    }
  ];

  const SEED_SETTINGS = {
    heroVideoUrl: '',
    heroPoster: '',
    seoTitle: 'VELIX Web Solutions — Premium Web Design & Development',
    seoDescription: 'VELIX Web Solutions designs and builds premium, high-performance websites for ambitious businesses across Jordan, Saudi Arabia, the UAE, Qatar, Kuwait and beyond.',
    darkMode: false,
    adminPassword: 'velix2026'
  };

  function ensureSeed() {
    if (!localStorage.getItem(KEYS.projects)) write(KEYS.projects, SEED_PROJECTS);
    if (!localStorage.getItem(KEYS.news)) write(KEYS.news, SEED_NEWS);
    if (!localStorage.getItem(KEYS.leads)) write(KEYS.leads, []);
    if (!localStorage.getItem(KEYS.settings)) write(KEYS.settings, SEED_SETTINGS);
    if (!localStorage.getItem(KEYS.conversations)) write(KEYS.conversations, []);
    if (!localStorage.getItem(KEYS.activity)) write(KEYS.activity, []);
  }
  ensureSeed();

  /* ---------------------------------------------------------------------
     PUBLIC API
     --------------------------------------------------------------------- */
  const VELIX = {
    KEYS,
    uid,
    logActivity,

    projects: {
      all() { return read(KEYS.projects, []); },
      get(id) { return this.all().find(p => p.id === id) || null; },
      featured() { return this.all().filter(p => p.featured); },
      byCategory(cat) { return cat ? this.all().filter(p => p.category === cat) : this.all(); },
      categories() { return [...new Set(this.all().map(p => p.category).filter(Boolean))]; },
      save(project) {
        const list = this.all();
        if (!project.id) {
          project.id = uid('proj');
          list.unshift(project);
          logActivity(`New project added: "${project.title}"`, 'project');
        } else {
          const idx = list.findIndex(p => p.id === project.id);
          if (idx > -1) list[idx] = project; else list.unshift(project);
          logActivity(`Project updated: "${project.title}"`, 'project');
        }
        write(KEYS.projects, list);
        return project;
      },
      remove(id) {
        const list = this.all();
        const target = list.find(p => p.id === id);
        write(KEYS.projects, list.filter(p => p.id !== id));
        if (target) logActivity(`Project deleted: "${target.title}"`, 'project');
      },
      related(project, limit) {
        limit = limit || 3;
        return this.all()
          .filter(p => p.id !== project.id && p.category === project.category)
          .concat(this.all().filter(p => p.id !== project.id && p.category !== project.category))
          .slice(0, limit);
      }
    },

    news: {
      all() { return read(KEYS.news, []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); },
      get(id) { return this.all().find(n => n.id === id) || null; },
      categories() { return [...new Set(this.all().map(n => n.category).filter(Boolean))]; },
      save(article) {
        const list = read(KEYS.news, []);
        if (!article.id) {
          article.id = uid('news');
          article.createdAt = article.createdAt || new Date().toISOString();
          list.unshift(article);
          logActivity(`New article published: "${article.title}"`, 'news');
        } else {
          const idx = list.findIndex(n => n.id === article.id);
          if (idx > -1) list[idx] = article; else list.unshift(article);
          logActivity(`Article updated: "${article.title}"`, 'news');
        }
        write(KEYS.news, list);
        return article;
      },
      remove(id) {
        const list = read(KEYS.news, []);
        const target = list.find(n => n.id === id);
        write(KEYS.news, list.filter(n => n.id !== id));
        if (target) logActivity(`Article deleted: "${target.title}"`, 'news');
      }
    },

    leads: {
      all() { return read(KEYS.leads, []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); },
      get(id) { return this.all().find(l => l.id === id) || null; },
      byStatus(status) { return this.all().filter(l => l.status === status); },
      create(lead) {
        const list = read(KEYS.leads, []);
        const record = Object.assign({
          id: uid('lead'),
          status: 'New',
          notes: [],
          createdAt: new Date().toISOString()
        }, lead);
        list.unshift(record);
        write(KEYS.leads, list);
        logActivity(`New lead captured: ${record.name || 'Unknown visitor'}`, 'lead');
        return record;
      },
      update(id, patch) {
        const list = read(KEYS.leads, []);
        const idx = list.findIndex(l => l.id === id);
        if (idx > -1) {
          list[idx] = Object.assign({}, list[idx], patch);
          write(KEYS.leads, list);
          logActivity(`Lead updated: ${list[idx].name || id}`, 'lead');
          return list[idx];
        }
        return null;
      },
      remove(id) {
        const list = read(KEYS.leads, []);
        write(KEYS.leads, list.filter(l => l.id !== id));
      },
      addNote(id, note) {
        const list = read(KEYS.leads, []);
        const idx = list.findIndex(l => l.id === id);
        if (idx > -1) {
          list[idx].notes = list[idx].notes || [];
          list[idx].notes.push({ text: note, at: new Date().toISOString() });
          write(KEYS.leads, list);
        }
      }
    },

    conversations: {
      all() { return read(KEYS.conversations, []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); },
      save(conversation) {
        const list = read(KEYS.conversations, []);
        conversation.updatedAt = new Date().toISOString();
        const idx = list.findIndex(c => c.id === conversation.id);
        if (idx > -1) list[idx] = conversation; else list.unshift(conversation);
        write(KEYS.conversations, list);
      }
    },

    activity: {
      all() { return read(KEYS.activity, []); }
    },

    settings: {
      get() { return read(KEYS.settings, SEED_SETTINGS); },
      save(patch) {
        const current = this.get();
        const updated = Object.assign({}, current, patch);
        write(KEYS.settings, updated);
        logActivity('Website settings updated', 'settings');
        return updated;
      }
    },

    auth: {
      isLoggedIn() { return sessionStorage.getItem(KEYS.auth) === 'true'; },
      login(password) {
        const ok = password === VELIX.settings.get().adminPassword;
        if (ok) sessionStorage.setItem(KEYS.auth, 'true');
        return ok;
      },
      logout() { sessionStorage.removeItem(KEYS.auth); }
    },

    /* Utility: read an <input type=file> as a base64 data URL (used for
       cover images, galleries, etc. — stored inline since there is no
       backend/file server in this demo data layer). */
    fileToDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  };

  global.VELIX = VELIX;
})(window);
