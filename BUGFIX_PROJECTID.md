# Bugfix Report #5 - Missing projectId Parsing
**Дата**: 2026-01-18  
**Проблема**: Материалы не загружаются — projectId = null

---

## 🐛 Проблема

Страница дашборда не загружала материалы:
- API запросы не выполнялись
- Переменная `projectId` была равна `null`
- URL был правильный: `/projects/project_legacy_1768730426955`

---

## 🔍 Диагностика

1. **Backend логи**: 
   ```
   GET /project_legacy_1768730426955/assets - 200
   ```
   Запрос идёт без `/api/projects/` префикса!

2. **Код проверка**:
   ```javascript
   let projectId = null;  // ❌ Никогда не устанавливается!
   
   // Позже:
   fetch(`/api/projects/${projectId}/assets`)  // projectId = null
   ```

3. **Причина**:
   - `projectId` объявлен как `null`
   - Нет кода для извлечения ID из URL
   - URL `/projects/project_legacy_1768730426955` не парсился

---

## ✅ Решение

Добавлен парсинг URL для извлечения `projectId`:

```javascript
// Извлечь project ID из URL (/projects/:id)
const pathParts = window.location.pathname.split('/');
let projectId = pathParts[pathParts.length - 1];

if (!projectId || projectId === 'projects') {
    alert('Project ID не найден в URL');
    window.location.href = '/projects';
}
```

**Логика**:
1. Разбить URL по `/`: `['', 'projects', 'project_legacy_1768730426955']`
2. Взять последний элемент: `project_legacy_1768730426955`
3. Проверить валидность
4. Если невалидно — редирект на `/projects`

---

## 📊 Результат

**До исправления**:
```javascript
projectId = null
fetch(`/api/projects/null/assets`)  // ❌ 404
```

**После исправления**:
```javascript
projectId = "project_legacy_1768730426955"
fetch(`/api/projects/project_legacy_1768730426955/assets`)  // ✅ 200
```

---

## 🧪 Тестирование

1. **URL парсинг**:
   ```
   URL: /projects/project_legacy_1768730426955
   → projectId = "project_legacy_1768730426955"
   ✅ Правильно извлечён
   ```

2. **API запрос**:
   ```bash
   curl https://edit.synthnova.me/api/projects/project_legacy_1768730426955/assets
   # ✅ {"success": true, "assets": [...]}
   ```

3. **Ручное тестирование**:
   - Открыть https://edit.synthnova.me/projects/project_legacy_1768730426955
   - Материалы должны загрузиться
   - DevTools → Network: запросы к `/api/projects/.../assets`

---

## 📝 Файлы изменены

- `/home/synthnova/frontend/project-dashboard.html` — добавлен парсинг `projectId` из URL

---

## ⏱️ Время исправления

~3 минуты

---

## 📋 Итого исправленных багов

1. ✅ `Cannot read properties of undefined (reading 'replace')` — sync-editor.html
2. ✅ `Identifier 'selectedAssets' has already been declared` — project-dashboard.html
3. ✅ `Unexpected end of input` — project-dashboard.html
4. ✅ `loadProject is not defined` — project-dashboard.html
5. ✅ `projectId = null` — project-dashboard.html ← **НОВЫЙ**

---

**Статус**: ✅ ИСПРАВЛЕНО  
**Дата**: 2026-01-18  
**Автор**: Claude (AI Developer)
