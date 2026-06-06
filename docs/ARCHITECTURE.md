# ARCHITECTURE.md

# Arquitectura

## Principios
- Server Components por defecto.
- Client Components solo cuando sea necesario.
- Sin uso de any.
- Arquitectura por features.

## Estructura

src/
├── app/
├── components/
├── features/
├── lib/
├── hooks/
├── services/
├── types/
└── constants/

## Features

features/
├── auth/
├── matches/
├── predictions/
├── standings/
├── tournament/
└── admin/

## Capas

UI
↓
Service
↓
Repository
↓
Firestore

## Reglas

- Nunca consultar Firestore directamente desde páginas.
- Toda lógica de negocio en services.
- Toda persistencia en repositories.
- Toda validación con Zod.

## Autenticación

Firebase Auth:
- Google
- Email/Password

Admins definidos mediante:

ADMIN_EMAILS=email1@example.com,email2@example.com

## MatchStage

- group
- round_of_32
- round_of_16
- quarterfinal
- semifinal
- third_place
- final

## Multipliers

group=1
round_of_32=2
round_of_16=2
quarterfinal=2
third_place=3
semifinal=3
final=3
