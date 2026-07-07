/* ==========================================================================
   VELIX WEB SOLUTIONS — LIVE CHAT WIDGET
   A floating chat assistant that greets visitors, answers common questions
   like a professional sales rep, and — when it can't close the sale —
   collects lead details and pushes them straight into the Admin Dashboard.

   NOTE ON HONESTY: this runs entirely in the browser with a rule/keyword
   matching engine. It is NOT connected to a live AI model — doing that
   safely requires a backend to hold the API key. The structure below
   (answer() function) is written so it's a drop-in place to instead call
   your own backend endpoint that proxies to the Claude API once you have
   one running.
   ========================================================================== */

(function () {
  const CONTACT = {
    phone: '+962 79 969 1748',
    phoneHref: '+962799691748',
    email: 'velixweb.official@gmail.com'
  };

  function getLang() {
    return (window.VELIX_I18N && window.VELIX_I18N.getLang) ? window.VELIX_I18N.getLang() : 'en';
  }

  // Each FAQ entry is matched against a shared, bilingual keyword list, then
  // answered back in whichever language the interface is currently set to.
  const FAQ = [
    {
      keys: ['price', 'cost', 'how much', 'pricing', 'budget', 'quote', 'سعر', 'اسعار', 'تكلفة', 'فلوس'],
      en: "Pricing depends on scope, but here's a general guide:<br><br>• <strong>Landing page:</strong> starting around $400<br>• <strong>Business / corporate website:</strong> starting around $900<br>• <strong>E-commerce store:</strong> starting around $1,500<br>• <strong>Custom platform with admin dashboard:</strong> custom quote<br><br>Every project includes design, development, mobile optimization and a review round. Want me to put together an exact quote for your project?",
      ar: "تعتمد التكلفة على حجم المشروع، لكن إليك دليلًا عامًا:<br><br>• <strong>صفحة هبوط:</strong> تبدأ من حوالي 400$<br>• <strong>موقع شركة / أعمال:</strong> يبدأ من حوالي 900$<br>• <strong>متجر إلكتروني:</strong> يبدأ من حوالي 1500$<br>• <strong>منصة مخصصة مع لوحة تحكم:</strong> عرض سعر مخصص<br><br>كل مشروع يشمل التصميم والتطوير والتحسين للجوال وجولة مراجعة. هل تريدني أن أجهز لك عرض سعر دقيق لمشروعك؟"
    },
    {
      keys: ['how long', 'timeline', 'duration', 'delivery time', 'how many days', 'how many weeks', 'مدة', 'وقت التسليم', 'كم يوم', 'كم اسبوع'],
      en: "Most landing pages take <strong>1–2 weeks</strong>, business websites <strong>2–4 weeks</strong>, and larger platforms with dashboards or e-commerce <strong>4–8 weeks</strong> — depending on content readiness and revisions. I can give you a firm timeline once I know a bit more about your project.",
      ar: "معظم صفحات الهبوط تستغرق <strong>1-2 أسبوع</strong>، مواقع الشركات <strong>2-4 أسابيع</strong>، والمنصات الأكبر مع لوحات التحكم أو المتاجر الإلكترونية <strong>4-8 أسابيع</strong> — حسب جاهزية المحتوى والتعديلات. يمكنني إعطاؤك جدولًا زمنيًا دقيقًا بعد معرفة المزيد عن مشروعك."
    },
    {
      keys: ['service', 'what do you do', 'what do you offer', 'offer', 'خدمات', 'شو بتقدموا', 'شغلكم'],
      en: "VELIX builds premium, high-performance websites end-to-end: web design, front-end &amp; back-end development, e-commerce, landing pages, corporate websites, SEO, security hardening and ongoing maintenance. Basically — everything your business needs to go online and actually convert visitors into customers.",
      ar: "تبني فيليكس مواقع متميزة وعالية الأداء من الألف إلى الياء: تصميم المواقع، تطوير الواجهات الأمامية والخلفية، المتاجر الإلكترونية، صفحات الهبوط، مواقع الشركات، تحسين محركات البحث، تعزيز الأمان والصيانة المستمرة. باختصار — كل ما يحتاجه عملك للانتقال إلى الإنترنت وتحويل الزوار فعليًا إلى عملاء."
    },
    {
      keys: ['technology', 'tech stack', 'stack', 'framework', 'built with', 'تقنيات'],
      en: "We choose the right stack for the job rather than forcing one tool everywhere — typically modern HTML5/CSS3/JavaScript on the front end, and React, Node.js or Shopify/WordPress on the back end depending on your needs, with a strong focus on speed and security.",
      ar: "نختار التقنية المناسبة لكل مشروع بدلًا من فرض أداة واحدة على الجميع — عادةً HTML5/CSS3/JavaScript حديثة في الواجهة الأمامية، وReact أو Node.js أو Shopify/WordPress في الخلفية حسب احتياجاتك، مع تركيز قوي على السرعة والأمان."
    },
    {
      keys: ['support', 'maintenance', 'after launch', 'update my site', 'صيانة', 'دعم'],
      en: "Every project comes with a post-launch support window, and we offer ongoing maintenance plans after that — covering updates, backups, security monitoring and small content changes, so your site stays fast and safe long after launch.",
      ar: "كل مشروع يأتي مع فترة دعم بعد الإطلاق، ونقدم خطط صيانة مستمرة بعد ذلك — تشمل التحديثات والنسخ الاحتياطية ومراقبة الأمان والتعديلات الصغيرة على المحتوى، ليبقى موقعك سريعًا وآمنًا لفترة طويلة بعد الإطلاق."
    },
    {
      keys: ['hosting', 'domain', 'server', 'استضافة', 'دومين'],
      en: "Yes — we can handle hosting and domain setup for you end-to-end, or work with hosting you already have. We'll always recommend the option that's fastest and most reliable for your specific site.",
      ar: "نعم — يمكننا إدارة الاستضافة وإعداد الدومين لك بالكامل، أو العمل مع الاستضافة الحالية لديك. سنوصي دائمًا بالخيار الأسرع والأكثر موثوقية لموقعك تحديدًا."
    },
    {
      keys: ['seo', 'google ranking', 'search engine', 'ظهور بجوجل', 'محركات البحث'],
      en: "Every VELIX website ships with SEO fundamentals built in: clean structured markup, fast load times, meta tags, sitemaps and mobile optimization. We also offer deeper ongoing SEO campaigns if you want to actively grow search traffic over time.",
      ar: "كل موقع من فيليكس يأتي مزودًا بأساسيات تحسين محركات البحث: أكواد نظيفة ومنظمة، أوقات تحميل سريعة، وسوم ميتا، خرائط مواقع وتحسين للجوال. نقدم أيضًا حملات SEO أعمق ومستمرة إذا أردت زيادة زوار البحث بمرور الوقت."
    },
    {
      keys: ['security', 'secure', 'hack', 'protection', 'حماية', 'امان'],
      en: "Security is standard on every build — HTTPS, hardened forms, regular dependency updates and monitoring. For e-commerce or platforms handling sensitive data we add extra layers like rate-limiting, authentication best practices and regular audits.",
      ar: "الأمان معيار أساسي في كل بناء — HTTPS، نماذج محصّنة، تحديثات ومراقبة دورية. أما للمتاجر الإلكترونية أو المنصات التي تتعامل مع بيانات حساسة، نضيف طبقات إضافية مثل تحديد معدل الطلبات، أفضل ممارسات المصادقة والمراجعات الدورية."
    },
    {
      keys: ['contact', 'phone', 'number', 'call', 'رقم', 'تواصل', 'اتصال'],
      en: `You can reach the team directly at <strong>${CONTACT.phone}</strong> or by email at <strong>${CONTACT.email}</strong>. Or — even easier — tell me a bit about your project right here and I'll make sure the right person follows up with you.`,
      ar: `يمكنك التواصل مع الفريق مباشرة على <strong>${CONTACT.phone}</strong> أو عبر البريد الإلكتروني <strong>${CONTACT.email}</strong>. أو — بشكل أسهل — أخبرني قليلًا عن مشروعك هنا وسأتأكد من أن الشخص المناسب سيتابع معك.`
    },
    {
      keys: ['email', 'mail', 'ايميل', 'بريد'],
      en: `Our email is <strong>${CONTACT.email}</strong>. I'm also happy to pass your details straight to the team if you'd rather I set that up for you right now.`,
      ar: `بريدنا الإلكتروني هو <strong>${CONTACT.email}</strong>. يسعدني أيضًا تمرير بياناتك مباشرة إلى الفريق إذا أردت أن أرتب ذلك لك الآن.`
    },
    {
      keys: ['process', 'how does it work', 'steps', 'كيف بتشتغلوا', 'خطوات'],
      en: "Our process is simple: <strong>1)</strong> Discovery call to understand your goals, <strong>2)</strong> Planning &amp; site structure, <strong>3)</strong> Design, <strong>4)</strong> Development, <strong>5)</strong> Testing &amp; launch, <strong>6)</strong> Ongoing support. You'll see progress at every stage before anything goes live.",
      ar: "عمليتنا بسيطة: <strong>1)</strong> مكالمة استكشافية لفهم أهدافك، <strong>2)</strong> التخطيط وبنية الموقع، <strong>3)</strong> التصميم، <strong>4)</strong> التطوير، <strong>5)</strong> الاختبار والإطلاق، <strong>6)</strong> الدعم المستمر. سترى التقدم في كل مرحلة قبل أن يُطلق أي شيء."
    },
    {
      keys: ['portfolio', 'examples', 'work', 'previous projects', 'اعمال سابقة', 'نماذج'],
      en: 'You can see selected projects on our <a href="portfolio.html">Portfolio page</a> — happy to walk you through which of them is closest to what you have in mind.',
      ar: 'يمكنك مشاهدة مشاريع مختارة في صفحة <a href="portfolio.html">أعمالنا</a> — يسعدني أن أوضح لك أيها الأقرب لما تفكر فيه.'
    },
    {
      keys: ['who are you', 'company', 'about velix', 'مين انتوا', 'الشركة'],
      en: 'VELIX Web Solutions is a premium web design &amp; development studio led by <strong>Moatasm Abdeen</strong> (Founder &amp; CEO), who personally reviews every project before delivery, alongside a dedicated Backend Developer. We keep the team lean so every client gets real, senior attention.',
      ar: 'فيليكس لحلول الويب هو استوديو متميز لتصميم وتطوير المواقع يقوده <strong>Moatasm Abdeen</strong> (المؤسس والرئيس التنفيذي)، الذي يراجع شخصيًا كل مشروع قبل التسليم، إلى جانب مطوّر خلفية متخصص. نبقي الفريق صغيرًا ليحصل كل عميل على اهتمام حقيقي من كبار المختصين.'
    }
  ];

  const STR = {
    en: {
      toggleOpen: 'Open live chat',
      assistantName: 'VELIX Assistant',
      assistantStatus: 'Typically replies instantly',
      dialogLabel: 'VELIX live chat',
      closeLabel: 'Close chat',
      inputPlaceholder: 'Type your question…',
      sendLabel: 'Send',
      greeting: "Welcome to VELIX Web Solutions. I'd be happy to help you choose the best solution for your business — you can ask me about pricing, timelines, our process, or anything else about working with us.",
      quickReplies: ['Pricing', 'Timeline', 'Our services', 'Talk to a human'],
      humanHandoff: `Of course — you can call us directly at <strong>${CONTACT.phone}</strong> or email <strong>${CONTACT.email}</strong>. Or share your details below and our team will call you.`,
      fallback: "Great question — let me make sure our team gives you an exact answer for your specific project. Mind sharing a few details so the right person can follow up?",
      leadIntro: "I want to make sure the right specialist follows up personally — mind sharing a few details?",
      leadName: 'Your name',
      leadPhone: 'Phone number',
      leadEmail: 'Email (optional)',
      leadCompany: 'Company (optional)',
      leadDetails: 'Tell us briefly about your project',
      leadBudget: 'Estimated budget (optional)',
      leadTimeline: 'Desired timeline (optional)',
      leadSubmit: 'Send to VELIX Team',
      leadThanks: (name) => `Thank you, ${name} — you're all set. A member of the VELIX team will reach out shortly. Anything else I can help with in the meantime?`
    },
    ar: {
      toggleOpen: 'فتح المحادثة المباشرة',
      assistantName: 'مساعد فيليكس',
      assistantStatus: 'يرد عادة على الفور',
      dialogLabel: 'محادثة فيليكس المباشرة',
      closeLabel: 'إغلاق المحادثة',
      inputPlaceholder: 'اكتب سؤالك…',
      sendLabel: 'إرسال',
      greeting: 'مرحبًا بك في فيليكس لحلول الويب. يسعدني مساعدتك في اختيار الحل الأنسب لعملك — يمكنك سؤالي عن الأسعار، الجدول الزمني، طريقة عملنا، أو أي شيء آخر عن العمل معنا.',
      quickReplies: ['الأسعار', 'الجدول الزمني', 'خدماتنا', 'التحدث مع شخص'],
      humanHandoff: `بالتأكيد — يمكنك الاتصال بنا مباشرة على <strong>${CONTACT.phone}</strong> أو عبر البريد الإلكتروني <strong>${CONTACT.email}</strong>. أو شارك بياناتك أدناه وسيتصل بك فريقنا.`,
      fallback: 'سؤال ممتاز — دعني أتأكد من أن فريقنا يعطيك إجابة دقيقة لمشروعك الخاص. هل تمانع مشاركة بعض التفاصيل ليتابع معك الشخص المناسب؟',
      leadIntro: 'أريد التأكد من أن المختص المناسب سيتابع معك شخصيًا — هل تمانع مشاركة بعض التفاصيل؟',
      leadName: 'اسمك',
      leadPhone: 'رقم الهاتف',
      leadEmail: 'البريد الإلكتروني (اختياري)',
      leadCompany: 'الشركة (اختياري)',
      leadDetails: 'أخبرنا باختصار عن مشروعك',
      leadBudget: 'الميزانية التقديرية (اختياري)',
      leadTimeline: 'الجدول الزمني المطلوب (اختياري)',
      leadSubmit: 'إرسال إلى فريق فيليكس',
      leadThanks: (name) => `شكرًا لك، ${name} — كل شيء جاهز. سيتواصل معك أحد أعضاء فريق فيليكس قريبًا. هل هناك أي شيء آخر يمكنني مساعدتك به في هذه الأثناء؟`
    }
  };

  function s(key) {
    const table = STR[getLang()] || STR.en;
    return table[key] !== undefined ? table[key] : STR.en[key];
  }

  function match(text) {
    const lower = text.toLowerCase();
    const lang = getLang();
    for (const item of FAQ) {
      if (item.keys.some(k => lower.includes(k))) return lang === 'ar' ? item.ar : item.en;
    }
    return null;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function buildWidget() {
    const wrap = document.createElement('div');
    wrap.className = 'velix-chat';
    wrap.innerHTML = `
      <button class="velix-chat-toggle" aria-label="${s('toggleOpen')}">
        <svg class="ic-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        <svg class="ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        <span class="velix-chat-dot"></span>
      </button>
      <div class="velix-chat-panel" role="dialog" aria-modal="true" aria-label="${s('dialogLabel')}">
        <div class="velix-chat-head">
          <div class="velix-chat-avatar">V</div>
          <div class="velix-chat-head-info">
            <strong class="velix-chat-name">${s('assistantName')}</strong>
            <span class="velix-chat-status">${s('assistantStatus')}</span>
          </div>
          <button type="button" class="velix-chat-close-mobile" aria-label="${s('closeLabel')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="velix-chat-body" id="velixChatBody"></div>
        <div class="velix-chat-quick" id="velixQuickReplies"></div>
        <form class="velix-chat-input" id="velixChatForm">
          <input type="text" id="velixChatInput" placeholder="${s('inputPlaceholder')}" autocomplete="off" aria-label="${s('inputPlaceholder')}">
          <button type="submit" aria-label="${s('sendLabel')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </form>
      </div>`;
    document.body.appendChild(wrap);
    return wrap;
  }

  function scrollToBottom(body) {
    body.scrollTop = body.scrollHeight;
  }

  function addBubble(body, text, who) {
    const bubble = document.createElement('div');
    bubble.className = 'velix-bubble ' + (who === 'user' ? 'is-user' : 'is-bot');
    bubble.innerHTML = text;
    body.appendChild(bubble);
    scrollToBottom(body);
    return bubble;
  }

  function addTyping(body) {
    const row = document.createElement('div');
    row.className = 'velix-typing-row';
    row.innerHTML = '<span class="velix-typing-avatar">V</span><span class="velix-bubble is-bot is-typing"><span></span><span></span><span></span></span>';
    body.appendChild(row);
    scrollToBottom(body);
    return row;
  }

  function leadForm() {
    return `<div class="velix-lead-card">
      <p>${s('leadIntro')}</p>
      <form id="velixLeadForm" class="velix-lead-form">
        <input required name="name" placeholder="${s('leadName')}">
        <input required name="phone" placeholder="${s('leadPhone')}" type="tel">
        <input name="email" placeholder="${s('leadEmail')}" type="email">
        <input name="company" placeholder="${s('leadCompany')}">
        <textarea name="projectDetails" placeholder="${s('leadDetails')}" rows="2"></textarea>
        <input name="budget" placeholder="${s('leadBudget')}">
        <input name="timeline" placeholder="${s('leadTimeline')}">
        <button type="submit" class="btn btn-accent">${s('leadSubmit')}</button>
      </form>
    </div>`;
  }

  function init() {
    if (!window.VELIX) return; // store.js must load first
    const widget = buildWidget();
    const toggle = widget.querySelector('.velix-chat-toggle');
    const panel = widget.querySelector('.velix-chat-panel');
    const body = widget.querySelector('#velixChatBody');
    const form = widget.querySelector('#velixChatForm');
    const input = widget.querySelector('#velixChatInput');
    const quickWrap = widget.querySelector('#velixQuickReplies');

    const closeMobileBtn = widget.querySelector('.velix-chat-close-mobile');
    const conversationId = VELIX.uid('conv');
    const transcript = [];

    function closePanel() {
      panel.classList.remove('is-open');
      toggle.classList.remove('is-open');
    }

    function record(text, who) {
      transcript.push({ text, who, at: new Date().toISOString() });
      VELIX.conversations.save({ id: conversationId, messages: transcript });
    }

    function renderQuickReplies() {
      const replies = s('quickReplies');
      quickWrap.innerHTML = replies.map(q => `<button type="button" class="velix-quick-btn">${q}</button>`).join('');
      quickWrap.querySelectorAll('.velix-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => handleUserMessage(btn.textContent));
      });
    }

    function showLeadForm() {
      const bubble = addBubble(body, leadForm(), 'bot');
      bubble.querySelector('#velixLeadForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        VELIX.leads.create(Object.assign({}, data, { source: 'Live Chat', conversationId }));
        record('[Lead submitted: ' + data.name + ']', 'user');
        bubble.innerHTML = '<p>' + s('leadThanks')(escapeHtml(data.name)) + '</p>';
      });
    }

    function handleUserMessage(text) {
      if (!text.trim()) return;
      addBubble(body, escapeHtml(text), 'user');
      record(text, 'user');
      input.value = '';

      const typing = addTyping(body);

      setTimeout(() => {
        typing.remove();
        const lower = text.toLowerCase();

        if (/human|agent|representative|talk to (a )?person|موظف|بشري|شخص حقيقي/.test(lower)) {
          addBubble(body, s('humanHandoff'), 'bot');
          showLeadForm();
          record('[Escalation to human requested]', 'bot');
          return;
        }

        const answer = match(text);
        if (answer) {
          addBubble(body, answer, 'bot');
          record(answer, 'bot');
        } else {
          addBubble(body, s('fallback'), 'bot');
          record('[Fallback to lead capture]', 'bot');
          showLeadForm();
        }
      }, 700 + Math.random() * 400);
    }

    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      if (isOpen && !body.dataset.greeted) {
        body.dataset.greeted = '1';
        const typing = addTyping(body);
        setTimeout(() => {
          typing.remove();
          const greeting = s('greeting');
          addBubble(body, greeting, 'bot');
          record(greeting, 'bot');
          renderQuickReplies();
        }, 600);
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUserMessage(input.value);
    });

    if (closeMobileBtn) {
      closeMobileBtn.addEventListener('click', closePanel);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
    });

    // Keep the chrome (labels, placeholders, quick replies not yet answered)
    // in sync if the visitor switches language mid-conversation. Messages
    // already sent stay as they were said — only the UI shell and any
    // not-yet-used quick replies refresh to the new language.
    document.addEventListener('velix:langchange', () => {
      toggle.setAttribute('aria-label', s('toggleOpen'));
      panel.setAttribute('aria-label', s('dialogLabel'));
      const nameEl = widget.querySelector('.velix-chat-name');
      const statusEl = widget.querySelector('.velix-chat-status');
      if (nameEl) nameEl.textContent = s('assistantName');
      if (statusEl) statusEl.textContent = s('assistantStatus');
      input.setAttribute('placeholder', s('inputPlaceholder'));
      input.setAttribute('aria-label', s('inputPlaceholder'));
      const sendBtn = form.querySelector('button[type="submit"]');
      if (sendBtn) sendBtn.setAttribute('aria-label', s('sendLabel'));
      if (closeMobileBtn) closeMobileBtn.setAttribute('aria-label', s('closeLabel'));
      if (quickWrap.childElementCount) renderQuickReplies();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
