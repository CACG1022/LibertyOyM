
window.APP = {
  SUPABASE_URL: "https://lvwmpwnzavqdspdfvceb.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2d21wd256YXZxZHNwZGZ2Y2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxOTg3MzYsImV4cCI6MjA5MTc3NDczNn0.u6g4OCm4kl-LEmyIf9VWwf43cdqYbik7Y60rdKQ8npI"
};

function pageName(){
  return location.pathname.split('/').pop() || 'index.html';
}

function sidebar(active){
  const items = [
    ['index.html','Inicio'],
    ['dashboard.html','Dashboard'],
    ['tickets.html','Tickets / Fallas'],
    ['mantenimientos.html','Mantenimientos'],
    ['instalaciones.html','Instalaciones'],
    ['factibilidades.html','Factibilidades'],
    ['traslados.html','Traslados'],
    ['materiales.html','Materiales'],
    ['gastos.html','Gastos'],
    ['tareas.html','Tareas y Alertas'],
    ['reportes.html','Reportes']
  ];
  return `
  <aside class="sidebar">
    <div class="brand">Nodo O&M
      <small>Control y seguimiento</small>
    </div>
    <nav class="nav">
      ${items.map(i => `<a class="${active===i[0]?'active':''}" href="${i[0]}">${i[1]}</a>`).join('')}
    </nav>
    <hr class="sep">
    <div class="card">
      <div class="small muted">Sesión</div>
      <div id="userEmail" class="small">Sin iniciar</div>
      <div class="actions" style="margin-top:10px">
        <button class="secondary" onclick="logout()">Cerrar sesión</button>
      </div>
    </div>
  </aside>`;
}

function appShell(active, title, subtitle, inner){
  return `
  <div class="layout">
    ${sidebar(active)}
    <main class="main">
      <div class="topbar">
        <header>
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </header>
        <div class="actions">
          <a href="dashboard.html"><button class="secondary">Ir al dashboard</button></a>
        </div>
      </div>
      ${inner}
    </main>
  </div>`;
}

let supabaseClient = null;

async function getClient(){
  if (supabaseClient) return supabaseClient;
  const { createClient } = supabase;
  supabaseClient = createClient(APP.SUPABASE_URL, APP.SUPABASE_ANON_KEY);
  return supabaseClient;
}

async function ensureSession(){
  const client = await getClient();
  const { data } = await client.auth.getSession();
  const user = data?.session?.user;
  const userEmailEl = document.getElementById('userEmail');
  if (userEmailEl) userEmailEl.textContent = user?.email || 'Sin iniciar';
  if (!user && pageName() !== 'index.html') {
    location.href = 'index.html';
  }
  return user;
}

async function login(email, password){
  const client = await getClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);
  location.href = 'dashboard.html';
}

async function signup(email, password, fullName){
  const client = await getClient();
  const { data, error } = await client.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  if (error) return alert(error.message);
  alert('Usuario registrado. Revisa tu correo si Supabase exige confirmación.');
  if (data?.user) location.href = 'dashboard.html';
}

async function logout(){
  const client = await getClient();
  await client.auth.signOut();
  location.href = 'index.html';
}

function formDataObject(form){
  return Object.fromEntries(new FormData(form).entries());
}
function showMsg(id, text, ok=true){
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = text;
  el.style.color = ok ? '#86efac' : '#fca5a5';
}

function toHoursMinutes(totalMinutes){
  if(totalMinutes===null || totalMinutes===undefined) return '';
  const h = Math.floor(totalMinutes/60);
  const m = totalMinutes%60;
  return `${h}h ${m}m`;
}

async function loadTable({table, select='*', targetId, order='created_at', ascending=false, transform}){
  const client = await getClient();
  let q = client.from(table).select(select);
  if(order) q = q.order(order, { ascending });
  const { data, error } = await q;
  if(error){ document.getElementById(targetId).innerHTML = `<div class="card">Error: ${error.message}</div>`; return; }
  const rows = transform ? data.map(transform) : data;
  renderTable(targetId, rows);
}

function renderTable(targetId, rows){
  const box = document.getElementById(targetId);
  if(!box) return;
  if(!rows || rows.length===0){ box.innerHTML = '<div class="card">Sin registros</div>'; return; }
  const cols = Object.keys(rows[0]);
  box.innerHTML = `<div class="card table-wrap"><table><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${r[c]??''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

async function insertRow(table, payload, msgId){
  const client = await getClient();
  const { error } = await client.from(table).insert(payload);
  if(error){ showMsg(msgId, error.message, false); return false; }
  showMsg(msgId, 'Registro guardado correctamente');
  return true;
}

async function fetchDashboard(){
  const client = await getClient();
  const [t, m, i, f, g, task, inv] = await Promise.all([
    client.from('tickets').select('id,status',{count:'exact', head:true}),
    client.from('maintenance_activities').select('id,maintenance_type,status',{count:'exact', head:true}),
    client.from('installations').select('id,status',{count:'exact', head:true}),
    client.from('feasibility_requests').select('id,status',{count:'exact', head:true}),
    client.from('expenses').select('amount_cop'),
    client.from('tasks').select('id,status,due_date'),
    client.from('v_inventory_balance').select('*')
  ]);
  const openTasks = (task.data||[]).filter(x => x.status !== 'CERRADA').length;
  const totalExpenses = (g.data||[]).reduce((a,b)=>a+(Number(b.amount_cop)||0),0);
  return {
    totalTickets: t.count || 0,
    totalMaint: m.count || 0,
    totalInst: i.count || 0,
    totalFact: f.count || 0,
    openTasks,
    totalExpenses,
    inventoryRows: inv.data || []
  };
}
