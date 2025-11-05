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
  const [authenticated, setAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ usuario: '', senha: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
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

  useEffect(() => {
    // Verificar se já está autenticado
    const isAuth = sessionStorage.getItem('vendas_authenticated') === 'true';
    setAuthenticated(isAuth);
    if (isAuth) {
      fetchVendas();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('vendas_authenticated', 'true');
        setAuthenticated(true);
        fetchVendas();
      } else {
        setLoginError(data.error || 'Usuário ou senha incorretos');
      }
    } catch (err: any) {
      setLoginError('Erro ao fazer login. Tente novamente.');
    }
  };

  const fetchVendas = async () => {
    try {
      setLoading(true);
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

  const handleLogout = () => {
    sessionStorage.removeItem('vendas_authenticated');
    setAuthenticated(false);
    setLoginForm({ usuario: '', senha: '' });
  };


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
          data_fechamento: formData.data_fechamento && formData.data_fechamento.trim() !== '' ? formData.data_fechamento : null
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

  if (!authenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loginContainer}>
          <h1 className={styles.title}>Acesso Restrito</h1>
          <p className={styles.subtitle}>Faça login para gerenciar vendas fechadas</p>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            {loginError && (
              <div className={styles.error}>
                {loginError}
              </div>
            )}
            <div className={styles.formGroup}>
              <label htmlFor="usuario">Usuário</label>
              <input
                type="text"
                id="usuario"
                value={loginForm.usuario}
                onChange={(e) => setLoginForm({ ...loginForm, usuario: e.target.value })}
                required
                placeholder="Digite seu usuário"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="senha">Senha</label>
              <input
                type="password"
                id="senha"
                value={loginForm.senha}
                onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                required
                placeholder="Digite sua senha"
              />
            </div>
            <button type="submit" className={styles.submitBtn}>
              Entrar
            </button>
          </form>
          <button onClick={() => router.push('/')} className={styles.backBtn}>
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

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
        <div className={styles.headerActions}>
          <button onClick={() => router.push('/')} className={styles.backBtn}>
            Voltar ao Dashboard
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sair
          </button>
        </div>
        <h1 className={styles.title}>Gerenciar Vendas Fechadas</h1>
        <p className={styles.subtitle}>Marque manualmente as vendas que foram fechadas (+5 pontos cada)</p>
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
                  <td>
                    {(() => {
                      if (!venda.data_fechamento) return '-';
                      try {
                        const dateStr = String(venda.data_fechamento);
                        // Se já vem como string no formato YYYY-MM-DD, usar diretamente
                        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                          const [ano, mes, dia] = dateStr.split('-');
                          return `${dia}/${mes}/${ano}`;
                        }
                        // Se for um objeto Date ou outra string, tentar converter
                        const date = new Date(dateStr + 'T12:00:00');
                        if (isNaN(date.getTime())) {
                          return '-';
                        }
                        return date.toLocaleDateString('pt-BR');
                      } catch {
                        return '-';
                      }
                    })()}
                  </td>
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

