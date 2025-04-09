import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

function NewEnrollment() {
  const [userId, setUserId] = useState('');
  const [planName, setPlanName] = useState('Mensal');
  const [status, setStatus] = useState('active');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('memberships').insert({
      user_id: userId,
      plan_name: planName,
      status,
      start_date: startDate,
      end_date: endDate,
    });

    if (error) {
      alert('Erro ao cadastrar: ' + error.message);
    } else {
      alert('Matrícula criada com sucesso!');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Nova Matrícula</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} className="border p-2 w-full" required />
        <input type="text" placeholder="Nome do Plano" value={planName} onChange={e => setPlanName(e.target.value)} className="border p-2 w-full" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="border p-2 w-full">
          <option value="active">Ativo</option>
          <option value="expired">Expirado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-2 w-full" required />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-2 w-full" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Criar Matrícula</button>
      </form>
    </div>
  );
}

export default NewEnrollment;
