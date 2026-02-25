---
description: how the team should create feature branches, commit changes, and merge to main via Pull Requests
---

## Flujo de Trabajo en Equipo - FIMLM Eldercare Connect

### Estructura de Ramas
- `main`    → Producción (Vercel). NUNCA se toca directamente.
- `develop` → Integración. Base para crear tus features.
- `feature/*` → Rama personal para cada cambio.

---

### 1. Antes de Empezar Cualquier Cambio

Asegúrate de tener lo último de develop:

```powershell
git checkout develop
git pull origin develop
```

---

### 2. Crear tu Rama de Feature

Usa nombres descriptivos con el prefijo `feature/`:

```powershell
git checkout -b feature/tu-nombre/descripcion-corta
# Ejemplos:
# feature/andres/mejora-formulario
# feature/hermano/nueva-pagina-estadisticas
```

---

### 3. Trabajar y Guardar Cambios

Haz commits pequeños y descriptivos. Usa prefijos:
- `feat:` → nueva funcionalidad
- `fix:` → corrección de bug
- `style:` → cambio visual, sin lógica
- `refactor:` → limpieza de código
- `docs:` → documentación

```powershell
git add -A
git commit -m "feat: descripción del cambio"
git push origin feature/tu-nombre/descripcion-corta
```

---

### 4. Abrir un Pull Request (PR) en GitHub

1. Ve a: https://github.com/andrescanal12/eldercare-connect
2. Verás el botón **"Compare & pull request"** → Haz click
3. Pon `develop` como **base branch** (no main)
4. Escribe un título y descripción claros
5. Pide revisión al otro (*Request review*)

---

### 5. Revisión y Merge a develop

- El otro revisa el PR, comenta si hay problemas
- Al aprobar → **"Merge pull request"**
- Borrar la rama después del merge (botón en GitHub)

---

### 6. Deploy a Producción (main)

Cuando `develop` tiene cambios estables y probados:
1. Abre un PR de `develop` → `main`
2. Ambos lo revisan
3. Se hace merge → **Vercel despliega automáticamente** 🚀

---

### Comandos de Referencia Rápida

```powershell
# Ver en qué rama estás
git branch

# Cambiar de rama
git checkout develop

# Actualizar tu rama con los últimos cambios de develop
git pull origin develop

# Ver qué has cambiado
git status

# Deshacer cambios en un archivo (¡cuidado!)
git checkout -- src/archivo.tsx
```
