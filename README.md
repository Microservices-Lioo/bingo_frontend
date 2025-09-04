# 🎯 Bingo Frontend

[![Angular](https://img.shields.io/badge/Angular-19.0.5-red?style=flat&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Una aplicación web moderna de Bingo desarrollada con Angular, diseñada como parte de una arquitectura de microservicios para ofrecer una experiencia de juego interactiva y en tiempo real.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts Disponibles](#scripts-disponibles)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Contribución](#contribución)
- [Arquitectura](#arquitectura)
- [Licencia](#licencia)

## ✨ Características

- 🎮 **Juego de Bingo Interactivo**: Experiencia de usuario fluida y responsive
- 🔄 **Tiempo Real**: Sincronización en vivo con otros jugadores
- 📱 **Responsive Design**: Optimizado para dispositivos móviles y desktop
- 🏗️ **Arquitectura de Microservicios**: Integración con backend distribuido
- 🎨 **UI/UX Moderna**: Interfaz intuitiva y atractiva
- 🔐 **Autenticación**: Sistema de usuarios seguro
- 📊 **Dashboard**: Panel de estadísticas y gestión de partidas

## 🛠️ Tecnologías Utilizadas

- **Framework**: Angular 19.0.5
- **Lenguaje**: TypeScript
- **Styling**: CSS3 / SCSS
- **Testing**: Karma, Jasmine
- **Build Tools**: Angular CLI
- **Package Manager**: npm

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/) (versión 8 o superior)
- [Angular CLI](https://cli.angular.io/) (versión 19 o superior)

```bash
# Verificar versiones instaladas
node --version
npm --version
ng version
```

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Microservices-Lioo/bingo_frontend.git
   cd bingo_frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp src/environments/environment.template.ts src/environments/environment.ts
   cp src/environments/environment.template.ts src/environments/environment.development.ts
   # Editar el archivo con la configuración específica de tu entorno
   ```

## 🎮 Uso

### Desarrollo Local

Para iniciar el servidor de desarrollo:

Archivo usado `environments/environments.development.ts`.

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`. Los cambios se recargarán automáticamente.

### Generar Componentes

Crear nuevos componentes usando Angular CLI:

```bash
# Generar un componente
ng generate component components/nombre-componente

# Generar un servicio
ng generate service services/nombre-servicio

# Ver todas las opciones disponibles
ng generate --help
```

## 📁 Estructura del Proyecto

```
public/
└── assets/
src/
├── app/
│   ├── core/
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── erros/              # Manejo de errores
│   │   └── interfaces/         # Interfaces
│   ├── features/              # Páginas principales
│   │   ├── home/               # Módulos de inicio
│   │   ├── game/               # Módulos de juego
│   │   └── events/             # Módulos de eventos
│   ├── ui/                     # Elementos html customizados
│   └── shared/                 # Módulos compartidos
│   │   ├── components/         # Componentes
│   │   ├── consts/             # Constantes
│   │   ├── services/           # Servicios
│   │   └── interfaces/         # Interfaces
├── environments/           # Configuraciones de entorno
└── styles.css                 # Estilos globales
```

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run build:prod` | Build optimizado para producción |
| `npm test` | Ejecuta las pruebas unitarias |
| `npm run test:coverage` | Ejecuta tests con reporte de cobertura |
| `npm run e2e` | Ejecuta pruebas end-to-end |
| `npm run lint` | Ejecuta el linter de código |

## 🚀 Despliegue

### Build para Producción

```bash
# Build optimizado
ng build --configuration=production

# Los archivos se generarán en dist/
```

### Variables de Entorno

Configura las siguientes variables según tu entorno:

```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: 'https://tu-api-backend.com',
  wsUrl: 'wss://tu-websocket-server.com',
  version: '1.0.0'
};
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- Seguir las convenciones de [Angular Style Guide](https://angular.io/guide/styleguide)
- Usar TypeScript estricto
- Documentar funciones complejas
- Mantener cobertura de tests > 80%

## 🏗️ Arquitectura

Este frontend forma parte de una arquitectura de microservicios:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Bingo Frontend │◄──►│   API Gateway    │◄──►│   Microservices │
│   (Angular)     │    │                  │    │    Backend      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Servicios Integrados

- **Auth Service**: Autenticación y autorización
- **Game Service**: Lógica de juego y estado
- **WebSocket Service**: Comunicación en tiempo real
- **User Service**: Gestión de perfiles

## 🔧 Configuración Adicional

### Angular CLI

Para más información sobre Angular CLI, visita:
- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)

### Personalización

Puedes personalizar la configuración en:
- `angular.json` - Configuración del workspace
- `tsconfig.json` - Configuración de TypeScript
- `package.json` - Scripts y dependencias

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

Desarrollado por el equipo **Microservices-Lioo**.

---

⭐ Si te gusta el proyecto, ¡dale una estrella en GitHub!

## 📞 Soporte

Si tienes problemas o preguntas:

1. Busca en [Issues](https://github.com/Microservices-Lioo/bingo_frontend/issues)
2. Crea un nuevo issue si es necesario

---

**Nota**: Este proyecto requiere conexión con los microservicios backend para funcionar completamente. Asegúrate de tener el backend ejecutándose antes de realizar pruebas de integración.