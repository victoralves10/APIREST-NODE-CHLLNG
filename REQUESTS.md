# Exemplos de requests (para Postman / Insomnia)

Todos os exemplos assumem `AUTH_MODE=open` e o servidor rodando em `http://localhost:3000`.

Header usado em todos os requests abaixo (exceto `/health`):
```
x-dev-uid: dev-user-1
```

Esse é o mesmo uid que já está nos dados de exemplo do `schema-clyvovet.sql` (depois de você trocar `'SEU_UID_AQUI'` por `'dev-user-1'` nos INSERTs, para poder testar agora sem precisar do Firebase).

---

## Health check

```
GET http://localhost:3000/health
```

---

## Responsáveis

### Listar todos
```
GET http://localhost:3000/responsaveis
x-dev-uid: dev-user-1
```

### Buscar por CPF (usado na deduplicação do app)
```
GET http://localhost:3000/responsaveis?cpf=45812579024
x-dev-uid: dev-user-1
```

### Criar
```
POST http://localhost:3000/responsaveis
x-dev-uid: dev-user-1
Content-Type: application/json

{
  "cpf_responsavel": "12345678900",
  "nm_responsavel": "Maria Silva",
  "nr_telefone_responsavel": "11999998888"
}
```

### Atualizar
```
PUT http://localhost:3000/responsaveis/1
x-dev-uid: dev-user-1
Content-Type: application/json

{
  "cpf_responsavel": "45812579024",
  "nm_responsavel": "Jaci Oliveira Santos",
  "nr_telefone_responsavel": "11934567890"
}
```

### Remover
```
DELETE http://localhost:3000/responsaveis/1
x-dev-uid: dev-user-1
```

---

## Animais

### Listar todos
```
GET http://localhost:3000/animais
x-dev-uid: dev-user-1
```

### Buscar por microchip (deduplicação)
```
GET http://localhost:3000/animais?microchip=5482
x-dev-uid: dev-user-1
```

### Histórico de consultas de um animal
```
GET http://localhost:3000/animais/1/consultas
x-dev-uid: dev-user-1
```

### Criar
```
POST http://localhost:3000/animais
x-dev-uid: dev-user-1
Content-Type: application/json

{
  "nm_animal": "Bidu",
  "especie_animal": "Cachorro",
  "raca_animal": "Vira-lata",
  "dt_nascimento_animal": "2023-05-10",
  "peso_animal": 12.5,
  "rg_animal": null,
  "nr_microchip_animal": "9988",
  "id_responsavel": 1
}
```

### Atualizar
```
PUT http://localhost:3000/animais/1
x-dev-uid: dev-user-1
Content-Type: application/json

{
  "nm_animal": "Arthur",
  "especie_animal": "Cachorro",
  "raca_animal": "Golden Retriever",
  "dt_nascimento_animal": "2024-04-20",
  "peso_animal": 62.0,
  "rg_animal": null,
  "nr_microchip_animal": "5482"
}
```

### Remover (remove em cascata as consultas vinculadas)
```
DELETE http://localhost:3000/animais/1
x-dev-uid: dev-user-1
```

---

## Consultas

### Listar todas
```
GET http://localhost:3000/consultas
x-dev-uid: dev-user-1
```

### Criar
```
POST http://localhost:3000/consultas
x-dev-uid: dev-user-1
Content-Type: application/json

{
  "historico_consulta": "Check-up anual, tudo normal",
  "dt_consulta": "2026-09-15",
  "hr_consulta": "10:00",
  "st_consulta": "Agendado",
  "id_animal": 1
}
```

### Atualizar
```
PUT http://localhost:3000/consultas/1
x-dev-uid: dev-user-1
Content-Type: application/json

{
  "historico_consulta": "Check-up anual — concluído sem alterações",
  "dt_consulta": "2026-09-15",
  "hr_consulta": "10:00",
  "st_consulta": "Concluido"
}
```

### Remover
```
DELETE http://localhost:3000/consultas/1
x-dev-uid: dev-user-1
```

---

## Fluxo completo de teste sugerido

1. `GET /health` — confirma que o servidor está de pé
2. `GET /responsaveis` — deve retornar os 2 responsáveis de exemplo (se você já rodou os INSERTs)
3. `GET /animais` — deve retornar os 2 animais de exemplo
4. `GET /consultas` — deve retornar as 2 consultas de exemplo
5. `POST /responsaveis` — cria um novo, anota o `id_responsavel` retornado
6. `POST /animais` — usa o `id_responsavel` do passo anterior
7. `POST /consultas` — usa o `id_animal` do passo anterior
8. `PUT /consultas/:id` — edita a consulta recém-criada, muda o status para `Concluido`
9. `DELETE /animais/:id` — remove o animal criado, depois confira que `GET /consultas` não traz mais a consulta dele (cascata funcionando)
