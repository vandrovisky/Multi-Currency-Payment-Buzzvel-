# Deploy — AWS EC2 (build feito localmente)

Guia para colocar uma instância pública no ar para o avaliador (campo
**"Live Project URL"** do formulário). A estratégia aqui é **buildar o
front-end na sua máquina** e, no servidor, rodar **apenas PHP + MySQL via
Docker** — nada de Node na EC2 (a `t2.micro` tem só 1 GB de RAM e o build do
Vite estoura memória lá).

> Deixe a instância de pé só até o avaliador testar e depois **pare/termine**
> para não sair do Free Tier e gerar cobrança.

---

## Visão geral do fluxo

```
SUA MÁQUINA                              EC2 (Ubuntu, Free Tier)
-----------                              -----------------------
npm run build  ─── public/build ──scp──▶ ~/app/public/build
                                         git clone (código + deps PHP)
                                         docker compose up  (PHP+MySQL)
                                         migrate --seed
                                              │
                                              ▼
                                  http://<IP-público>  ◀── avaliador
```

---

## 1. Buildar localmente

```bash
./vendor/bin/sail npm run build
```

Isso gera `public/build/` (manifest + assets). Os caminhos no manifest são
relativos a `/build`, então funcionam em qualquer host — não precisa rebuildar
por causa do IP.

---

## 2. Lançar a EC2

- **AMI:** Ubuntu 24.04 LTS
- **Tipo:** `t2.micro` ou `t3.micro` (Free Tier — 750 h/mês)
- **Disco:** 20–30 GB gp3 (Free Tier dá 30 GB)
- **Security Group (inbound):**
  - `22` (SSH) — só do seu IP
  - `80` (HTTP) — `0.0.0.0/0` (para o avaliador)
- Guarde o `.pem` e anote o **IP público**.

```bash
ssh -i sua-chave.pem ubuntu@<IP-PUBLICO>
```

---

## 3. Preparar o servidor (Docker + swap)

```bash
# Docker + compose plugin
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 git
sudo usermod -aG docker ubuntu
newgrp docker   # aplica o grupo sem relogar

# Swap de 2 GB — segura MySQL + Octane com 1 GB de RAM
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 4. Clonar o código (sem Node) e instalar deps PHP

```bash
cd ~
git clone <repo-url> app
cd app

# Dependências PHP via container efêmero (otimizado p/ produção)
docker run --rm -v "$(pwd)":/app -w /app composer:2 \
  install --no-dev --optimize-autoloader
```

`--no-dev` pula pacotes de teste/dev e deixa o autoload otimizado.

---

## 5. Enviar o build pronto (do seu micro)

Na **sua máquina**, dentro da pasta do projeto:

```bash
scp -i sua-chave.pem -r public/build \
  ubuntu@<IP-PUBLICO>:~/app/public/
```

Confirme na EC2 que `~/app/public/build/manifest.json` existe.

---

## 6. Configurar o `.env` de produção

Na EC2:

```bash
cp .env.example .env
nano .env
```

Ajuste estas linhas (o resto pode ficar como está):

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=http://<IP-PUBLICO>

# Servir na porta 80 (Sail mapeia APP_PORT do host -> 80 no container)
APP_PORT=80

# Câmbio (já é o padrão, mantenha)
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/EUR
```

> Em produção o front é servido pelo `public/build` (manifest). O `VITE_PORT`
> não é usado aqui — é só pro dev server. Não rode `npm run dev` na EC2.

---

## 7. Subir e inicializar

```bash
# Sobe PHP (Octane/FrankenPHP) + MySQL
./vendor/bin/sail up -d

# Espera o MySQL aceitar conexão e então:
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan passport:keys --force
./vendor/bin/sail artisan migrate:fresh --seed
./vendor/bin/sail artisan config:cache
./vendor/bin/sail artisan route:cache
```

`migrate:fresh --seed` recria o banco com os 6 usuários de teste (senha
`password`).

---

## 8. Validar

- Navegador: `http://<IP-PUBLICO>` → landing → login `bruna@example.com`.
- API/docs: `http://<IP-PUBLICO>/docs/api`.
- Cole `http://<IP-PUBLICO>` no campo **Live Project URL** do formulário.

> **HTTPS:** não é exigido pelo teste. Se quiser, aponte um domínio para o IP
> e o FrankenPHP emite certificado Let's Encrypt automático — mas para a
> avaliação o IP em HTTP basta.

---

## Reaplicar mudanças depois

Se mexer no código/back-end localmente:

```bash
# na EC2
cd ~/app && git pull
./vendor/bin/sail artisan migrate --force
./vendor/bin/sail artisan config:cache
```

Se mexer no **front-end**, rebuild local + `scp public/build` de novo (passo 5).

---

## Encerrar (evitar cobrança)

```bash
# na EC2 — derruba os containers
./vendor/bin/sail down
```

E no console AWS: **Stop** (para reusar depois) ou **Terminate** (apaga tudo).
Lembre de soltar o Elastic IP se tiver alocado um.
