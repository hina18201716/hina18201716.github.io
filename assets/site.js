const profile=window.profile||{};
for(const key of ['name','role','institution','email','city','department','tagline','researchRoleLine','researchSummary','background','photoUrl']){
  document.querySelectorAll(`[data-profile="${key}"]`).forEach(el=>el.textContent=profile[key]||'');
}
document.querySelectorAll('[data-profile-email-link]').forEach(el=>el.setAttribute('href',`mailto:${profile.email||''}`));
document.querySelectorAll('[data-profile-name-alt]').forEach(el=>el.setAttribute('alt',`Portrait of ${profile.name||''}`));
document.querySelectorAll('[data-profile-photo]').forEach(el=>el.setAttribute('src',profile.photoUrl||''));
document.querySelectorAll('[data-profile-cv]').forEach(el=>el.setAttribute('href',profile.cvUrl||'#'));
document.querySelectorAll('[data-profile-title]').forEach(el=>{document.title=`${profile.name||''} — ${el.dataset.profileTitle}`;});
document.querySelectorAll('[data-profile-description]').forEach(el=>el.setAttribute('content',`${el.dataset.profileDescription} ${profile.name||''}.`));
document.querySelectorAll('[data-profile-area-list]').forEach(el=>{
  el.replaceChildren();
  (profile.researchAreas||[]).forEach((area,index)=>{
    if(index)el.append(document.createTextNode(' · '));
    const span=document.createElement('span');span.textContent=area;el.append(span);
  });
});
document.querySelectorAll('[data-profile-social]').forEach(el=>{
  const url=profile.social?.[el.dataset.profileSocial];
  if(url){el.href=url;el.hidden=false;}else el.hidden=true;
});
document.querySelectorAll('[data-profile-education]').forEach(el=>{
  const [group,key]=el.dataset.profileEducation.split('.');
  el.textContent=profile[group]?.[key]||'';
});
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

// Small static-site BibTeX reader. Supports standard @type{key, field = {value}} entries.
function parseBibTeX(source){
  const entries=[];const re=/@([a-zA-Z]+)\s*[{(]\s*([^,\s]+)\s*,([\s\S]*?)\s*[})]\s*(?=@|$)/g;let match;
  while((match=re.exec(source))){const type=match[1].toLowerCase();if(['comment','preamble','string'].includes(type))continue;const fields={};const body=match[3];const fieldRe=/([a-zA-Z][\w-]*)\s*=\s*(\{(?:[^{}]|\{[^{}]*\})*\}|"(?:\\.|[^"])*"|[^,\s]+)\s*,?/g;let f;
    while((f=fieldRe.exec(body))){let value=f[2].trim();if((value[0]==='{'&&value.at(-1)==='}')||(value[0]==='"'&&value.at(-1)==='"'))value=value.slice(1,-1);fields[f[1].toLowerCase()]=value.replace(/\\([%&#_$])/g,'$1').replace(/[{}]/g,'').replace(/\s+/g,' ').trim();}
    entries.push({type,key:match[2],...fields});
  }
  return entries.sort((a,b)=>(Number(b.year)||0)-(Number(a.year)||0));
}
function safe(value){return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderPublications(entries){const list=document.querySelector('#publication-list');if(!list)return;const count=document.querySelector('#publication-count');count.textContent=`${entries.length} publication${entries.length===1?'':'s'}`;
  if(!entries.length){list.innerHTML='<p class="notice">No publications found yet. Add your BibTeX entries to <code>publications.bib</code> and they will appear here.</p>';return;}
  list.innerHTML=entries.map(e=>{const title=safe(e.title||e.key);const authors=safe(e.author||'Author details not provided').replace(/\s+and\s+/gi,', ');const venue=safe(e.journal||e.booktitle||e.publisher||e.school||e.howpublished||'');const year=safe(e.year||'');const links=[];if(e.url)links.push(`<a href="${safe(e.url)}" target="_blank" rel="noopener">View paper ↗</a>`);if(e.doi)links.push(`<a href="https://doi.org/${encodeURIComponent(e.doi)}" target="_blank" rel="noopener">DOI ↗</a>`);if(e.pdf)links.push(`<a href="${safe(e.pdf)}" target="_blank" rel="noopener">PDF ↗</a>`);return `<article class="publication"><div class="pub-year">${year}</div><div><h2 class="pub-title">${title}</h2><p class="pub-authors">${authors}</p>${venue?`<p class="pub-venue"><em>${venue}</em></p>`:''}${links.length?`<div class="pub-links">${links.join('')}</div>`:''}</div></article>`;}).join('');
}
const target=document.querySelector('#publication-list');if(target){fetch('publications.bib').then(r=>{if(!r.ok)throw Error('Bibliography file not found');return r.text()}).then(text=>renderPublications(parseBibTeX(text))).catch(()=>{document.querySelector('#publication-count').textContent='Bibliography unavailable';target.innerHTML='<p class="notice">Could not load <code>publications.bib</code>. Check that the file is in the site root.</p>';});}
