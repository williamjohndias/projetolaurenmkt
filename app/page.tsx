'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface MembroData {
  nome: string;
  propostas_apresentadas: number;
  propostas_adquiridas: number;
  valor_vendido: number;
  taxa_conversao: number;
}

interface EquipeData {
  equipe: string;
  propostas_apresentadas: number;
  propostas_adquiridas: number;
  fechamentos?: number;
  meta_mes: number;
  meta_atual: number;
  pontos: number;
  taxa_conversao: number;
  meta_percentual: number;
  micro_metas_batidas?: number;
  membros?: MembroData[];
}

export default function Home() {
  const [equipes, setEquipes] = useState<EquipeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

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
      setWarning(data.warning || null);
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
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const calcularPontos = (equipe: EquipeData) => {
    let pontos = 0;
    pontos += equipe.propostas_apresentadas * 1; // +1 por proposta apresentada
    pontos += equipe.propostas_adquiridas * 1; // +1 por proposta adquirida
    pontos += (equipe.fechamentos || 0) * 5; // +5 por fechamento
    
    // +30 pontos se bateu 100% da meta do mês
    if (equipe.meta_percentual >= 100) {
      pontos += 30;
    }
    
    // +10 pontos por cada micro-meta semanal batida
    pontos += (equipe.micro_metas_batidas || 0) * 10;
    
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎄 Rumo ao Natal Campeão 🎄</h1>
               <p className={styles.subtitle}>Campanha de Vendas • 06/11 a 20/12</p>
               <div className={styles.headerActions}>
                 <button onClick={fetchData} className={styles.refreshBtn}>
                   Atualizar
                 </button>
                 <a href="/pontos" className={styles.pontosBtn}>
                   Ver Ranking de Pontos
                 </a>
                 <a href="/vendas" className={styles.vendasBtn}>
                   Gerenciar Vendas Fechadas
                 </a>
               </div>
      </header>

      {warning && !error && (
        <div className={styles.warning}>
          <div className={styles.warningHeader}>
            Aviso
          </div>
          <div className={styles.warningMessage}>{warning}</div>
          <div className={styles.errorActions}>
            <a href="/api/check-table-structure" target="_blank" className={styles.testBtn}>
              Ver Estrutura da Tabela
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <div className={styles.errorHeader}>
            Erro ao carregar dados
          </div>
          <div className={styles.errorMessage}>{error}</div>
          <div className={styles.errorActions}>
            <button onClick={fetchData} className={styles.retryBtn}>
              Tentar Novamente
            </button>
            <a href="/api/test-connection" target="_blank" className={styles.testBtn}>
              Testar Conexão
            </a>
            <a href="/api/check-table-structure" target="_blank" className={styles.testBtn}>
              Ver Estrutura
            </a>
          </div>
          <div className={styles.errorTips}>
            <strong>Dicas para resolver:</strong>
            <ul>
              <li>Verifique se o banco de dados RDS está acessível</li>
              <li>Execute o script <code>database-setup.sql</code> para criar a tabela</li>
              <li>Verifique se o Security Group do RDS permite conexões do seu IP</li>
              <li>Confirme se as credenciais estão corretas</li>
            </ul>
          </div>
        </div>
      )}

      <div className={styles.leaderboard}>
        {equipesOrdenadas.map((equipe, index) => {
          const pontosCalculados = calcularPontos(equipe);
          const isCampeao = false; // Desabilitado temporariamente
          
          return (
            <div 
              key={equipe.equipe} 
              className={`${styles.card} ${isCampeao ? styles.campeao : ''}`}
              data-equipe={equipe.equipe}
            >
              {isCampeao && <div className={styles.trofeu}>TROFEU</div>}
              
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.equipeName}>
                    {equipe.equipe}
                    {isCampeao && <span className={styles.badge}>CAMPEÃO</span>}
                  </h2>
                  <div className={styles.membrosList}>
                    {equipe.equipe === 'Ana Carolina' && (
                      <>
                        <span className={styles.faixa} style={{color: '#A77E22'}}>Faixa Marrom</span>
                        <div className={styles.membros}>
                          <div className={styles.membroItem}>
                            <strong>Líder:</strong> Ana Carolina
                          </div>
                          <div className={styles.membroItem}>Ana Campos</div>
                          <div className={styles.membroItem}>Ana Regnier</div>
                          <div className={styles.membroItem}>Agatha Oliveira</div>
                          <div className={styles.membroItem}>Bruno</div>
                        </div>
                      </>
                    )}
                    {equipe.equipe === 'Caroline Dandara' && (
                      <>
                        <span className={styles.faixa} style={{color: '#C9A33E'}}>Faixa Azul</span>
                        <div className={styles.membros}>
                          <div className={styles.membroItem}>
                            <strong>Líder:</strong> Caroline Dandara
                          </div>
                          <div className={styles.membroItem}>Davi</div>
                          <div className={styles.membroItem}>Alex Henrique</div>
                          <div className={styles.membroItem}>Assib Zattar Neto</div>
                        </div>
                      </>
                    )}
                    {equipe.equipe === 'Caio' && (
                      <>
                        <span className={styles.faixa} style={{color: '#C9A33E'}}>Faixa Azul</span>
                        <div className={styles.membros}>
                          <div className={styles.membroItem}>
                            <strong>Líder:</strong> Caio
                          </div>
                          <div className={styles.membroItem}>Kauany</div>
                          <div className={styles.membroItem}>Daniely</div>
                          <div className={styles.membroItem}>Byanka</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.pontosTotal}>
                  {pontosCalculados} pontos
                </div>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>Propostas Apresentadas</div>
                  <div className={styles.metricValue}>
                    {equipe.propostas_apresentadas}
                  </div>
                  <div className={styles.metricPoints}>
                    +{equipe.propostas_apresentadas * 1} pts
                  </div>
                </div>

                <div className={styles.metric}>
                  <div className={styles.metricLabel}>Propostas Adquiridas</div>
                  <div className={styles.metricValue}>
                    {equipe.propostas_adquiridas}
                  </div>
                  <div className={styles.metricPoints}>
                    +{equipe.propostas_adquiridas * 1} pts
                  </div>
                </div>

                <div className={styles.metric}>
                  <div className={styles.metricLabel}>Fechamentos</div>
                  <div className={styles.metricValue}>
                    {equipe.fechamentos || 0}
                  </div>
                  <div className={styles.metricPoints}>
                    +{(equipe.fechamentos || 0) * 5} pts
                  </div>
                </div>
              </div>

              <div className={styles.metaSection}>
                <div className={styles.metaHeader}>
                  <span>Meta do Mês</span>
                  <span className={styles.metaPercentual}>
                    {equipe.meta_percentual}%
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${Math.min(equipe.meta_percentual, 100)}%` }}
                  />
                </div>
                <div className={styles.metaValues}>
                  <span>R$ {equipe.meta_atual.toLocaleString('pt-BR')}</span>
                  <span>de R$ {equipe.meta_mes.toLocaleString('pt-BR')}</span>
                </div>
                       {equipe.meta_percentual >= 100 && (
                         <div className={styles.bonusBadge}>
                           +30 pontos bônus (Meta do mês batida!)
                         </div>
                       )}
                       {equipe.micro_metas_batidas && equipe.micro_metas_batidas > 0 && (
                         <div className={styles.bonusBadge}>
                           +{equipe.micro_metas_batidas * 10} pontos bônus ({equipe.micro_metas_batidas} micro-meta{equipe.micro_metas_batidas > 1 ? 's' : ''} batida{equipe.micro_metas_batidas > 1 ? 's' : ''})
                         </div>
                       )}
              </div>

              <div className={styles.ranking}>
                Posição #{index + 1}
              </div>

              {equipe.membros && equipe.membros.length > 0 && (
                <div className={styles.membrosMetrics}>
                  <h3 className={styles.membrosMetricsTitle}>Métricas Individuais</h3>
                  <div className={styles.membrosGrid}>
                    {equipe.membros.map((membro, membroIndex) => (
                      <div key={membroIndex} className={styles.membroMetricCard}>
                        <div className={styles.membroNome}>{membro.nome}</div>
                        <div className={styles.membroStats}>
                          <div className={styles.membroStat}>
                            <span className={styles.membroStatLabel}>Apresentadas:</span>
                            <span className={styles.membroStatValue}>{membro.propostas_apresentadas}</span>
                          </div>
                          <div className={styles.membroStat}>
                            <span className={styles.membroStatLabel}>Adquiridas:</span>
                            <span className={styles.membroStatValue}>{membro.propostas_adquiridas}</span>
                          </div>
                          <div className={styles.membroStat}>
                            <span className={styles.membroStatLabel}>Valor:</span>
                            <span className={styles.membroStatValue}>R$ {membro.valor_vendido.toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Regras da Gincana</h3>
            <ul>
                     <li>+1 ponto por proposta apresentada</li>
                     <li>+1 ponto por proposta adquirida</li>
                     <li>+5 pontos por fechamento</li>
                     <li>+30 pontos bônus ao bater 100% da meta do mês</li>
                     <li>+10 pontos bônus por cada micro-meta semanal batida</li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h3>Premiação</h3>
            <p>Day-off + Experiência de Bem-Estar</p>
          </div>
          <div className={styles.footerSection}>
                   <h3>Período</h3>
                   <p>06 de Novembro a 20 de Dezembro</p>
            <p className={styles.footerCopyright}>
              © 2025 Rumo ao Natal Campeão
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
