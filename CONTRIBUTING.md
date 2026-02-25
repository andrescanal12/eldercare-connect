# Guía de Contribución 🤝

Bienvenido al repositorio de **FIMLM Eldercare Connect**. Sigue este flujo para colaborar sin romper producción.

## 🌿 Ramas del Proyecto

| Rama | Descripción |
|------|-------------|
| `main` | ✅ Producción — Vercel despliega desde aquí. **No tocar directamente** |
| `develop` | 🔧 Integración — Base para crear tus features |
| `feature/*` | 🛠️ Tu tarea en curso |

---

## 📋 Cómo Empezar

### 1. Clona el repo (primera vez)
```bash
git clone https://github.com/andrescanal12/eldercare-connect.git
cd eldercare-connect
npm install
```

### 2. Crea tu rama desde develop
```bash
git checkout develop
git pull origin develop
git checkout -b feature/tu-nombre/descripcion
```

### 3. Trabaja y sube tus cambios
```bash
git add -A
git commit -m "feat: descripción del cambio"
git push origin feature/tu-nombre/descripcion
```

### 4. Abre un Pull Request
- **Base:** `develop` ← **Compare:** `feature/tu-rama`
- Espera revisión del otro antes de hacer merge

---

## ✅ Convención de Commits

```
feat:      Nueva funcionalidad
fix:       Corrección de bug
style:     Cambios visuales (sin lógica)
refactor:  Limpieza de código
docs:      Solo documentación
```

---

## 🛡️ Reglas

- ❌ Nunca hagas `push` directo a `main`
- ❌ Nunca hagas `push` directo a `develop` (usa PRs)
- ✅ Un PR = una funcionalidad
- ✅ Siempre pide revisión antes de mergear
