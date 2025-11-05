-- Script de configuração do banco de dados para o Dashboard "Rumo ao Natal Campeão"
-- Execute este script no banco de dados PostgreSQL

-- Criar tabela dashmetas se não existir
CREATE TABLE IF NOT EXISTS dashmetas (
  id SERIAL PRIMARY KEY,
  equipe VARCHAR(50) NOT NULL UNIQUE,
  propostas_apresentadas INTEGER DEFAULT 0,
  propostas_adquiridas INTEGER DEFAULT 0,
  meta_mes INTEGER DEFAULT 0,
  meta_atual INTEGER DEFAULT 0,
  pontos INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir as 3 equipes iniciais (se não existirem)
INSERT INTO dashmetas (equipe, propostas_apresentadas, propostas_adquiridas, meta_mes, meta_atual, pontos)
VALUES 
  ('Caroline', 0, 0, 100000, 0, 0),
  ('Ana', 0, 0, 100000, 0, 0),
  ('Caio', 0, 0, 100000, 0, 0)
ON CONFLICT (equipe) DO NOTHING;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_equipe ON dashmetas(equipe);

-- Exemplo de atualização de dados (substitua pelos valores reais)
-- UPDATE dashmetas 
-- SET 
--   propostas_apresentadas = 10,
--   propostas_adquiridas = 3,
--   meta_atual = 45000,
--   updated_at = CURRENT_TIMESTAMP
-- WHERE equipe = 'Caroline';
