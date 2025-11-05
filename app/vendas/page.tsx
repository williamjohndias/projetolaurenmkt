'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface VendaFechada {
  id_negocio: number;
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

export default function VendasFechadas() {
  const router = useRouter();
  const [vendas, setVendas] = useState<VendaFechada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id_negocio: '',
    proprietario: '',
    valor: '',
    data_fechamento: new Date().toISOString().split('T')[0]
  });
  const [showForm, setShowForm] = useState(false);

  const fetchVendas = async () => {
    try {
      const response = await fetch('/api/vendas-fechadas');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar vendas');
      }
      
      setVendas(data.vendas || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/vendas-fechadas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_negocio: parseInt(formData.id_negocio),
          proprietario: formData.proprietario,
          valor: formData.valor ? parseFloat(formData.valor) : null,
          data_fechamento: formData.data_fechamento || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao adicionar venda');
      }

      // Limpar formulário
      setFormData({
        id_negocio: '',
        proprietario: '',
        valor: '',
        data_fechamento: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      
      // Atualizar lista
      await fetchVendas();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id_negocio: number) => {
    if (!confirm('Tem certeza que deseja remover esta venda fechada?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vendas-fechadas?id_negocio=${id_negocio}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover venda');
      }

      await fetchVendas();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push('/')} className={styles.backBtn}>
          Voltar ao Dashboard
        </button>
        <h1 className={styles.title}>Gerenciar Vendas Fechadas</h1>
        <p className={styles.subtitle}>Marque manualmente as vendas que foram fechadas</p>
      </header>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.actions}>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={styles.addBtn}
        >
          {showForm ? 'Cancelar' : 'Adicionar Venda Fechada'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>ID Negócio *</label>
            <input
              type="number"
              value={formData.id_negocio}
              onChange={(e) => setFormData({ ...formData, id_negocio: e.target.value })}
              required
              placeholder="Ex: 12345"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Proprietário *</label>
            <select
              value={formData.proprietario}
              onChange={(e) => setFormData({ ...formData, proprietario: e.target.value })}
              required
              className={styles.select}
            >
              <option value="">Selecione um proprietário</option>
              {PROPRIETARIOS.map((proprietario) => (
                <option key={proprietario} value={proprietario}>
                  {proprietario}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Valor (opcional)</label>
            <input
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              placeholder="Ex: 50000.00"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Data de Fechamento</label>
            <input
              type="date"
              value={formData.data_fechamento}
              onChange={(e) => setFormData({ ...formData, data_fechamento: e.target.value })}
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Adicionar Venda
          </button>
        </form>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID Negócio</th>
              <th>Proprietário</th>
              <th>Valor</th>
              <th>Data Fechamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  Nenhuma venda fechada cadastrada
                </td>
              </tr>
            ) : (
              vendas.map((venda) => (
                <tr key={venda.id_negocio}>
                  <td>{venda.id_negocio}</td>
                  <td>{venda.proprietario}</td>
                  <td>
                    {venda.valor 
                      ? `R$ ${parseFloat(venda.valor.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : '-'
                    }
                  </td>
                  <td>{new Date(venda.data_fechamento).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(venda.id_negocio)}
                      className={styles.deleteBtn}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

