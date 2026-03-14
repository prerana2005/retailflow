import React, { useState } from 'react';
import axios from 'axios';

export default function Auth({ user, setUser }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username:'', password:'' });
  const [msg, setMsg] = useState('');

  function submit(e) {
    e.preventDefault();
    const url = mode === 'login' ? '/users/login' : '/users/register';
    axios.post(url, form)
      .then(r => {
        if(mode === 'login') {
          setUser(form.username);
          localStorage.setItem('token', r.data.token);
          setMsg('Logged in as ' + form.username);
        } else {
          setMsg('Registered! Now login.');
          setMode('login');
        }
      })
      .catch(e => {
        console.log('Error:', e.response);
        setMsg(e.response?.data?.error || 'Something went wrong');
      });
  }

  if(user) return (
    <div className="form">
      <h2>Welcome, {user}</h2>
      <p style={{marginBottom:'1rem',color:'#666'}}>You are logged in.</p>
      <button className="btn btn-primary" onClick={() => { setUser(null); localStorage.removeItem('token'); }}>Logout</button>
    </div>
  );

  return (
    <div className="form">
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      {msg && <div className={`msg ${msg.includes('Logged')||msg.includes('Register')?'success':'error'}`}>{msg}</div>}
      <form onSubmit={submit}>
        <input placeholder="Username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required />
        <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
        <button type="submit" className="btn btn-primary">{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
      <p style={{marginTop:'1rem',fontSize:'0.9rem',textAlign:'center'}}>
        {mode==='login' ? "No account? " : "Have an account? "}
        <span style={{color:'#e94560',cursor:'pointer'}} onClick={()=>setMode(mode==='login'?'register':'login')}>
          {mode==='login' ? 'Register' : 'Login'}
        </span>
      </p>
    </div>
  );
}
