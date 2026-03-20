import { useState, useEffect } from 'react'
import './App.css'
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

function App() {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [completadas, setCompletadas] = useState({});

  const API_URL = "https://sef1f2a0y9.execute-api.us-east-1.amazonaws.com/tareas";

  const getHeaders = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
    } catch (error) { return { "Content-Type": "application/json" }; }
  };

  const obtenerTareas = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTareas(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  };

  const manejarAccion = async () => {
    if (!nuevaTarea.trim()) return;
    const metodo = editandoId ? "PUT" : "POST";
    const body = editandoId ? { id: editandoId, info: nuevaTarea } : { info: nuevaTarea };
    await fetch(API_URL, { method: metodo, headers: await getHeaders(), body: JSON.stringify(body) });
    setNuevaTarea(""); setEditandoId(null); obtenerTareas();
  };

  const eliminarTarea = async (id) => {
    await fetch(API_URL, { method: "DELETE", headers: await getHeaders(), body: JSON.stringify({ id }) });
    obtenerTareas();
  };

  const toggleHecho = (id) => { setCompletadas(prev => ({ ...prev, [id]: !prev[id] })); };

  useEffect(() => { obtenerTareas(); }, []);

  const tareasPendientes = tareas.filter(t => !completadas[t.id]);
  const tareasHechas = tareas.filter(t => completadas[t.id]);

  return (
    <Authenticator.Provider>
      <div className="App">
        <h1>Mis Tareas ✨</h1>

        <Authenticator>
          {({ signOut, user }) => (
            <main>
              <div className="user-info-panel">
                <span>Hola, <b>{user.signInDetails?.loginId}</b></span>
                <button onClick={signOut} className="btn-logout">Salir</button>
              </div>

              <div className="input-group">
                <input 
                  className="task-input"
                  value={nuevaTarea} 
                  onChange={(e) => setNuevaTarea(e.target.value)} 
                  placeholder="Escribe algo lindo..." 
                />
                <button onClick={manejarAccion} className="btn-primary-action">
                  {editandoId ? "Guardar" : "Añadir"}
                </button>
              </div>
              
              {/* RECUADRO PENDIENTES */}
              <div className="section-container pending-section">
                <h2 className="section-title">Pendientes 🎀</h2>
                <ul className="task-list-display">
                  {tareasPendientes.map(t => (
                    <li key={t.id} className="task-item-card">
                      <span className="task-content-text">{t.info}</span>
                      <div className="task-actions-group">
                        <button onClick={() => toggleHecho(t.id)} className="btn-icon">✔️</button>
                        <button onClick={() => {setNuevaTarea(t.info); setEditandoId(t.id);}} className="btn-icon">✏️</button>
                        <button onClick={() => eliminarTarea(t.id)} className="btn-icon">🗑️</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* RECUADRO LOGRADO */}
              {tareasHechas.length > 0 && (
                <div className="section-container done-section">
                  <h2 className="section-title">¡Logrado! 🌸</h2>
                  <ul className="task-list-display">
                    {tareasHechas.map(t => (
                      <li key={t.id} className="task-item-card completed-card">
                        <span className="task-content-text done-text">{t.info}</span>
                        <div className="task-actions-group">
                          <button onClick={() => toggleHecho(t.id)} className="btn-icon">✖️</button>
                          <button onClick={() => eliminarTarea(t.id)} className="btn-icon">🗑️</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </main>
          )}
        </Authenticator>
      </div>
    </Authenticator.Provider>
  );
}

export default App;