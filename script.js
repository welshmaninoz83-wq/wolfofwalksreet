/* ===============================
   THE WOOF OF WALK STREET – JS
   - Sticky agreements banner
   - Reveal-on-scroll
   - Parallax hero skyline
   - Testimonials carousel
   - Hybrid booking funnel (dog-walking.html)
   =============================== */

/* === Sticky banner === */
(function(){
  var banner=document.getElementById('noticeBanner');
  var spacer=document.getElementById('noticeSpacer');
  if(!banner||!spacer) return;
  try{
    var raw=localStorage.getItem('hideNoticeBannerUntil');
    if(raw){
      var until=parseInt(raw,10);
      if(!isNaN(until) && Date.now()<until){ banner.style.display='none'; spacer.style.height='0px'; }
    }
  }catch(e){}
  var btn=document.getElementById('dismissBannerBtn');
  if(btn) btn.addEventListener('click',function(){
    try{ localStorage.setItem('hideNoticeBannerUntil', String(Date.now()+30*24*60*60*1000)); }catch(e){}
    banner.style.display='none'; spacer.style.height='0px';
  });
})();

/* === Reveal on scroll === */
(function(){
  var els=document.querySelectorAll('.reveal');
  if(!els.length) return;
  if(!('IntersectionObserver' in window)){
    els.forEach(e=>e.classList.add('reveal--visible'));
    return;
  }
  var io=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ en.target.classList.add('reveal--visible'); io.unobserve(en.target); }
    });
  },{threshold:.12});
  els.forEach(e=>io.observe(e));
})();

/* === Parallax hero skyline === */
(function(){
  var hero=document.querySelector('.hero');
  if(!hero) return;
  window.addEventListener('scroll', function(){
    hero.style.setProperty('--parallaxY', (window.scrollY*0.25)+'px');
  }, {passive:true});
})();

/* === Testimonials carousel === */
(function(){
  var root=document.querySelector('.carousel');
  if(!root) return;
  var slides=[...root.querySelectorAll('.slide')];
  var prev=root.querySelector('.prev'), next=root.querySelector('.next');
  var dots=root.querySelector('.dots'); var i=0, t;
  function go(n){ i=(n+slides.length)%slides.length; slides.forEach((s,idx)=>s.classList.toggle('is-active', idx===i)); updateDots(); }
  function updateDots(){
    if(!dots) return;
    dots.innerHTML='';
    slides.forEach((_,idx)=>{
      var b=document.createElement('button');
      b.className='dot'+(idx===i?' on':'');
      b.setAttribute('aria-label','Go to slide '+(idx+1));
      b.onclick=()=>{ go(idx); reset(); };
      dots.appendChild(b);
    });
  }
  function reset(){ clearInterval(t); t=setInterval(()=>go(i+1), 6000); }
  if(prev) prev.onclick=()=>{ go(i-1); reset(); };
  if(next) next.onclick=()=>{ go(i+1); reset(); };
  updateDots(); reset();
  var x0=null;
  root.addEventListener('pointerdown',e=>x0=e.clientX);
  root.addEventListener('pointerup',e=>{ if(x0===null) return; var dx=e.clientX-x0; if(dx>40&&prev) prev.onclick(); if(dx<-40&&next) next.onclick(); x0=null; });
})();

/* === Hybrid booking funnel (dog-walking.html) === */
(function(){
  var container = document.querySelector('.funnel');
  var steps = document.querySelectorAll('.funnel-step');
  if(!container || !steps.length) return; // only runs on dog-walking.html

  function showStep(n){
    steps.forEach(function(s){
      s.classList.toggle('is-active', s.getAttribute('data-step')===String(n));
    });
    // scroll to top of funnel on step change
    var top = container.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: top, behavior:'smooth' });
  }

  // Next/Prev handlers
  document.querySelectorAll('.next-step').forEach(function(btn){
    btn.addEventListener('click', function(){
      var next = this.getAttribute('data-next');
      // basic validation for Step 1 (walk must be selected)
      var current = this.closest('.funnel-step');
      if(current && current.getAttribute('data-step')==='1'){
        var chosen = document.querySelector('input[name="walk"]:checked');
        if(!chosen){
          alert('Please select a walk length to continue.');
          return;
        }
      }
      showStep(next);
      if(next==='5'){ renderSummary(); }
    });
  });
  document.querySelectorAll('[data-prev]').forEach(function(btn){
    btn.addEventListener('click', function(){ showStep(this.getAttribute('data-prev')); });
  });

  function getSelected(name){
    var el = document.querySelector('input[name="'+name+'"]:checked');
    return el ? el.value : null;
  }
  function getAddons(){
    return Array.from(document.querySelectorAll('input[name="addon"]:checked')).map(function(cb){
      return {key: cb.value, price: Number(cb.dataset.price||0)};
    });
  }

  function renderSummary(){
    var out = [];
    var walk = getSelected('walk');
    if(walk==='30') out.push('30-minute Walk — $35');
    if(walk==='60') out.push('60-minute Walk — $50');

    var mem = getSelected('membership');
    if(mem==='8walks') out.push('Paw Pass 8 Walks — $260');
    if(mem==='12walks') out.push('Paw Pass 12 Walks — $380');
    if(mem==='unlimited') out.push('Paw Pass Unlimited — $499/mo');

    var addons = getAddons();
    addons.forEach(function(a){
      var label = ({
        treats:'Treat Pack +$12',
        supplement:'Joint/Coat Supplement +$15',
        photos:'Photo/Video Package +$15',
        extradog:'Extra Dog +$20',
        donation:'Shelter Donation +$5'
      })[a.key] || a.key;
      out.push(label);
    });

    var wk = getSelected('weekend');
    if(wk==='2nights') out.push('Weekend Woof Club — 2 Nights $250');
    if(wk==='3nights') out.push('Weekend Woof Club — 3 Nights $300');

    var el = document.getElementById('summaryList');
    if(el) el.innerHTML = out.length ? ('<ul><li>'+ out.join('</li><li>') +'</li></ul>') : '<em>No options selected yet.</em>';
  }

  // Finalize → redirect to Time To Pet (new vs existing)
  var finalize = document.getElementById('finalizeBooking');
  if(finalize){
    finalize.addEventListener('click', function(){
      var clientType = getSelected('clienttype') || 'new';
      var url = (clientType==='existing')
        ? 'https://www.timetopet.com/portal/woofofwalkstreet'
        : 'https://www.timetopet.com/portal/woofofwalkstreet/create-account';
      window.location.href = url;
    });
  }

  // Initialize
  showStep(1);
})();
