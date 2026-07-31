const BAIRROS_POR_REGIAO: Record<string, string[]> = {
  Anhanduizinho: [
    'Aero Rancho', 'Loteamento Aero Rancho', 'Núcleo Habitacional Aero Rancho', 'Núcleo Habitacional Aero Rancho II', 'Núcleo Habitacional Aero Rancho III', 'Núcleo Habitacional Aero Rancho IV', 'Núcleo Habitacional Aero Rancho V', 'Núcleo Aero Rancho I Q.21', 'Jardim Aero Rancho', 'Conjunto Aero Rancho', 'Jardim das Hortênsias I', 'Jardim das Hortênsias II', 'Jardim das Hortênsias III', 'Granja São Luiz 2ª Seção', 'Loteamento Guanandi II', 'Guanandi II',
    'Centro-Oeste', 'Centro Oeste', 'Jardim Centro Oeste', 'Jardim Marajoara', 'Jardim Bálsamo', 'Jardim Campo Nobre', 'Jardim das Macaúbas', 'Jardim das Meninas', 'Loteamento Municipal Brandão', 'Núcleo Jardim das Macaúbas', 'Jardim Canguru', 'Jardim Paulo Coelho Machado', 'Parque Novo Século', 'Jardim Mário Covas', 'Varandas do Campo', 'Residencial Ramez Tebet',
    'Parati', 'Jardim Parati', 'Jardim Parati II', 'Granja Bandeira', 'Loteamento Alto da Boa Vista', 'Jardim das Nações',
    'Alves Pereira', 'Vila Alves Pereira', 'Núcleo Alves Pereira', 'Universitário Seção D', 'Jardim Monumento', 'Vila Antunes', 'Parque do Trabalhador', 'Residencial João Scarano', 'Jardim Colibri', 'Jardim Colibri II', 'Núcleo Habitacional Universitárias I', 'Núcleo Habitacional Universitárias II', 'Núcleo Habitacional Universitárias', 'Jardim Macapá', 'Loteamento Municipal Alan Soares', 'Núcleo Colibri II', 'Jardim Nashville', 'Vila Clélia', 'Loteamento Porto Seguro', 'Residencial Ilhéus', 'Cidade Nova',
    'América', 'Vila Jardim América', 'Jardim América', 'Vila Valparaíso', 'Vila Progresso',
    'Centenário', 'Jardim Centenário', 'Jardim Monte Alegre', 'Desmembramento Carlinda Pereira Contar', 'Vila Nogueira', 'Vila Amapá', 'Vila Aimoré', 'Vila Aimoré II', 'Parque Residencial Iracy Coelho Netto', 'Parque Residencial Iracy Coelho Netto II', 'Parque Residencial Iracy Coelho Netto III', 'Conjunto Iracy Coelho', 'Conjunto Iracy Coelho II', 'Conjunto Iracy Coelho III', 'Núcleo Centenário', 'Núcleo Vila Nogueira', 'Jardim Pênfigo', 'Residencial Vila Bela', 'Residencial Ouro Preto', 'Jardim Manaíra', 'Jardim Monterey', 'Jardim Radialista', 'Loteamento Residencial Cedrinho', 'Jardim das Princesas I', 'Jardim das Princesas II', 'Vila Áurea',
    'Guanandi', 'Favela Dona Neta', 'Favela Núcleo Guanandi I',
    'Jacy', 'Jardim Jacy', 'Vila Nova Bandeirantes',
    'Jockey Club', 'Vila Jardim Jockey Club', 'Jardim Jockey Club', 'Vila Marcos Roberto', 'Vila Bom Jesus', 'Vila Santa Amélia Baís', 'Residencial Santa Celina',
    'Lageado', 'Parque do Lageado', 'Loteamento Municipal Dom Antônio Barbosa', 'Parque do Sol', 'Jardim Colorado', 'Residencial José Teruel Filho', 'Parque dos Sabiás',
    'Los Angeles', 'Jardim Los Angeles', 'Jardim Sumatra', 'Jardim Morada do Sol', 'Jardim Uirapuru', 'Loteamento Vespasiano Martins', 'Residencial Terra Morena',
    'Pioneiros', 'Jardim Colonial', 'Residencial do Lago', 'Vila Adelina', 'Vila Maciel', 'Universitário Seção C', 'Vila Jardim Pioneiros', 'Vila Santa Branca', 'Vila Santa Branca 2ª Seção', 'Jardim Santa Úrsula', 'Recanto das Andorinhas', 'Jardim das Mansões Universitárias', 'Conjunto Habitacional Jardim Anápolis', 'Jardim Anápolis', 'Jardim Anápolis I', 'Jardim Rubiácea', 'Jardim Jane', 'Jardim Botafogo', 'Jardim Morenão', 'Jardim Vicentino', 'Jardim Roselândia', 'Residencial Botafogo', 'Parque Residencial Lisboas', 'Jardim Botânico', 'Jardim Botânico II', 'Jardim Agulhas Negras', 'Porto Galo', 'Residencial Geraldo Correa da Silva',
    'Piratininga', 'Vila Piratininga', 'Jardim Nhanhá', 'Promorar', 'Vila Ipiranga', 'Núcleo Piratininga', 'Vila Getúlia Barbosa', 'Vitta Bella',
    'Taquarussu', 'Taquarussú', 'Vila Taquarussu', 'Vila Taquarussú', 'Jardim Taquarussu', 'Cohafama', 'Vila Santo Afonso', 'Vila Afonso Pena', 'Vila Afonso Pena Júnior', 'Vila Itamarati',
  ],
  Bandeira: [
    'Maria Aparecida Pedrossian', 'Parque Residencial Maria Aparecida Pedrossian', 'Panorama', 'Núcleo Panorama', 'Vivendas do Parque', 'Jardim Samambaia', 'Residencial Oiti', 'Parque Residencial Damha', 'Parque Residencial Damha II', 'Parque Residencial Damha III', 'Parque Residencial Damha IV', 'Residencial Damha', 'Residencial Damha II', 'Residencial Damha III',
    'Tiradentes', 'Tiradentes Suplemento', 'Tiradentes 2ª Seção', 'Residencial Nova Tiradentes', 'Jardim Flamboyant', 'Jardim Flamboyant II', 'Parque Residencial Arnaldo Estevão de Figueiredo', 'Parque Residencial Arnaldo Estevão de Figueiredo II', 'Arnaldo Estevão Figueiredo', 'Parque Residencial Arnaldo Estevão Figueiredo', 'Loteamento Municipal Dalva de Oliveira', 'Loteamento Municipal Dalva de Oliveira II', 'Loteamento Municipal Cavan', 'Núcleo Tiradentes', 'Regina', 'Residencial Itatiaia', 'Jardim Itatiaia', 'Vila Jardim São Bernardo', 'Jardim Vitória', 'Parque Residencial Anhembi', 'Loteamento Portobello', 'Loteamento Marçal de Souza', 'Jardim Cristo Redentor', 'Loteamento Estrela Parque', 'Jardim São Judas Tadeu', 'Jardim Jerusalém', 'Desbarrancado',
    'São Lourenço', 'Jardim São Lourenço', 'Jardim Ibirapuera', 'Vila Almeida Lima', 'Vila Zoe', 'Vila Antônio Vendas',
    'Vilasboas', 'Vilas Boas', 'Vila Vilasboas', 'Vila Vilas Boas', 'Jardim Alegre', 'Vila Portinho Frederico Pache', 'Indiana Park', 'Jardim Mansur', 'Jardim Auxiliadora', 'Jardim Ipanema', 'Parque Dallas', 'Residencial Vila Olímpica', 'Villas Park Residence', 'Amantini Residence',
    'TV Morena', 'Jardim TV Morena', 'Jardim Paulista', 'Paranaense', 'Vila Carlota', 'Vila Progresso 2ª Seção',
    'Dr. Albuquerque', 'Vila Dr. Albuquerque', 'Vila Albuquerque', 'Vila Olinda', 'Vila Progresso 3º Seção',
    'Carlota', 'Vila Ieda', 'Vila Morumbi', 'Jardim Itapema',
    'Rita Vieira', 'Parque Rita Vieira', 'Parque Residencial Rita Vieira', 'Vila Dom Pedrito', 'Coopharádio', 'Chácara José Antônio Pereira', 'Jardim Lagoa Dourada', 'Jardim Nossa Senhora do Perpétuo Socorro', 'Jardim Itamaracá', 'Jardim Anhanguera', 'Jardim Águas Vivas',
    'Universitário', 'Universitário Seção A', 'Universitário Seção B', 'Residencial Betaville', 'Vila Concórdia', 'Vila Santo Eugênio', 'Jardim Ametista', 'Jardim Tropical', 'Pequena Flor I', 'Jardim das Perdizes', 'Recanto das Palmeiras', 'Jardim Campo Limpo', 'Núcleo Habitacional Recanto dos Rouxinóis', 'Jardim Moema', 'Sitiocas Alvorada', 'Jardim Campina Verde', 'Jardim Campo Alto', 'Jardim Pacaembu', 'Núcelo Campina Verde', 'Jardim Indianápolis', 'Vila Julieta', 'Jardim Antares', 'Edson Brito Garcia', 'Loteamento Volpe', 'Loteamento Volpe II',
    'Moreninha', 'Moreninhas', 'Vila Moreninha', 'Vila Moreninha II', 'Vila Moreninha III', 'Núcleo Habitacional Moreninha I', 'Núcleo Habitacional Moreninha II', 'Núcleo Habitacional Moreninha III', 'Loteamento Moreninha IV', 'Chácara Novo Horizonte', 'Jardim Santa Felicidade', 'Vila Cidade Morena', 'Loteamento Municipal Ribeira', 'Jardim Gramado', 'Jardim Nova Capital', 'Jardim Nova Jerusalém', 'Jardim do Córrego', 'Residencial Terra dos Pequis', 'Paraíso do Lageado',
  ],
  Centro: [
    'Centro', 'Cidade', 'Vila Alta', 'Vila General Wolfgrand', 'Vila América', 'Vila Ilgenfritz', 'Vila Clementina', 'Jardim Aclimação', 'Vila Bartiria',
    'São Francisco', 'Vila São Francisco', 'Vila Helena', 'Vila Anfe', 'Vila Cristina', 'Vila São Sebastião', 'Vila Aprazível', 'Jardim Cidade', 'Jardim Brasil', 'Vila Alto das Paineiras', 'Sanziro Katayama', 'Vila São Thomé', 'Vila Capri', 'Vila Benjamim', 'Nossa Senhora de Fátima', 'Vila Esplanada', 'Vila São Luís', 'Cofermat', 'Vila Santa Bárbara', 'Vila Lídia', 'Cascudo', 'Jardim São Paulo',
    'Cruzeiro', 'Clube Campestre Ypê', 'Vila Rosa', 'Vila Marman', 'Vila Gomes', 'Vila Célia', 'Vila Sílvia 2ª Seção', 'Coophagrande', 'Conjunto Eudes Costa', 'Vila Suíça', 'Conjunto Residencial Monte Castelo', 'Coophaban', 'Monte Castelo', 'Coronel Antonino',
    'Jardim dos Estados', 'Vila Santa Odete', 'Vila Guaraciaba', 'Vila Tupaceretan', 'Vila Esportiva', 'Vila XV de novembro', 'Jardim 7 de Setembro', 'Vila Mandeta', 'Vila São Jorge', 'Cachoeira', 'Vila Onze', 'Vila São Gabriel', 'Vila Mariana', 'Vila Bernardo Goldman', 'Vila Isís', 'Vila Abdo', 'Vila Alto Campo de Marte', 'Vila Santério', 'Vila da Saúde', 'Vila Paulistana', 'Vila Paraíso', 'Vila Paraíso Suplemento', 'Vila São Elias', 'Vila Lia', 'Chácara dos Coqueiros', 'Vila Rolim', 'Desmembramento Clara Goldman', 'Desmembramento Hugo Zapata', 'Vila Santos Gomes', 'Vila Suburbano', 'Vila Sant’ana', 'Vila Maria', 'Chácara Cachoeira', 'Cachoeirinha',
    'Bela Vista', 'Jardim Bela Vista', 'Vila Costa Lima', 'Jardim Santa Catarina', 'Chácara Vendas', 'Jardim Nova Era', 'Residencial Village', 'Desmembramento Antônio Vendas', 'Vila Miguel Couto', 'Desmembramento Chácara Vendas', 'Chácara Boa Vista', 'Villa Di Parma',
    'Itanhangá', 'Itanhangá Park', 'Jardim Piracicaba', 'Vila Gatão', 'Vila Rosa Pires', 'Vila Dr. João Rosa', 'Vila Rezende', 'Jardim Vista Alegre', 'Vila Joselito', 'Coophamorena', 'Desmembramento Glaucos da Costa Marques',
    'São Bento', 'Jardim São Bento', 'Vila Nova São Bento', 'Jardim Guarujá', 'Vila Galvão',
    'Monte Líbano', 'Jardim Monte Líbano', 'Vila Santo André', 'Jardim de Allah', 'Vila Antônio Inácio de Souza',
    'Glória', 'Vila Glória', 'Vila Fortuna', 'Vila Eva', 'Vila Oriente', 'Vila Gaspar', 'Vila Taveira', 'Vila Sol Nascente', 'Vila Ornelas', 'Vila Santa Filomena', 'Vila São Miguel', 'Vila Castelo', 'Vila Jardim Alvorada', 'Vila Liberdade', 'Vila Santa Dorothea', 'Vila Santa Dorothéia',
    'Carvalho', 'Vila Carvalho', 'Vila Nossa Senhora de Lourdes', 'Vila São José', 'Vila Santa Maria', 'Vila Quito', 'Vila Carvalho Baís', 'Desmembramento Emílio Cury', 'Vila São Rafael', 'Vila Oliveira', 'Vila Americana', 'Vila Santa Luiza',
    'Amambaí', 'Vila Perseverança', 'Vila Maracajú', 'Vila Guenka', 'Vila São João', 'Vila Santo Antônio', 'Vila Olga', 'Vila Barão do Rio Branco', 'Vila Aurora', 'Vila Warde', 'Vila Floresta', 'Vila Portão de Ferro', 'Vila Orpheu Baís', 'Vila São Vicente', 'Cohasmat',
    'Cabreúva', 'Vila Esplanada 2ª Seção', 'Vila Feliciana Carolina', 'Vila Santa Rosa', 'Vila Marisa', 'Vila Guarani', 'Vila Independência',
    'Planalto', 'Vila Planalto', 'Vila Soares', 'Vila Soares 2ª Seção', 'Vila São Manoel', 'Vila Santa Tereza', 'Vila Estephania', 'Vila Alto Sumaré', 'Vila Corumbá', 'Vila Santos', 'Vila Boa Vista', 'Monte Verde', 'Colinas de Campo Grande', 'Sky Residence',
  ],
  Imbirussu: [
    'Sobrinho', 'Vila Sobrinho', 'Vila Acrópolis', 'Vila Santa Rita', 'Vila Rosalina', 'Vila Nossa Senhora Auxiliadora', 'Cophaco', 'Parque dos Ipês', 'Jardim Leonidia', 'Coopermat', 'Vila Alba', 'Vila Espanhola', 'Jardim Ipanema', 'Vila Duque de Caxias', 'Vila Cinamomo', 'Lar do Trabalhador', 'Residencial Parque dos Flamingos', 'Vila Aviação', 'Parque São Domingos', 'Vila Oeste', 'Loteamento Papa João Paulo II',
    'Santo Antônio', 'Jardim Imá', 'Jardim Imá 2ª Seção', 'Vila Nova', 'Loteamento Municipal Jaguaribe', 'Vila Doriza', 'Jardim Petrópolis', 'Vila Bosque da Saudade', 'Vila Coutinho', 'Vila Sílvia Regina',
    'Santo Amaro', 'Vila Santo Amaro', 'Vila Jardim Beija-Flor', 'Parque dos Laranjais', 'Manoel Taveira', 'Santa Carmélia', 'Jardim Itapuã', 'Coophatrabalho', 'Vila Dr. Jair Garcia', 'Jardim Canadá', 'Vila São Marcos', 'Vila Almeida 1ª Seção', 'Vila Almeida 2ª Seção', 'Vila Palmira', 'Jardim Mandala', 'Residencial Sírio Libanês I', 'Residencial Sírio Libanês II', 'Jardim das Virtudes', 'Residencial Hugo Rodrigues',
    'Panamá', 'Jardim Panamá', 'Jardim Panamá II', 'Jardim Panamá III', 'Jardim Panamá IV', 'Jardim Panamá V', 'Jardim Panamá VI', 'Parque Residencial dos Bancários', 'Residencial Sagarana', 'Jardim Aroeira', 'Recanto dos Pássaros', 'Jardim do Zé Pereira', 'Residencial Ana Maria do Couto', 'Parque Residencial Bellinate', 'Residencial Búzios', 'Portal do Panamá', 'Jardim Mathilde', 'Bosque das Araras',
    'Popular', 'Vila Popular', 'Nova Campo Grande Bloco 11', 'Nova Campo Grande Bloco 12', 'Jardim das Reginas', 'Loteamento Municipal Macaé', 'Jardim Sayonara', 'Jardim Pantanal', 'Jardim Aeroporto', 'Jardim Itália', 'Bosque Santa Mônica', 'Bosque Santa Mônica II', 'Vila Romana',
    'Nova Campo Grande', 'Vila Nova Campo Grande', 'Nova Campo Grande Bloco 01', 'Nova Campo Grande Bloco 02', 'Nova Campo Grande Bloco 03', 'Nova Campo Grande Bloco 04', 'Nova Campo Grande Bloco 05', 'Nova Campo Grande Bloco 06', 'Nova Campo Grande Bloco 07', 'Nova Campo Grande Bloco 08', 'Vila Eliane 1ª Seção', 'Vila Eliane 2ª Seção', 'Vila Serradinho', 'Jardim Carioca', 'Residencial Nelson Trad',
    'Núcleo Industrial', 'Jardim Inápolis', 'Vila Manoel Secco Thomé', 'Vila Entroncamento', 'Pólo Empresarial Oeste', 'Morada Imperial',
  ],
  Lagoa: [
    'Bandeirantes', 'Vila Bandeirantes', 'Coophavila', 'Desmembramento Esteban Cornelas', 'Vila Jurema',
    'Taveirópolis', 'Vila Taveirópolis', 'Santos Dumont', 'Vila Belo Horizonte', 'Vila Belo Horizonte 2ª Seção',
    'Caiçara', 'Vila dos Marimbas', 'Vila Jardim Anahy', 'Vila Jardim Anahy 2ª Seção', 'Vila Maringá', 'Jardim Leblon',
    'União', 'Parque Residencial União', 'Parque Residencial União II', 'Residencial Oliveira I', 'Residencial Oliveira II', 'Residencial Oliveira III', 'Residencial das Flores', 'Parque Residencial dos Girassóis',
    'Leblon', 'Jardim Leblon 2ª Seção', 'Vila Jussara', 'Conjunto Habitacional Bonança', 'Jardim Europa', 'Coophamat', 'Jardim da Lapa', 'Desmembramento Flório Alcebíades Brandão', 'Jardim Antarctica', 'Vila Ouro Fino', 'Jardim Tatiana', 'Vila Ospampas', 'Loteamento Bonjardim', 'Bonjardim', 'Núcleo Habitacional Buriti', 'Alto Leblon',
    'São Conrado', 'Jardim São Conrado', 'Jardim Santa Emília', 'Loteamento Municipal Interpraia', 'Vila Major Juares', 'Residencial Aquárius I', 'Residencial Aquárius II',
    'Tijuca', 'Jardim Tijuca', 'Jardim Tijuca II', 'Jardim dos Boggi', 'Vila Vilma', 'São Pedro', 'Jardim Verdes Mares', 'Residencial Barra da Tijuca', 'Residencial Barra da Tijuca II',
    'Batistão', 'Jardim Batistão', 'São Jorge da Lagoa', 'Vila São Jorge da Lagoa', 'Jardim Mato Grosso', 'Conjunto Residencial Serra Azul', 'Lagoa Park', 'Jardim Villa Lobos', 'Jardim Villa Lobos II', 'Residencial Villa Lobos',
    'Coophavila II', 'Jardim Vila Kellem', 'Jardim Vila Kellem 2ª secção', 'Jardim Ouro Verde 1ª secção', 'Jardim Ouro Verde 2ª secção', 'Favela Tarumã',
    'Tarumã', 'Jardim Tarumã', 'Conjunto Residencial Tarumã', 'Portal das Laranjeiras', 'Jardim Sol Poente', 'Jardim Corcovado', 'Vila Jandaia', 'Arapongas',
    'Caiobá', 'Portal Caiobá', 'Portal Caiobá II', 'Rancho Alegre II', 'Vila Fernanda', 'Rivieira Park', 'Jardim Rancho Alegre I', 'Bela Laguna',
  ],
  Prosa: [
    'Novos Estados', 'Parque dos Novos Estados', 'Jardim Montevidéu', 'Conjunto Residencial Novo Amazonas', 'Conjunto Residencial Nova Bahia', 'Conjunto Residencial Novo Pernambuco', 'Conjunto Residencial Novo Rio Grande do Sul', 'Conjunto Residencial Novo Maranhão', 'Conjunto Residencial Novo Sergipe', 'Conjunto Residencial Novo São Paulo', 'Conjunto Residencial Novo Alagoas', 'Conjunto Residencial Novo Minas Gerais', 'Conjunto Residencial Novo Paraná', 'Jardim Jacarandá', 'Alphaville Campo Grande', 'Alphaville Campo Grande II', 'Alphaville Campo Grande III', 'Alphaville Campo Grande IV',
    'Estrela Dalva', 'Jardim Estrela Dalva I', 'Jardim Estrela Dalva II', 'Jardim Estrela Dalva III', 'Taquaral Bosque',
    'Mata do Jacinto', 'Conjunto Mata do Jacinto', 'Carandá Bosque', 'Favela do Limão', 'Loteamento Municipal Ceasa', 'Loteamento Municipal Nazaré', 'Loteamento Abaeté', 'Loteamento Sóter',
    'Margarida', 'Vila Margarida', 'Vila Lucinda', 'Vila Catarina', 'Vila Catarina II', 'Vila Carolina', 'Jardim Marabá', 'Loteamento Municipal Joaquim Euzébio', 'Loteamento Municipal Guaicurus', 'Loteamento Municipal Verde Brasil', 'Núcleo Marabá', 'Loteamento Municipal Paulo VI',
    'Carandá', 'Carandá Bosque II', 'Carandá Bosque III', 'Golden Gate Park', 'Portal Itayara', 'Vila do Polonês', 'Tayamã Park', 'Vila Nascente', 'Loteamento Copacabana', 'Vivendas do Bosque', 'Loteamento Municipal Mário de Andrade', 'Residencial Itacolomi', 'Tropical Park', 'Loteamento Residencial Via Park', 'Residencial Via Park Itália',
    'Autonomista', 'Jardim Autonomista', 'Jardim Autonomista II', 'Jardim Autonomista III', 'Jardim Giocondo Orsi', 'Jardim Giocondo Orsi II', 'Vila Monte Carlo', 'Monte Carlo', 'Vila Rica', 'Vila Taquari', 'Vila Cacique', 'Vila Pagé', 'Jardim Vitrine', 'Vila Orsi', 'Vila Cruzeiro do Sul', 'Loteamento Petit Park', 'Coophabanco', 'Vila Boa Esperança', 'Coophafé',
    'Santa Fé', 'Conjunto Residencial Nova Ipanema', 'Royal Park',
    'Chácara Cachoeira', 'Chácara Cachoeira II', 'Jatiúca Park', 'Vila Miguel Couto 2ª Seção', 'Vila Miguel Couto 3ª Seção', 'Vila Manoel da Costa Lima', 'Jardim Umuarama', 'Cidade Jardim', 'San Marino Park', 'Nahima Park', 'Altos da Afonso Pena',
    'Veraneio', 'Jardim Veraneio', 'Vila Futurista', 'Vila Danúbio Azul', 'Jardim Tayana', 'Vila Abdalla', 'Jardim Arco-Íris', 'Loteamento Bosque da Esperança', 'Beirute Residence Park', 'Bosque da Esperança II',
    'Noroeste', 'Jardim Noroeste', 'Loteamento Nova Serrana', 'Serraville', 'Residencial Shalom',
    'Chácara dos Poderes', 'Jardim Pinheiros', 'Jardim Cabral', 'Vila Telma', 'Vila Raquel', 'Vila Sônia',
  ],
  Segredo: [
    'Nova Lima', 'Jardim Anache', 'Jardim Columbia', 'Loteamento Municipal Pereira Borges', 'Favela Jardim Anache', 'Jardim Vida Nova', 'Loteamento Vida Nova II', 'Loteamento Tarsila do Amaral', 'Loteamento Vida Nova III', 'José Prates', 'Coriolando da Silva Correa I', 'Coriolando da Silva Correa II', 'José Tavares do Couto', 'Oscar Salazar Moura da Cruz', 'Parque Iguatemi',
    'Coronel Antonino', 'Conjunto Residencial Estrela do Sul', 'Jardim Imperial', 'Jardim Mirasol', 'Eldorado', 'Vila Califórnia', 'Vila Triângulo', 'Guanabara', 'Morada Verde', 'Conjunto Residencial Nova Olinda', 'Jardim Campo Verde', 'Loteamento Municipal Raízes', 'Favela Rio de Janeiro', 'Favela Guatambu', 'Beco da Liberdade', 'Favela Nacional', 'Loteamento Municipal Jaburu', 'Núcleo Morada Verde', 'Parque Izabel Garden’s', 'Jardim Talismã', 'Residencial Atlântico Sul', 'Loteamento Morada do Sossego', 'Jardim Barcelona', 'Morada do Sossego II', 'Recanto Pantaneiro', 'Villa Ravenna', 'Villa Ravenna II', 'Ary Abussafi de Lima', 'Gregório Correa',
    'Monte Castelo', 'Residencial Vale do Sol I', 'Residencial Vale do Sol II', 'Residencial Vale do Sol III', 'Residencial Indaiá', 'Vila São João Bosco', 'Residencial Otávio Pécora', 'Conjunto Residencial Otávio Pécora', 'Conjunto Residencial Octavio Pécora', 'Jardim Bosque de Avilan', 'Bosque de Avilan', 'Center Park', 'Jardim Aruba', 'Loteamento Campo Dourado', 'Loteamento Costa Verde', 'Praia da Urca', 'Residencial Gabura',
    'Mata do Segredo', 'Jardim das Cerejeiras', 'Jardim Campo Novo', 'Jardim Presidente', 'Jardim Campo Belo', 'Loteamento Municipal Salinas', 'Loteamento Municipal Cristaldo', 'Núcleo das Cerejeiras', 'Jardim Nascente do Segredo', 'Residencial Gama', 'Arnaldino da Silva', 'Treviso',
    'Seminário', 'Jardim Seminário', 'Jardim Seminário II', 'Vila Santa Lúcia', 'Vila Jardim Maria Amélia', 'Vila Nossa Senhora da Conceição', 'Jardim Oracília', 'Vila Dalila', 'Vila Leda', 'Vila Antonieta', 'Vila São Roque', 'Vila Saraiva', 'Portal do Gramado', 'São Benedito', 'Lagoa da Cruz', 'North Park',
    'Nasser', 'Vila Nasser', 'Vila Nasser 2ª Seção', 'Santa Luzia', 'Vila Cox', 'Jardim Alto São Francisco', 'Jardim das Acácias', 'Vila Lili', 'Parque Residencial Azaléia', 'Jardim Veneza', 'Loteamento Municipal Dr. Miguel Vieira Ferreira', 'Jardim Fluminense', 'Nossa Senhora das Graças', 'Vila Nilza 1ª Seção', 'Vila Nilza 2ª Seção', 'Jardim Paquetá', 'Coophasul', 'Vila Nossa Senhora Aparecida', 'Vila Neuza', 'Vila Marli', 'Vila Novo Horizonte', 'Bosque da Saúde', 'São Caetano', 'Jardim Paradiso', 'Jardim Monte Alto', 'Loteamento Dona Dedé', 'Setvillage I', 'Setvillage II', 'Água Limpa Park', 'Residencial Carajás', 'Morada dos Deuses', 'Residencial Alto Tamandaré', 'Residencial Recanto do Cerrado', 'Bom Retiro', 'Residencial Tolentino', 'Jardim da Mooca',
    'José Abrão', 'Núcleo Habitacional José Abrão', 'Conjunto José Abrão', 'Parque dos Laranjais', 'Jardim das Paineiras', 'Núcleo Parque dos Laranjais', 'Jardim das Virtudes',
  ],
};

const normalize = (s: string) =>
  s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const BAIRRO_PARA_REGIAO: Record<string, string> = {};
for (const [regiao, bairros] of Object.entries(BAIRROS_POR_REGIAO)) {
  for (const bairro of bairros) {
    const key = normalize(bairro);
    if (!(key in BAIRRO_PARA_REGIAO)) {
      BAIRRO_PARA_REGIAO[key] = regiao;
    }
  }
}

export function getRegioesPorBairro(bairro: string, cidade: string): string[] {
  const cidadeNormalizada = normalize(cidade);
  if (cidadeNormalizada !== 'campo grande') {
    return [];
  }
  const key = normalize(bairro);
  if (!key) {
    return [];
  }
  const regiao = BAIRRO_PARA_REGIAO[key];
  return regiao ? [regiao] : [];
}
