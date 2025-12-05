-- =============================================
-- DADOS INICIAIS - GESTÃO PECUÁRIA 360
-- =============================================

-- Inserir Raças Comuns
INSERT INTO racas (nome, descricao) VALUES
  ('Nelore', 'Raça zebuína mais popular no Brasil, excelente para corte'),
  ('Angus', 'Raça britânica conhecida pela qualidade da carne'),
  ('Brahman', 'Raça zebuína americana, resistente ao calor'),
  ('Hereford', 'Raça britânica, boa para cruzamentos'),
  ('Gir', 'Raça zebuína, excelente para leite'),
  ('Girolando', 'Cruzamento Gir x Holandês, dupla aptidão'),
  ('Holandês', 'Raça europeia, maior produtora de leite'),
  ('Senepol', 'Raça adaptada ao clima tropical'),
  ('Tabapuã', 'Raça zebuína brasileira'),
  ('Cruzado', 'Animais de cruzamento industrial'),
  ('Mestiço', 'Animais sem raça definida')
ON CONFLICT (nome) DO NOTHING;

-- Inserir Tipos de Vacina Comuns
INSERT INTO tipos_vacina (nome, descricao, doses_por_ano, dias_entre_doses, obrigatoria, apenas_femeas) VALUES
  ('Febre Aftosa', 'Vacina obrigatória contra febre aftosa', 2, 180, true, false),
  ('Brucelose', 'Vacina obrigatória para fêmeas de 3 a 8 meses', 1, 0, true, true),
  ('Raiva', 'Vacina contra raiva bovina', 1, 365, true, false),
  ('Clostridiose', 'Vacina polivalente contra clostrídios', 2, 180, false, false),
  ('Carbúnculo', 'Vacina contra carbúnculo sintomático', 1, 365, false, false),
  ('IBR/BVD', 'Vacina contra doenças reprodutivas', 2, 180, false, false),
  ('Leptospirose', 'Vacina contra leptospirose', 2, 180, false, false),
  ('Botulismo', 'Vacina contra botulismo', 1, 365, false, false),
  ('Vermifugação', 'Controle de parasitas internos', 4, 90, false, false)
ON CONFLICT (nome) DO NOTHING;
