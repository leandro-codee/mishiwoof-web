# Arquitectura y Estructura de Carpetas - mishiwoof_web

Este documento describe la arquitectura de software y estructura de carpetas del proyecto `mishiwoof_web`, basada en Clean Architecture.

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Arquitectura por Capas](#arquitectura-por-capas)
5. [Configuración del Proyecto](#configuración-del-proyecto)
6. [Alias de Importación](#alias-de-importación)

---

## 🎯 Visión General

Este proyecto implementa una **arquitectura modular basada en Clean Architecture** para una aplicación React con TypeScript. La aplicación está organizada en módulos independientes que siguen el principio de separación de responsabilidades.

### Principios Arquitectónicos

- **Separación de Responsabilidades**: Cada módulo se organiza en capas (domain, application, infrastructure, presentation)
- **Inversión de Dependencias**: Las capas internas no dependen de las externas
- **Modularidad**: Cada funcionalidad es un módulo independiente
- **Reutilización**: Componentes y utilidades compartidas en carpetas `shared` y `components`
- **Type Safety**: TypeScript estricto en todo el proyecto

---

## 🛠 Stack Tecnológico

### Core
- **React 19.2.0** - Biblioteca UI
- **TypeScript 5.9.3** - Lenguaje de programación
- **Vite 7.2.4** - Build tool y dev server
- **React Router DOM 7.11.0** - Enrutamiento

### Estado y Datos
- **TanStack Query (React Query) 5.90.12** - Gestión de estado del servidor y caché
- **TanStack Table 8.21.3** - Tablas y datos tabulares
- **Zustand 5.0.9** - Gestión de estado local
- **Axios 1.13.2** - Cliente HTTP

### UI y Estilos
- **Tailwind CSS 4.1.18** - Framework CSS utility-first
- **Radix UI** - Componentes primitivos accesibles
- **shadcn/ui** - Componentes UI construidos sobre Radix UI
- **Lucide React** - Iconos
- **next-themes** - Gestión de temas (dark/light mode)

### Formularios y Validación
- **React Hook Form 7.69.0** - Gestión de formularios
- **Zod 4.2.1** - Validación de esquemas
- **@hookform/resolvers** - Integración React Hook Form + Zod

### Otras Librerías
- **date-fns** - Manipulación de fechas
- **sonner** - Notificaciones toast
- **recharts** - Gráficos

---

## 📁 Estructura de Carpetas

```
mishiwoof_web/
├── src/
│   ├── app/                    # Capa de aplicación (routing, páginas principales)
│   │   ├── App.tsx             # Componente raíz de la aplicación
│   │   ├── routes.tsx          # Configuración de rutas (React Router)
│   │   └── pages/              # Páginas de la aplicación (vistas principales)
│   │       ├── dashboard/      # Páginas del dashboard
│   │       └── [feature]/     # Páginas específicas por funcionalidad
│   │
│   ├── modules/                # Módulos de negocio (Clean Architecture)
│   │   ├── example/            # Módulo de ejemplo (referencia)
│   │   └── [module-name]/     # Otros módulos
│   │
│   ├── components/             # Componentes UI reutilizables
│   │   ├── layout/            # Componentes de layout (Header, Sidebar, etc.)
│   │   └── ui/                # Componentes UI base (shadcn/ui)
│   │
│   ├── shared/                # Código compartido entre módulos
│   │   ├── components/        # Componentes compartidos
│   │   ├── infrastructure/   # Infraestructura compartida
│   │   │   └── http/         # Cliente HTTP base, manejo de errores
│   │   ├── types/            # Tipos TypeScript compartidos
│   │   └── utils/            # Utilidades compartidas
│   │
│   ├── providers/             # Context Providers de React
│   │   ├── QueryProvider.tsx  # Provider de React Query
│   │   └── ThemeProvider.tsx # Provider de temas
│   │
│   ├── hooks/                 # Hooks personalizados globales
│   │   ├── use-mobile.ts     # Hook para detectar dispositivos móviles
│   │   └── use-toast.ts      # Hook para notificaciones
│   │
│   ├── styles/                # Estilos globales
│   │   └── globals.css        # CSS global con variables de Tailwind
│   │
│   ├── types/                 # Tipos TypeScript globales
│   │   └── [feature].ts      # Tipos específicos por funcionalidad
│   │
│   └── main.tsx               # Punto de entrada de la aplicación
│
├── public/                    # Archivos estáticos
├── dist/                      # Build de producción
├── node_modules/              # Dependencias
│
├── vite.config.ts             # Configuración de Vite
├── tsconfig.json              # Configuración TypeScript base
├── tsconfig.app.json          # Configuración TypeScript para app
├── tsconfig.node.json         # Configuración TypeScript para Node
├── tailwind.config.js         # Configuración de Tailwind CSS
├── components.json            # Configuración de shadcn/ui
├── package.json               # Dependencias y scripts
└── README.md                  # Documentación del proyecto
```

---

## 🏗 Arquitectura por Capas

### Estructura de un Módulo

Cada módulo en `src/modules/[module-name]/` sigue la estructura de **Clean Architecture** con las siguientes capas:

```
modules/[module-name]/
├── domain/                    # Capa de Dominio (Lógica de negocio pura)
│   ├── models/               # Entidades del dominio
│   │   └── [Entity].ts       # Modelos de dominio (interfaces/clases)
│   ├── repositories/         # Interfaces de repositorios (contratos)
│   │   └── [Repository].ts   # Interfaces que definen contratos
│   ├── services/             # Servicios de dominio
│   │   └── [Service].ts      # Lógica de negocio pura
│   └── value-objects/        # Value Objects
│       └── [ValueObject].ts  # Objetos de valor inmutables
│
├── application/               # Capa de Aplicación (Casos de uso)
│   ├── dto/                  # Data Transfer Objects
│   │   └── [DTO].ts          # DTOs para comunicación con API
│   ├── mappers/              # Mappers entre capas
│   │   └── [Mapper].ts       # Conversión DTO <-> Domain Model
│   └── use-cases/            # Casos de uso
│       └── [feature]/        # Agrupados por funcionalidad
│           └── [UseCase].ts  # Implementación de casos de uso
│
├── infrastructure/            # Capa de Infraestructura (Implementaciones)
│   ├── http/                 # Clientes HTTP específicos del módulo
│   │   └── [module]HttpClient.ts
│   ├── repositories/         # Implementaciones de repositorios
│   │   └── http/             # Repositorios HTTP
│   │       └── [Repository]HttpRepository.ts
│   └── helpers/              # Helpers específicos del módulo
│
└── presentation/             # Capa de Presentación (UI)
    ├── components/           # Componentes React del módulo
    │   └── [Component].tsx
    ├── hooks/                # Hooks React del módulo
    │   └── use[Feature].ts   # Hooks que encapsulan lógica
    ├── guards/               # Route guards (protección de rutas)
    │   └── [Guard].tsx
    ├── store/                # Estado local del módulo (Zustand si se requiere)
    │   └── [store].ts
    └── contexts/             # Contexts React del módulo
        └── [Context].tsx
```

### Descripción de Capas

#### 1. Domain (Dominio)
- **Responsabilidad**: Contiene la lógica de negocio pura, independiente del framework
- **Regla**: NO debe depender de ninguna otra capa

#### 2. Application (Aplicación)
- **Responsabilidad**: Orquesta los casos de uso y coordina entre dominio e infraestructura
- **Regla**: Puede depender de Domain, pero NO de Infrastructure ni Presentation

#### 3. Infrastructure (Infraestructura)
- **Responsabilidad**: Implementa las interfaces definidas en Domain usando tecnologías específicas
- **Regla**: Implementa interfaces de Domain, puede usar `shared/infrastructure`

#### 4. Presentation (Presentación)
- **Responsabilidad**: Interfaz de usuario y lógica de presentación
- **Regla**: Puede depender de Application y Domain, pero NO directamente de Infrastructure

---

## ⚙️ Configuración del Proyecto

### Alias de Importación

El proyecto utiliza alias de TypeScript para importaciones limpias:

| Alias | Ruta Real | Uso |
|-------|-----------|-----|
| `@/` | `./src/` | Importaciones generales |
| `@app/` | `./src/app/` | Código de la aplicación (routing, páginas) |
| `@modules/` | `./src/modules/` | Módulos de negocio |
| `@shared/` | `./src/shared/` | Código compartido |
| `@components/` | `./src/components/` | Componentes UI reutilizables |
| `@providers/` | `./src/providers/` | Context Providers |
| `@types/` | `./src/types/` | Tipos TypeScript globales |
| `@styles/` | `./src/styles/` | Estilos globales |

### Ejemplos de Uso

```typescript
// ✅ Correcto - usando alias
import { Button } from '@components/ui/button';
import { useExample } from '@modules/example/presentation/hooks/useExample';
import { httpClient } from '@shared/infrastructure/http/base.client';

// ❌ Incorrecto - rutas relativas largas
import { Button } from '../../../components/ui/button';
```

---

## 🚀 Guía de Implementación

### Crear un Nuevo Módulo

1. **Crear estructura de carpetas** siguiendo el patrón de `modules/example/`
2. **Definir entidades del dominio** (`domain/models/`)
3. **Definir interfaces de repositorios** (`domain/repositories/`)
4. **Crear DTOs** (`application/dto/`)
5. **Implementar mappers** (`application/mappers/`)
6. **Implementar repositorios HTTP** (`infrastructure/repositories/http/`)
7. **Crear hooks de presentación** (`presentation/hooks/`)
8. **Crear componentes** (`presentation/components/`)
9. **Crear páginas en `src/app/pages/`** que usen los componentes del módulo
10. **Agregar rutas en `src/app/routes.tsx`**

---

## 📚 Recursos Adicionales

### Documentación de Librerías Clave

- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Table](https://tanstack.com/table/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

**Última actualización**: Generado automáticamente basado en la estructura actual del proyecto `mishiwoof_web`.
