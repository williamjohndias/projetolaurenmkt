'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface Fechamento {
  id: number;
  numero: string;
  proprietario: string;
  valor: number | null;
  data_fechamento: string;
}

const PROPRIETARIOS = [
  // Equipe Ana Carolina
  'Ana Carolina',
  'Ana Campos',
  'Ana Regnier',
  'Agatha Oliveira',
  'Bruno',
  // Equipe Caroline Dandara
  'Caroline Dandara',
  'Davi',
  'Alex Henrique',
  'Assib Zattar Neto',
  // Equipe Caio
  'Caio',
  'Kauany',
  'Daniely',
  'Byanka'
].sort();

export default function Fechamentos() {
  const router = useRouter();
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    numero: '',
    proprietario: '',
    valor: '',
    data_fechamento: new Date().toISOString().split('T')[0]
  });
  const [showForm, setShowForm] = useState(false);

  const fetchFechamentos = async () => {
    try {
      const response = await fetch('/api/fechamentos');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar fechamentos');
      }
      
      setFechamentos(data.fechamentos || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFechamentos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.numero || !formData.proprietario) {
      setError('Número e Proprietário são obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/fechamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numero: formData.numero,
          proprietario: formData.proprietario,
          valor: formData.valor ? parseFloat(formData.valor) : null,
          data_fechamento: formData.data_fechamento || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao adicionar fechamento');
      }

      // Limpar formulário
      setFormData({
        numero: '',
        proprietario: '',
        valor: '',
        data_fechamento: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      
      // Recarregar lista
      fetchFechamentos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este fechamento?')) {
      return;
    }

    try {
      const response = await fetch('/api/fechamentos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover fechamento');
      }

      fetchFechamentos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando fechamentos...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Gerenciar Fechamentos</h1>
        <p className={styles.subtitle}>Adicione fechamentos manualmente (+5 pontos cada)</p>
        <div className={styles.headerActions}>
          <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
            {showForm ? 'Cancelar' : 'Adicionar Fechamento'}
          </button>
          <button onClick={() => router.push('/')} className={styles.backBtn}>
            Voltar ao Dashboard
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="numero">Número do Fechamento *</label>
            <input
              type="text"
              id="numero"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              required
              placeholder="Ex: FECH-001"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="proprietario">Proprietário *</label>
            <select
              id="proprietario"
              value={formData.proprietario}
              onChange={(e) => setFormData({ ...formData, proprietario: e.target.value })}
              required
            >
              <option value="">Selecione...</option>
              {PROPRIETARIOS.map(prop => (
                <option key={prop} value={prop}>{prop}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="valor">Valor (R$)</label>
            <input
              type="number"
              id="valor"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="data_fechamento">Data do Fechamento</label>
            <input
              type="date"
              id="data_fechamento"
              value={formData.data_fechamento}
              onChange={(e) => setFormData({ ...formData, data_fechamento: e.target.value })}
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Adicionar Fechamento
          </button>
        </form>
      )}

      <div className={styles.tableContainer}>
        <h2 className={styles.tableTitle}>Fechamentos Registrados ({fechamentos.length})</h2>
        {fechamentos.length === 0 ? (
          <p className={styles.empty}>Nenhum fechamento registrado ainda.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Número</th>
                <th>Proprietário</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {fechamentos.map((fechamento) => (
                <tr key={fechamento.id}>
                  <td>{fechamento.numero}</td>
                  <td>{fechamento.proprietario}</td>
                  <td>
                    {fechamento.valor 
                      ? `R$ ${parseFloat(fechamento.valor.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '-'
                    }
                  </td>
                  <td>{fechamento.data_fechamento ? new Date(fechamento.data_fechamento + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(fechamento.id)}
                      className={styles.deleteBtn}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

