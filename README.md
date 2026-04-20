# ms-ecommerce-payment

# Sistema de Pagamento Distribuído - Microsserviços

Projeto desenvolvido para a disciplina de Desenvolvimento de Sistemas Distribuídos.

## Descrição

Sistema de e-commerce com arquitetura de microsserviços para processamento de pagamentos e notificações, utilizando comunicação assíncrona via mensageria.

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **RabbitMQ** - Mensageria para comunicação assíncrona
- **Docker / Docker Compose** - Containerização e orquestração

## Arquitetura

O sistema é composto por dois microsserviços independentes:

1. **Payment Service** (porta 3000)
   - Gerencia transações de pagamento
   - Armazena dados no PostgreSQL
   - Publica mensagens no RabbitMQ

2. **Notification Service**
   - Escuta filas do RabbitMQ
   - Envia notificações aos usuários

## Fluxo de Processamento

Cliente → Payment Service → PostgreSQL (PENDING)
↓
RabbitMQ (PAYMENT_CREATED)
↓
Notification Service → Notifica usuário
↓
Cliente → Payment Service (confirmação) → PostgreSQL (SUCCESS)
↓
RabbitMQ (PAYMENT_CONFIRMED)
↓
Notification Service → Notifica usuário

text

## Como Executar

### Pré-requisitos

- Docker Desktop instalado
- Node.js (opcional, para desenvolvimento)

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/ms-ecommerce-payment.git
cd ms-ecommerce-payment
Suba os containers:

bash
docker-compose up --build
Em outro terminal, crie um pagamento:

bash
curl -X POST http://localhost:3000/payment \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 100}'
Confirme o pagamento (substitua ID pelo retornado):

bash
curl -X PUT http://localhost:3000/payment/ID/confirm
Endpoints
Método	Endpoint	Descrição
POST	/payment	Criar nova transação (status PENDING)
PUT	/payment/:id/confirm	Confirmar transação (status SUCCESS)
Estrutura do Projeto
text
ms-ecommerce/
├── payment-service/
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
├── notification-service/
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
Variáveis de Ambiente
DATABASE_URL - Conexão com PostgreSQL

RABBITMQ_URL - Conexão com RabbitMQ

Autores
[Alan da Silva, Elisana Salvador, Leandro da Silva] - [(https://github.com/ElisanaSalvador)]

Professor Orientador
[Professor: Rafael de Faria Scheidt]

Licença
Este projeto é para fins educacionais, como parte da UC: Desenvolvimento de Sistemas Móveis e Distribuídos - Curso: Superior de Tecnologia em Análise e Desenvolvimento de Sistemas do SENAI SC.

