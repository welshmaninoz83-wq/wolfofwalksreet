<script>
(async function(){
  const res = await fetch('/blog/posts.json', {cache:'no-store'});
  const posts = await res.json();

  function renderList(list, el){
    el.innerHTML = '';
    if(!list.length){ el.innerHTML = '<p>No matching posts.</p>'; return; }
    for(const p of list){
      const art = document.createElement('article');
      art.innerHTML = `
        ${p.image ? `<img class="thumb" src="${p.image}" alt="${p.imageAlt || ''}" loading="lazy" width="120" height="90">` : `<div></div>`}
        <div>
          <h3><a href="${p.url}">${p.title}</a></h3>
          <div class="result-meta">${new Date(p.date).toLocaleDateString()}</div>
          <p>${p.excerpt}</p>
          <div class="tags">
            ${p.tags.map(t=>`<a class="tag" href="/blog/tag/${encodeURIComponent(t.toLowerCase())}.html">${t}</a>`).join('')}
          </div>
        </div>
      `;
      el.appendChild(art);
    }
  }

  const listEl = document.querySelector('#search-results');
  const inputEl = document.querySelector('#search-input');
  if(listEl && inputEl){
    renderList(posts, listEl);
    inputEl.addEventListener('input', e=>{
      const q = e.target.value.trim().toLowerCase();
      const filtered = !q ? posts : posts.filter(p=>{
        const hay = (p.title + ' ' + p.excerpt + ' ' + p.tags.join(' ')).toLowerCase();
        return hay.includes(q);
      });
      renderList(filtered, listEl);
    });
  }

  const tagEl = document.querySelector('#tag-results');
  const tagNameEl = document.querySelector('#tag-name');
  if(tagEl && tagNameEl){
    const tag = tagEl.dataset.tag; 
    const filtered = posts.filter(p => p.tags.map(t=>t.toLowerCase()).includes(tag));
    tagNameEl.textContent = tag[0].toUpperCase()+tag.slice(1);
    renderList(filtered, tagEl);
  }
})();
</script>
