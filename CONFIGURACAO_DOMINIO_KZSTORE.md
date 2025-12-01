# 🌐 Configuração do Domínio kzstore.ao

## Passo 1: Verificar o Domínio no Google Search Console

1. Acesse: https://search.google.com/search-console
2. Clique em "Adicionar propriedade"
3. Selecione "Domínio" (Domain)
4. Digite: `kzstore.ao`
5. O Google vai fornecer um registro TXT para verificação

### Registro DNS para Verificação (exemplo):
```
Type: TXT
Name: @ (ou kzstore.ao)
Value: google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXX
TTL: 3600
```

**⚠️ Importante:** Anote o valor exato do TXT que o Google fornecer!

---

## Passo 2: Configurar DNS do kzstore.ao

Após verificar o domínio, adicione estes registros DNS no painel do teu registrador:

### Registros Necessários para Cloud Run:

#### Para o domínio principal (kzstore.ao):

```dns
# Registro A (IPv4)
Type: A
Name: @ (ou deixe vazio para root domain)
Value: 216.239.32.21
TTL: 3600

# Registro A adicional
Type: A
Name: @
Value: 216.239.34.21
TTL: 3600

# Registro A adicional
Type: A
Name: @
Value: 216.239.36.21
TTL: 3600

# Registro A adicional
Type: A
Name: @
Value: 216.239.38.21
TTL: 3600

# Registro AAAA (IPv6)
Type: AAAA
Name: @
Value: 2001:4860:4802:32::15
TTL: 3600

# Registro AAAA adicional
Type: AAAA
Name: @
Value: 2001:4860:4802:34::15
TTL: 3600

# Registro AAAA adicional
Type: AAAA
Name: @
Value: 2001:4860:4802:36::15
TTL: 3600

# Registro AAAA adicional
Type: AAAA
Name: @
Value: 2001:4860:4802:38::15
TTL: 3600
```

#### Para www.kzstore.ao:

```dns
# Registro CNAME
Type: CNAME
Name: www
Value: ghs.googlehosted.com
TTL: 3600
```

---

## Passo 3: Mapear Domínio no Cloud Run

Após configurar o DNS (aguardar propagação ~10-60 min), execute:

```bash
# Verificar se domínio está acessível
gcloud beta run domain-mappings create \
  --service=kzstore \
  --domain=kzstore.ao \
  --region=europe-southwest1

# Adicionar www também
gcloud beta run domain-mappings create \
  --service=kzstore \
  --domain=www.kzstore.ao \
  --region=europe-southwest1
```

---

## Passo 4: Verificar Configuração

Após propagação DNS (pode levar até 48h, mas geralmente 1-2h):

```bash
# Verificar DNS
nslookup kzstore.ao
nslookup www.kzstore.ao

# Testar HTTPS
curl -I https://kzstore.ao
curl -I https://www.kzstore.ao
```

---

## 🎯 Resumo Rápido

**O que fazer agora:**

1. ✅ Acessar painel DNS do registrador de kzstore.ao
2. ✅ Adicionar registro TXT de verificação do Google
3. ✅ Verificar domínio no Search Console
4. ✅ Adicionar registros A, AAAA e CNAME listados acima
5. ⏳ Aguardar propagação DNS (10-60 min)
6. ✅ Voltar aqui para mapear no Cloud Run

---

## 📞 Qual é o teu registrador de domínios?

- GoDaddy?
- Namecheap?
- Cloudflare?
- Outro?

Posso dar instruções específicas para o painel do teu registrador!

---

## ⚠️ Notas Importantes

- **SSL/TLS:** O Google Cloud Run fornece certificado SSL automaticamente após o mapeamento
- **Propagação:** DNS pode levar de minutos a horas para propagar
- **Verificação:** O domínio DEVE estar verificado no Search Console antes do mapeamento
- **Backup:** O site continua acessível via URL do Cloud Run durante a configuração

---

## 🔗 Links Úteis

- Console Cloud Run: https://console.cloud.google.com/run/detail/europe-southwest1/kzstore
- Search Console: https://search.google.com/search-console
- DNS Checker: https://dnschecker.org/#A/kzstore.ao
