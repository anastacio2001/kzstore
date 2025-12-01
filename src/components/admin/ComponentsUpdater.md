# Atualizando componentes restantes

Componentes que precisam de accessToken:
- B2BManager
- AffiliatesManager  
- TicketsManager

Mudanças necessárias em cada um:
1. Adicionar interface Props com accessToken
2. Adicionar prop ao componente
3. useEffect com dependência de accessToken
4. Adicionar check no fetchData
5. Usar accessToken em todas as chamadas de API
