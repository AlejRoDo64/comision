# Proyecto Comisiones

Aplicacion para gestionar y consultar procesos de comisiones. El repositorio incluye documentos funcionales, datos de prueba, un mock HTML y una aplicacion full stack en `workspace/comisionesapp`.

## Frameworks y tecnologias

- Backend: NestJS 10 sobre Node.js 22 y TypeScript.
- Frontend: Vue 3 con Vite 5, TypeScript, Pinia y Vue Router.
- Autenticacion: JWT con Passport.
- Documentacion API: Swagger en el backend.
- Gestor frontend: pnpm.
- Gestor backend: npm.

## Estructura principal

```text
Datatest/                         Archivos Excel de prueba
HU/                               Historias de usuario en Word
Mock/                             Mock HTML inicial
workspace/docs/                   Historias de usuario en Markdown
workspace/comisionesapp/backend/  API NestJS
workspace/comisionesapp/frontend/ Aplicacion Vue/Vite
```

## Requisitos

- Node.js 22 o superior.
- npm para el backend.
- pnpm 9 o superior para el frontend.

Para instalar pnpm si no esta disponible:

```bash
npm install -g pnpm
```

## Configuracion del backend

Entrar a la carpeta del backend:

```bash
cd workspace/comisionesapp/backend
```

Instalar dependencias:

```bash
npm install
```

Crear el archivo de entorno desde el ejemplo:

```bash
copy .env.example .env
```

En PowerShell tambien se puede usar:

```powershell
Copy-Item .env.example .env
```

Editar `.env` si se requiere cambiar el puerto, el secreto JWT o datos de base de datos. Por defecto el backend corre en:

```text
http://localhost:3000
```

Iniciar en modo desarrollo:

```bash
npm run start:dev
```

La documentacion Swagger queda disponible en:

```text
http://localhost:3000/api/docs
```

## Configuracion del frontend

En otra terminal, entrar a la carpeta del frontend:

```bash
cd workspace/comisionesapp/frontend
```

Instalar dependencias:

```bash
pnpm install
```

Iniciar en modo desarrollo:

```bash
pnpm dev
```

El frontend corre en:

```text
http://localhost:5173
```

Vite tiene configurado un proxy para enviar las peticiones `/api` al backend en `http://localhost:3000`.

## Flujo de inicio rapido

1. Iniciar backend con `npm run start:dev` desde `workspace/comisionesapp/backend`.
2. Iniciar frontend con `pnpm dev` desde `workspace/comisionesapp/frontend`.
3. Abrir `http://localhost:5173` en el navegador.
4. Consultar la API en `http://localhost:3000/api/docs`.

## Scripts utiles

Backend:

```bash
npm run start:dev
npm run build
npm run test
npm run lint
```

Frontend:

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
```
