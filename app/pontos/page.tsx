'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

interface EquipeData {
  equipe: string;
  nome_display?: string;
  cor_equipe?: string;
  propostas_apresentadas: number;
  propostas_adquiridas: number;
  fechamentos?: number;
  meta_mes: number;
  meta_atual: number;
  pontos: number;
  taxa_conversao: number;
  meta_percentual: number;
  micro_metas_batidas?: number;
}

export default function PontosPage() {
  const [equipes, setEquipes] = useState<EquipeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        cache: 'no-store'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Erro ao buscar dados');
      }

      setEquipes(data.equipes || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao carregar dados. Verifique a conexão com o banco de dados.';
      setError(errorMessage);
      console.error('Erro detalhado:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const calcularPontos = (equipe: EquipeData) => {
    let pontos = 0;
    pontos += equipe.propostas_apresentadas * 1; // +1 por proposta apresentada
    pontos += equipe.propostas_adquiridas * 1; // +1 por proposta adquirida
    pontos += (equipe.fechamentos || 0) * 5; // +5 por fechamento

    if (equipe.meta_percentual >= 100) {
      pontos += 30; // +30 pontos se bateu 100% da meta do mês
    }

    pontos += (equipe.micro_metas_batidas || 0) * 10; // +10 por cada micro-meta batida

    return pontos;
  };

  const equipesOrdenadas = equipes.length > 0 ? [...equipes].sort((a, b) => {
    const pontosA = calcularPontos(a);
    const pontosB = calcularPontos(b);
    return pontosB - pontosA;
  }) : [];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando dados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorHeader}>Erro ao carregar dados</div>
          <div className={styles.errorMessage}>{error}</div>
          <button onClick={fetchData} className={styles.retryBtn}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>HIGH SCORE</h1>
        <p className={styles.subtitle}>06/11 - 20/12</p>
        <div className={styles.headerActions}>
          <button onClick={fetchData} className={styles.refreshBtn}>REFRESH</button>
          <Link href="/" className={styles.dashboardBtn}>DASHBOARD</Link>
        </div>
      </header>

      <div className={styles.ranking}>
        {equipesOrdenadas.map((equipe, index) => {
          const pontosCalculados = calcularPontos(equipe);
          const corEquipe = equipe.cor_equipe || '#D2AF52';
          const nomeDisplay = equipe.nome_display || equipe.equipe;
          const isPrimeiro = index === 0;

          return (
            <div
              key={equipe.equipe}
              className={`${styles.card} ${isPrimeiro ? styles.primeiro : ''}`}
            >
              <div className={styles.cardFrame}>
                <div className={styles.cardHeader}>
                  <div className={styles.rankBadge}>
                    <span className={styles.rankNumber}>{index + 1}</span>
                  </div>
                  {isPrimeiro && <div className={styles.crown}>👑</div>}
                  <h2 className={styles.equipeName}>{nomeDisplay}</h2>
                </div>
                
                <div className={styles.scoreContainer}>
                  <div className={styles.scoreLabel}>PONTOS</div>
                  <div className={styles.scoreValue} style={{ color: corEquipe }}>
                    {pontosCalculados}
                  </div>
                </div>

                <div className={styles.metricsRow}>
                  <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>📊</div>
                    <div className={styles.metricInfo}>
                      <div className={styles.metricNumber}>{equipe.propostas_apresentadas}</div>
                      <div className={styles.metricLabel}>Apresentadas</div>
                    </div>
                  </div>
                  <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>✅</div>
                    <div className={styles.metricInfo}>
                      <div className={styles.metricNumber}>{equipe.propostas_adquiridas}</div>
                      <div className={styles.metricLabel}>Adquiridas</div>
                    </div>
                  </div>
                  <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>🎯</div>
                    <div className={styles.metricInfo}>
                      <div className={styles.metricNumber}>{equipe.fechamentos || 0}</div>
                      <div className={styles.metricLabel}>Fechamentos</div>
                    </div>
                  </div>
                </div>

                {equipe.meta_percentual >= 100 && (
                  <div className={styles.bonusBadge}>
                    <span className={styles.bonusIcon}>⭐</span>
                    <span>Meta 100% +30pts</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

