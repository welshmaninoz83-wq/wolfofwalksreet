(async function(){
  const params = new URLSearchParams(window.location.search);
  const q = (params.get("q")||"").toLowerCase();

  const res = await fetch("/blog/posts.json",{cache:"no-store"});
  const posts = await res.json();

  const results = posts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
    (p.tags && p.tags.join(" ").toLowerCase().includes(q))
  );

  const el = document.getElementById("results");
  if(!el) return;

  if(!q){
    el.innerHTML = `<p class="per">Type a word above to search our posts.</p>`;
    return;
  }

  if(results.length===0){
    el.innerHTML = `<p>No results found for <strong>${q}</strong>.</p>`;
    return;
  }

  results.forEach(p=>{
    el.innerHTML += `
      <article>
        ${p.image ? `<img class="thumb" src="${p.image}" alt="${p.imageAlt||''}" width="120" height="90" loading="lazy">` : ""}
        <div>
          <h3><a href="${p.url}">${p.title}</a></h3>
          <div class="post-meta">${new Date(p.date).toLocaleDateString()}</div>
          <p>${p.excerpt}</p>
          <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join(" ")}</div>
        </div>
      </article>`;
  });
})();
