# 🎨 CONSOLIDAÇÃO DE CORES - MonitoraCult

## ✅ Sistem de Cores Consolidado

### 🌓 Dark Mode (Principal)
```javascript
const colors = {
  background: "#121212",        // Fundo principal
  backgroundAlt: "#1E1E1E",     // Alternativa (cards)
  backgroundLight: "#202020",   // Alternativa mais suave
  
  surface: "#1E1E1E",           // Cards, containers
  surfaceLight: "#202020",      // Elementos mais suaves
  surfaceAlt: "#2a2a2a",        // Elementos em segundo plano
  
  primary: "#3cc962",           // Verde - ação principal
  primaryDark: "#0c1f11",       // Verde escuro
  secondary: "#13291d",         // Verde secundário
  
  danger: "#FF4C4C",
  dangerBg: "#2a1212",
  
  text: "#ffffff",              // Texto primário
  textSecondary: "#aaa",        // Texto secundário
  textTertiary: "#ccc",         // Texto terciário
  textLight: "#999",            // Texto muito claro
  
  border: "#1f3d2a",            // Border verde
  borderLight: "#333333",       // Border cinza light
  borderDark: "#1a1a1a",        // Border cinza dark
};
```

### 📱 Light Mode (Opcional - Futuro)
```javascript
backgroundLightMode: "#FDFCFB"  // Fundo principal light
```

---

## ✅ Arquivos Atualizados

### 1. **GlobalStyles.js** ✓
- ✅ Novo sistema de colors consolidado
- ✅ Todos os estilos atualizados com colors.*
- ✅ Exporta `colors` para uso em telas

### 2. **Navigation**
- ✅ CustomDrawerNavigator.js - Cores atualizadas
- ✅ TabNavigator.js - Cores atualizadas com fallback para rgba

### 3. **Screens**
- ✅ EventoHome.js - Cores atualizadas
- ⏳ TelaBusca.js - Inicializado, falta atualizar estilos
- ⏳ Outras telas - Ainda com cores hardcoded

---

## 🔄 Cores Mapeadas

| Cor Antiga | Cor Nova | Variável |
|-----------|----------|----------|
| `#121212` | `colors.background` | Fundo principal |
| `#1E1E1E` | `colors.surface` | Cards |
| `#202020` | `colors.surfaceLight` | Alternat. leve |
| `#2a2a2a` | `colors.surfaceAlt` | Segundo plano |
| `#0c1f11` | `colors.background` ou `colors.primaryDark` | Contexto |
| `#13291d` | `colors.surfaceAlt` | Superfícies |
| `#1f3d2a` | `colors.borderLight` | Borders |
| `#ffffff` | `colors.text` | Texto primário |
| `#aaa` | `colors.textSecondary` | Texto secundário |
| `#ccc` | `colors.textTertiary` | Texto terciário |
| `#999` | `colors.textLight` | Texto leve |
| `#777` | `colors.textLight` | Ícones inativos |
| `#3cc962` | `colors.primary` | Accent verde |
| `#FF4C4C` | `colors.danger` | Alerta/Erro |
| `#2a1212` | `colors.dangerBg` | Background perigo |

---

## 📝 Padrão de Uso

### Em Componentes
```javascript
import GlobalStyles from "../styles/GlobalStyles";
const { colors } = GlobalStyles;

// Usar em StyleSheet
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    color: colors.text,
  }
});

// Ou em inline styles
<View style={{ backgroundColor: colors.surface }}>
```

### Em Gradients/Dynamic
```javascript
<LinearGradient
  colors={[colors.background, colors.surfaceAlt]}
  style={styles.header}
/>
```

---

## 🎯 Próximas Etapas

1. **Audit completo** - Verificar todas as cores hardcoded restantes
2. **TelaBusca.js** - Finalizar atualização de cores nos estilos
3. **Outras telas** - CriarPost, EventoApp, PerfilCadastro, etc.
4. **Light mode** - Se decidir implementar

---

## 📊 Status de Migração

- [x] GlobalStyles.js - 100%
- [x] CustomDrawerNavigator.js - 100%
- [x] TabNavigator.js - 100%
- [x] EventoHome.js - 100%
- [ ] TelaBusca.js - 10%
- [ ] CriarPost.js
- [ ] EventoApp.js
- [ ] Outras telas

