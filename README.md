# Painel gerencial Brognoli

Painel de gestão e BI da Brognoli (substitui o Power BI), desenvolvido pela INTEGRA.
Veja `NOTICE.md` para autoria e licença de uso.

## Stack
- Next.js (App Router) + TypeScript, deploy na Vercel (time Brognoli Vendas).
- Supabase (Postgres + Auth + RLS), projeto `painel-gerencial-brognoli`, região São Paulo.
- Dados de negócio vêm do Nekt/Bitrix (marcos seguintes).

## Rodar localmente
```bash
cp .env.example .env.local   # preencher URL e chave publicável do Supabase
npm install
npm run dev
```

## Regras
- Segredos só nas variáveis de ambiente da Vercel e do Supabase. Nunca no código.
- Permissões são validadas no servidor (`lib/sessao.ts`); esconder menu não basta.
- Novos usuários nascem inativos; o administrador libera em Administração.
- O painel não exibe a entidade lead. Negócios e imóveis seguem as permissões do Bitrix.
- Migrações em `supabase/migrations`, sempre aditivas.

## Marcos
1. Base: login, permissões, log de acessos (este).
2. Início da diretoria e Administração completa.
3. Roletas e Check-in.
4. BI (Fechamentos, Metas) e Desempenho, com dados reais.
