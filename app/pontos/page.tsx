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
        <h1 className={styles.title}>🎄 Ranking de Pontos 🎄</h1>
        <p className={styles.subtitle}>Campanha Rumo ao Natal Campeão • 06/11 a 20/12</p>
        <div className={styles.headerActions}>
          <button onClick={fetchData} className={styles.refreshBtn}>
            Atualizar
          </button>
          <Link href="/" className={styles.dashboardBtn}>
            Ver Dashboard Completo
          </Link>
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
              style={{
                borderLeftColor: corEquipe,
                boxShadow: isPrimeiro ? `0 8px 24px ${corEquipe}40` : undefined
              }}
            >
              {isPrimeiro && (
                <div className={styles.trofeu} style={{ backgroundColor: corEquipe }}>
                  🏆 LÍDER
                </div>
              )}

              <div className={styles.cardHeader}>
                <div className={styles.rankingPosition}>
                  <span className={styles.positionNumber}>#{index + 1}</span>
                </div>
                <div className={styles.cardContent}>
                  <h2 className={styles.equipeName} style={{ color: corEquipe }}>
                    {nomeDisplay}
                  </h2>
                  <div className={styles.pontosTotal} style={{ color: corEquipe }}>
                    {pontosCalculados} pontos
                  </div>
                </div>
              </div>

              <div className={styles.pontosBreakdown}>
                <div className={styles.pontoItem}>
                  <span className={styles.pontoLabel}>Propostas Apresentadas:</span>
                  <span className={styles.pontoValue}>{equipe.propostas_apresentadas} × 1 =</span>
                  <span className={styles.pontoTotal}>{equipe.propostas_apresentadas * 1} pts</span>
                </div>
                <div className={styles.pontoItem}>
                  <span className={styles.pontoLabel}>Propostas Adquiridas:</span>
                  <span className={styles.pontoValue}>{equipe.propostas_adquiridas} × 1 =</span>
                  <span className={styles.pontoTotal}>{equipe.propostas_adquiridas * 1} pts</span>
                </div>
                {(equipe.fechamentos || 0) > 0 && (
                  <div className={styles.pontoItem}>
                    <span className={styles.pontoLabel}>Fechamentos:</span>
                    <span className={styles.pontoValue}>{equipe.fechamentos || 0} × 5 =</span>
                    <span className={styles.pontoTotal}>{(equipe.fechamentos || 0) * 5} pts</span>
                  </div>
                )}
                {equipe.meta_percentual >= 100 && (
                  <div className={styles.pontoItem}>
                    <span className={styles.pontoLabel}>Bônus Meta do Mês (100%):</span>
                    <span className={styles.pontoValue}>+</span>
                    <span className={styles.pontoTotal}>30 pts</span>
                  </div>
                )}
                {(equipe.micro_metas_batidas || 0) > 0 && (
                  <div className={styles.pontoItem}>
                    <span className={styles.pontoLabel}>Micro-Metas Semanais:</span>
                    <span className={styles.pontoValue}>{equipe.micro_metas_batidas || 0} × 10 =</span>
                    <span className={styles.pontoTotal}>{(equipe.micro_metas_batidas || 0) * 10} pts</span>
                  </div>
                )}
                <div className={styles.pontoSeparator}></div>
                <div className={styles.pontoItemTotal}>
                  <span className={styles.pontoLabelTotal}>TOTAL:</span>
                  <span className={styles.pontoTotalGrande} style={{ color: corEquipe }}>
                    {pontosCalculados} pontos
                  </span>
                </div>
              </div>

              <div className={styles.metaInfo}>
                <div className={styles.metaStatus}>
                  <span>Meta de Vendas: {equipe.meta_percentual}%</span>
                  {equipe.meta_percentual >= 100 && (
                    <span className={styles.metaBonus}>+30 pts bônus</span>
                  )}
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${Math.min(equipe.meta_percentual, 100)}%`,
                      backgroundColor: corEquipe
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Sistema de Pontuação</h3>
            <ul>
              <li>+1 ponto por proposta apresentada</li>
              <li>+1 ponto por proposta adquirida</li>
              <li>+5 pontos por fechamento</li>
              <li>+30 pontos bônus ao bater 100% da meta do mês</li>
              <li>+10 pontos bônus por cada micro-meta semanal batida</li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h3>Período</h3>
            <p>06 de Novembro a 20 de Dezembro</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

