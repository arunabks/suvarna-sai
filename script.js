/* A deliberately quiet invitation experience, not an e-commerce landing page. */
(() => {
  const $ = (s) => document.querySelector(s);
  const progress = $('#progress');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (max > 0 ? (window.scrollY / max * 100) : 0) + '%';
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }
    }, { threshold: .11, rootMargin: '0px 0px -35px 0px' });
    elements.forEach(el => io.observe(el));
  } else { elements.forEach(el => el.classList.add('visible')); }

  // Restrained 3D movement that responds to the cursor only on capable desktop devices.
  const stage = $('#heroStage');
  if (stage && motionOK && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const region = $('.hero');
    region?.addEventListener('pointermove', e => {
      const r = region.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - .5) * 2;
      const y = ((e.clientY - r.top) / r.height - .5) * 2;
      stage.style.transform = `perspective(1200px) rotateY(${x * -4}deg) rotateX(${y * 3}deg) translate3d(${x * 5}px,${y * 4}px,0)`;
    }, { passive: true });
    region?.addEventListener('pointerleave', () => { stage.style.transform = ''; });
  }

  // Audio embeds cannot reliably auto-start in browsers: open after an explicit guest tap.
  const dialog = $('#musicDialog'), btn = $('#musicButton'), closeBtn = $('#closeMusic'), frame = $('#musicFrame');
  const videoId = 'EO3JWdSL1mk';
  function openMusic() {
    if (!dialog) return;
    dialog.hidden = false;
    document.body.classList.add('dialog-open');
    btn?.setAttribute('aria-expanded','true');
    if (frame && !frame.querySelector('iframe')) {
      const iframe = document.createElement('iframe');
      iframe.title = 'Wedding background song on YouTube';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&rel=0`;
      frame.appendChild(iframe);
    }
    closeBtn?.focus();
  }
  function closeMusic() {
    if (!dialog) return;
    dialog.hidden = true;
    document.body.classList.remove('dialog-open');
    btn?.setAttribute('aria-expanded','false');
    if (frame) frame.textContent = '';
    btn?.focus();
  }
  btn?.addEventListener('click',openMusic);
  closeBtn?.addEventListener('click',closeMusic);
  document.querySelectorAll('[data-close-music]').forEach(el => el.addEventListener('click',closeMusic));
  document.addEventListener('keydown',e => { if (e.key === 'Escape' && dialog && !dialog.hidden) closeMusic(); });

  // Files in standard RFC 5545 format: all event times UTC, corresponding to India Standard Time.
  const schedules = {
    wedding: {
      title: 'దేవి సువర్ణ & నిర్మల్ కుమార్ — శుభ వివాహము',
      from: '20261016T174200Z', to: '20261016T184200Z',
      location: 'శ్రీ వెంకటేశ్వరస్వామి వారి ఆలయము, కాళ్ళకూరు గ్రామము',
      link: 'https://maps.app.goo.gl/4b3RowcQUyT4TgjdA', file: 'Suvarna-Nirmal-Wedding.ics'
    },
    vindu: {
      title: 'దేవి సువర్ణ & నిర్మల్ కుమార్ — విందు',
      from: '20261015T063000Z', to: '20261015T093000Z',
      location: 'అలపాడు - సోమేశ్వరం గ్రామములో మా స్వగృహము నందు',
      link: '', file: 'Suvarna-Nirmal-Vindu.ics'
    }
  };
  function escapeIcs(v) {return String(v).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
  function saveCalendar(type) {
    const item = schedules[type]; if (!item) return;
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Nirmal and Suvarna//Wedding Invitation//TE','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
      'UID:nirmal-suvarna-'+type+'-2026@wedding.local',
      'DTSTAMP:20261010T000000Z',
      'DTSTART:'+item.from,'DTEND:'+item.to,'SUMMARY:'+escapeIcs(item.title),
      'DESCRIPTION:'+escapeIcs('Bride-side wedding invitation. '+item.location),
      'LOCATION:'+escapeIcs(item.location),...(item.link ? ['URL:'+item.link] : []),'END:VEVENT','END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));
    const a = document.createElement('a');a.href = url;a.download=item.file;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
  document.querySelectorAll('[data-calendar]').forEach(b => b.addEventListener('click',()=>saveCalendar(b.dataset.calendar)));

  const toast = $('#toast');let toastTimeout;
  function feedback(message) {
    if (!toast) return;
    toast.textContent = message; toast.classList.add('visible');clearTimeout(toastTimeout);
    toastTimeout = setTimeout(()=>toast.classList.remove('visible'),3200);
  }
  async function shareInvitation() {
    const name = 'దేవి సువర్ణ ♡ నిర్మల్ కుమార్';
    const txt = 'కొమ్మిన కుటుంబ శుభ వివాహ ఆహ్వానం 💐\nదేవి సువర్ణ & సత్య నాగ సాయి నిర్మల్ కుమార్\nశుభ ముహూర్తము: శుక్రవారం, 16 అక్టోబర్ 2026, రాత్రి 11 గంటల 12 నిమిషాలకు (మిథున లగ్నం)\nవివాహ వేదిక: శ్రీ వెంకటేశ్వరస్వామి వారి ఆలయము, కాళ్ళకూరు గ్రామము\nవివాహ వేదిక మ్యాప్: https://maps.app.goo.gl/4b3RowcQUyT4TgjdA\nవిందు: గురువారం, 15 అక్టోబర్ 2026, మధ్యాహ్నం 12 గంటల నుండి\nవిందు చిరునామా: అలపాడు - సోమేశ్వరం గ్రామములో మా స్వగృహము నందు\nసాదర ఆహ్వానం: కొమ్మిన సుజాతారావు గారు & శ్రీమతి కొమ్మిన శాంతి గారు';
    const isHosted = location.protocol === 'https:' && !location.hostname.includes('sandbox');
    const data = { title:name,text:txt,...(isHosted?{url:location.href}:{}) };
    try { if (navigator.share) { await navigator.share(data);return; } } catch(e) { if(e.name === 'AbortError')return; }
    const full = txt + (isHosted?'\n'+location.href:'');
    try { await navigator.clipboard.writeText(full); feedback('ఆహ్వాన వివరాలు కాపీ అయ్యాయి'); }
    catch(e) { window.open('https://wa.me/?text='+encodeURIComponent(full),'_blank','noopener,noreferrer'); feedback('వాట్సాప్‌లో ఆహ్వానాన్ని పంచుకోండి'); }
  }
  $('#shareButton')?.addEventListener('click',shareInvitation);


  // Decorative motion. Positions are seeded so the composition stays intentional on every visit.
  // No canvas engine or large animation libraries required.
  if (motionOK) {
    let seed=20261016;
    function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
    const isMobile=matchMedia('(max-width:760px)').matches;
    document.querySelectorAll('.wedding-atmosphere').forEach((field,index)=>{
      const isHero=field.classList.contains('atmosphere-hero');
      const maxPetals=Number(field.dataset.petals||0),maxSparks=Number(field.dataset.sparks||0);
      const petals=isMobile?Math.ceil(maxPetals*.65):maxPetals;
      const sparks=isMobile?Math.ceil(maxSparks*.65):maxSparks;
      const batch=document.createDocumentFragment();
      for(let i=0;i<petals+sparks;i++){
        const petal=i<petals;
        const e=document.createElement('i');
        e.className=petal?'floating-petal':'floating-spark';
        const r=random(),side=random();
        // On the cover, keep a negative-space channel around the typography and faces.
        const x=isHero?(side<.55?3+random()*24:76+random()*22):(2+random()*96);
        e.style.setProperty('--x',x.toFixed(2)+'%');
        e.style.setProperty('--top',(4+random()*105).toFixed(2)+'%');
        e.style.setProperty('--size',(petal?4+random()*6:1+random()*2.5).toFixed(1)+'px');
        e.style.setProperty('--duration',(petal?17+random()*18:4.5+random()*9).toFixed(1)+'s');
        e.style.setProperty('--delay',(-random()*24).toFixed(1)+'s');
        e.style.setProperty('--opacity',(petal?.25+random()*.43:.16+random()*.58).toFixed(2));
        e.style.setProperty('--drift',(-85+random()*170).toFixed(0)+'px');
        if(petal)e.style.setProperty('--blur',random()>.9?'1px':'0px');
        batch.append(e);
      }
      field.append(batch);
    });

    // Scroll parallax is kept on decorative layers, never on names or essential information.
    const decorations = [document.querySelector('.hero-silk'), document.querySelector('.photo-radiance')];
    const hero=document.querySelector('.hero');
    const storyShots=[...document.querySelectorAll('.story-shot')];
    let framePending=false;
    function updateDepth(){
      framePending=false;
      if(hero){
        const top=hero.getBoundingClientRect().top;
        const travel=Math.max(0,Math.min(1,-top / Math.max(hero.clientHeight,1)));
        if(decorations[0])decorations[0].style.transform=`translate3d(0,${(travel*50).toFixed(1)}px,0)`;
        if(decorations[1])decorations[1].style.translate=`0 ${(travel*-18).toFixed(1)}px`;
      }
      const h=innerHeight;
      for(const shot of storyShots){
        const r=shot.getBoundingClientRect();
        if(r.bottom<-100||r.top>h+100)continue;
        const distance=(r.top+r.height*.5-h*.5)/(h*.5+r.height*.5);
        shot.style.setProperty('--story-y',Math.max(-10,Math.min(10,-distance*10)).toFixed(1)+'px');
      }
    }
    function onScrollDepth(){if(framePending)return;framePending=true;requestAnimationFrame(updateDepth)}
    window.addEventListener('scroll',onScrollDepth,{passive:true});
    window.addEventListener('resize',onScrollDepth,{passive:true});
    updateDepth();
  }

  // Extra depth for the lighter editorial sections so they do not feel static.
  if (motionOK) {
    const richSections = [...document.querySelectorAll('.letter-section, .ceremonies-section, .photo-section, .ending-section')];
    let sectionTick = false;
    function updateSectionMotion(){
      sectionTick = false;
      const vh = window.innerHeight || 1;
      richSections.forEach(section => {
        const r = section.getBoundingClientRect();
        const center = r.top + r.height * 0.5;
        const delta = (vh * 0.5 - center) / vh;
        const shift = Math.max(-24, Math.min(24, delta * 34));
        const rot = Math.max(-2.4, Math.min(2.4, delta * 3.2));
        section.style.setProperty('--section-shift', shift.toFixed(2) + 'px');
        section.style.setProperty('--section-rot', rot.toFixed(2) + 'deg');
      });
    }
    function queueSectionMotion(){ if(sectionTick) return; sectionTick = true; requestAnimationFrame(updateSectionMotion); }
    window.addEventListener('scroll', queueSectionMotion, { passive: true });
    window.addEventListener('resize', queueSectionMotion, { passive: true });
    updateSectionMotion();
  }

})();
