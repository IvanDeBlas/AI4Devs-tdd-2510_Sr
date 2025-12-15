# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripción del Proyecto

LTI (Talent Tracking System) es una aplicación full-stack para gestión de candidatos en procesos de reclutamiento. Utiliza React en el frontend y Express con TypeScript en el backend, con Prisma como ORM para PostgreSQL.

## Comandos Esenciales

### Instalación Inicial

```bash
# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias del backend
cd ../backend
npm install
```

### Base de Datos (PostgreSQL con Docker)

```bash
# Iniciar contenedor PostgreSQL
docker-compose up -d

# Detener contenedor
docker-compose down

# Aplicar migraciones de Prisma
cd backend
npx prisma migrate dev

# Generar cliente Prisma (después de cambios en schema.prisma)
npx prisma generate
```

**Configuración de Base de Datos:**
- Host: localhost
- Port: 5432
- User: LTIdbUser (ver .env)
- Password: Ver .env
- Database: LTIdb
- DATABASE_URL se define en `.env` en la raíz del backend

### Backend

```bash
cd backend

# Modo desarrollo (con hot reload)
npm run dev

# Construir para producción
npm run build

# Iniciar en producción
npm start

# Ejecutar tests
npm test
```

El servidor backend corre en: http://localhost:3010

### Frontend

```bash
cd frontend

# Modo desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test
```

El frontend corre en: http://localhost:3000

## Arquitectura del Backend

El backend sigue una arquitectura en capas con separación clara de responsabilidades:

### Estructura de Capas

```
backend/src/
├── domain/          - Modelos de dominio con lógica de negocio
├── application/     - Servicios de aplicación y validación
├── presentation/    - Controladores HTTP
└── routes/          - Definición de rutas de la API
```

### Capa de Dominio (`domain/models/`)

Los modelos de dominio encapsulan la lógica de negocio y la persistencia:

- **Candidate.ts**: Modelo principal con método `save()` que maneja tanto creación como actualización
- **Education.ts**: Educación del candidato (relación muchos-a-uno)
- **WorkExperience.ts**: Experiencia laboral (relación muchos-a-uno)
- **Resume.ts**: Archivos de CV (relación muchos-a-uno)

**Patrón importante**: Los modelos instancian su propio `PrismaClient` y tienen métodos `save()` que construyen dinámicamente el objeto de datos de Prisma, manejando relaciones anidadas.

### Capa de Aplicación (`application/`)

- **services/candidateService.ts**: Orquesta la creación de candidatos, validación, y guardado de relaciones
- **services/fileUploadService.ts**: Maneja subida de archivos (PDF y DOCX)
- **validator.ts**: Validación de datos de entrada

**Flujo de creación de candidato**:
1. Validar datos con `validateCandidateData()`
2. Crear instancia de `Candidate` y guardar
3. Iterar sobre `educations` y `workExperiences` para crear y guardar cada registro
4. Guardar CV si está presente
5. Retornar candidato con ID generado

### Capa de Presentación (`presentation/controllers/`)

- **candidateController.ts**: Maneja requests HTTP, llama a servicios y retorna respuestas

### Rutas (`routes/`)

- **candidateRoutes.ts**: Define endpoints de la API de candidatos

### Inyección de Dependencias

El `PrismaClient` se adjunta a cada request mediante middleware en `index.ts`:

```typescript
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});
```

Se extiende la interfaz `Request` de Express globalmente para incluir `prisma`.

### Manejo de Errores

- Errores de validación lanzan excepciones capturadas en controllers
- Errores Prisma específicos (ej: `P2002` para violación de unique constraint) se manejan explícitamente
- Middleware de error global en `index.ts` captura errores no manejados

## Esquema de Base de Datos (Prisma)

Archivo: `backend/prisma/schema.prisma`

**Modelos principales:**
- `Candidate`: firstName, lastName, email (unique), phone, address
- `Education`: institution, title, startDate, endDate, candidateId
- `WorkExperience`: company, position, description, startDate, endDate, candidateId
- `Resume`: filePath, fileType, uploadDate, candidateId

**Relaciones**: Todos los modelos relacionados (Education, WorkExperience, Resume) tienen foreign key a Candidate.

## API Endpoints

Especificación completa en `backend/api-spec.yaml` (OpenAPI 3.0)

**POST /candidates** - Crear candidato
- Acepta objeto JSON con firstName, lastName, email, phone, address, educations[], workExperiences[], cv
- Retorna 201 con datos del candidato creado
- Retorna 400 para validación fallida o email duplicado

**POST /upload** - Subir archivo
- Acepta multipart/form-data
- Solo permite PDF y DOCX
- Retorna filePath y fileType

## Validaciones de la API

Definidas en `backend/api-spec.yaml`:
- firstName/lastName: 2-50 caracteres, solo letras (incluye ñ y acentos)
- Email: formato email válido
- Phone: formato internacional con variaciones
- Dates: formato YYYY-MM-DD
- Campos con límites de longitud específicos

## Frontend

Stack: React 18 con TypeScript, Bootstrap 5, React Router

**Componentes principales:**
- `AddCandidateForm.js`: Formulario de alta de candidatos
- `FileUploader.js`: Componente de subida de archivos
- `RecruiterDashboard.js`: Dashboard del reclutador

**Servicio**: `services/candidateService.js` - Cliente API para comunicación con backend

## Consideraciones de Desarrollo

### Testing

El proyecto está configurado con **Jest** y **ts-jest** para ejecutar tests unitarios en TypeScript.

**Configuración:**
- `backend/jest.config.js`: Configuración de Jest con preset ts-jest
- Los tests deben tener extensión `.test.ts` o `.spec.ts`
- Los tests se buscan en `src/**/*.test.ts` y `src/**/*.spec.ts`

**Ejecutar tests:**
```bash
cd backend
npm test
```

**Ejemplo de test:**
Ver `backend/src/application/validator.test.ts` para un ejemplo completo de tests unitarios.

**Cobertura de código:**
```bash
cd backend
npm test -- --coverage
```

### CORS
El backend está configurado para aceptar requests desde `http://localhost:3000` con credentials habilitados.

### Migraciones de Base de Datos
Cuando modifiques `schema.prisma`:
1. Ejecutar `npx prisma migrate dev` para crear y aplicar migración
2. Prisma generará automáticamente el cliente actualizado
3. Si hay problemas con DATABASE_URL, puedes establecer la URL directamente en schema.prisma
