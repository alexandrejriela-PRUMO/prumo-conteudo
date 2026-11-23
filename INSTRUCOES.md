# Posts do PRUMO Hub: como gerar, aprovar e publicar

Este repositório guarda tudo o que a tarefa agendada precisa para fazer os posts do PRUMO Hub,
e as artes de cada post publicado (o Instagram puxa as imagens daqui, pelo link público).

Calendário: **terça (carrossel)** e **quinta (imagem única)**, com aprovação do Alexandre antes de publicar.

## Público e tom

- Quem lê: engenheiros florestais, agrônomos, consultores ambientais e donos de consultoria rural no Brasil.
  Entendem de licenciamento, CAR e campo; não entendem de tecnologia.
- Tom: direto, prático, de quem roda consultoria no dia a dia. Nada de jargão de startup
  ("revolucione", "potencialize", "solução inovadora"). Frases curtas.
- Gancho da capa: no máximo 8 palavras na primeira frase.
- O post sempre fecha com o Prumo Hub resolvendo a dor (CTA para hub.prumo.site).

## Os 8 pilares (rodar; não repetir o mesmo pilar em posts seguidos)

1. Controle de prazos (licenças, condicionantes, renovações, prazos de processo)
2. Risco e monitoramento (MapBiomas, autos de infração, DOE, fiscalização)
3. Escala do escritório (mais clientes sem mais retrabalho)
4. Organização e histórico (documentos espalhados, planilhas soltas, histórico do cliente)
5. Comercial e financeiro (orçamento, contrato, cobrança, inadimplência)
6. Técnico e regulatório (regras que o consultor precisa saber)
7. Ativos ambientais (excedente de RL, CRA, servidão, PSA, carbono)
8. Geotecnologia (CAR, georreferenciamento, mapas, drone)

Antes de escolher o tema, ler `historico.md`: não repetir pilar do último post nem tema dos últimos 12.

## Regras de conteúdo

- Toda citação de lei, artigo, prazo ou número deve ser **conferida na web antes** (planalto.gov.br,
  site do órgão, diário oficial). Se não conseguir confirmar, não cite o artigo; fale da regra em termos gerais.
- Não inventar estatística. Nada de "80% dos consultores...".
- Funcionalidades do Prumo Hub que podem ser citadas: gestão de CAR, licenças com alerta de vencimento,
  acompanhamento de processos, alertas MapBiomas, monitoramento do DOE/FEPAM, CRM e pipeline, orçamentos e
  contratos, cobrança integrada, emissão de NF, equipe, portal do cliente, Rute (assistente no WhatsApp).
- Sem foto gerada por IA. Artes só com tipografia (modelo em `sistema/render.py`).
  Se o Alexandre mandar foto dele, pode usar como fundo (pedir antes).
- Legenda: 600 a 1.200 caracteres, parágrafos curtos, termina com "Teste em hub.prumo.site" e 4 a 6 hashtags de nicho.

## Formatos

**Terça: carrossel (5 a 7 slides).** `capa` → 3 a 5 `texto` → `cta`.
**Quinta: imagem única.** um slide `unico` com frase forte; a legenda carrega a explicação.

Modelo do `post.json` (ver exemplo real em `posts/2026-11-22-prazo-120-dias/post.json`):

```json
{
  "pilar": "Controle de prazos",
  "formato": "carrossel",
  "slides": [
    {"tipo": "capa", "selo": "CONTROLE DE PRAZOS", "titulo": "...", "destaque": ["palavras", "em", "dourado"], "sub": "..."},
    {"tipo": "texto", "num": 1, "titulo": "...", "destaque": ["..."], "texto": "...", "fonte": "LC 140/2011, art. 14, §4º"},
    {"tipo": "cta", "titulo": "...", "texto": "...", "botao": "Conheça o Prumo Hub", "site": "hub.prumo.site"}
  ],
  "legenda": "..."
}
```

Imagem única: `{"tipo": "unico", "selo": "...", "titulo": "...", "destaque": [...], "sub": "..."}`.

Gerar as artes: `python3 sistema/render.py posts/AAAA-MM-DD-slug/post.json posts/AAAA-MM-DD-slug`
(precisa de `pip install --break-system-packages cairosvg` se não estiver instalado).
Sempre abrir as imagens e conferir: texto cortado, sobreposição, linha órfã. Ajustar e renderizar de novo.

## Aprovação

1. Mandar ao Alexandre as artes (SendUserFile, status proactive) e, em mensagem, a legenda completa e o pilar.
2. Mandar notificação no celular avisando que o post está esperando aprovação.
3. Esperar a resposta. Ajustes pedidos ("troca o título do slide 2") mexem só no que foi pedido.
4. **Só publicar com aprovação explícita** ("aprovado", "pode publicar"). Sem resposta, não publica.

## Publicação (só depois do OK)

1. Commit da pasta `posts/AAAA-MM-DD-slug/` (post.json + JPGs) e push para `main`.
2. Links das imagens, sempre com o hash do commit (evita cache):
   `https://raw.githubusercontent.com/alexandrejriela-PRUMO/prumo-conteudo/<HASH>/posts/AAAA-MM-DD-slug/slide_01.jpg`
   Conferir com curl que cada link responde 200 image/jpeg.
3. Instagram (Zapier, "Instagram for Business" → Publish Photo(s)):
   conta **PRUMO** `instagramPageId = 17841401347529719`; `media` = lista de links na ordem; `caption` = legenda.
4. Facebook (Zapier, "Facebook Pages" → Create Page Photo):
   página **Prumo** `page = 973039659228877`; `source` = **só o link do slide_01**; `message` = legenda.
5. Pegar o link do post no Instagram (Make API GET Request em
   `https://graph.facebook.com/v21.0/<id>?fields=permalink`) e responder ao Alexandre com ele.
6. Acrescentar a linha em `historico.md`, commit e push.
