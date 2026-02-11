# Icon Migration Documentation

This document tracks the migration from emoji icons to Lucide icon components in the SO-ARM Scratch interface.

## Icon Mapping

| Category | Emoji | Lucide Icon | Component | File Location |
|----------|--------|-------------|------------|--------------|
| Motion | 🤖 | Bot | `<Bot />` | `src/lib/theme/iconRenderer.tsx` |
| Control | 🔄 | RefreshCcw | `<RefreshCcw />` | `src/lib/theme/iconRenderer.tsx` |
| Gripper | ✋ | Hand | `<Hand />` | `src/lib/theme/iconRenderer.tsx` |
| Sensing | 👁️ | Eye | `<Eye />` | `src/lib/theme/iconRenderer.tsx` |
| Operators | 🔢 | Calculator | `<Calculator />` | `src/lib/theme/iconRenderer.tsx` |
| Custom | ⭐ | Star | `<Star />` | `src/lib/theme/iconRenderer.tsx` |

## Files Modified

### Theme Configuration
- **File**: `src/lib/theme/scratch.ts`
- **Change**: Updated `SCRATCH_THEME.icons` from emoji strings to Lucide component names
- **Lines**: 70-77

### Icon Renderer
- **File**: `src/lib/theme/iconRenderer.tsx` (NEW)
- **Purpose**: Maps icon names to Lucide components and renders them
- **Exported Functions**:
  - `renderCategoryIcon(categoryName: string)`: Returns React element with appropriate Lucide icon
  - `getCategoryIconName(categoryName: string)`: Returns icon name string

### Component Updates

1. **Block.tsx**
   - Import added: `renderCategoryIcon` from `@/lib/theme/iconRenderer`
   - Line 113: Changed from `SCRATCH_THEME.icons[...]` to `renderCategoryIcon(...)`

2. **BlockPalette.tsx**
   - Import added: `renderCategoryIcon` from `@/lib/theme/iconRenderer`
   - Removed: `getCategoryIcon` function (no longer needed)
   - Line 70: Changed from `{icon}` to `{renderCategoryIcon(category.id)}`

3. **HorizontalBlockPalette.tsx**
   - Import added: `renderCategoryIcon` from `@/lib/theme/iconRenderer`
   - Removed: `getCategoryIcon` function (no longer needed)
   - Lines 76, 123: Changed from `{icon}` to `{renderCategoryIcon(category.id)}`

4. **Workspace.tsx**
   - Import added: `Bot` from `lucide-react`
   - Line 182: Changed from `<span className="text-7xl mb-4 animate-bounce">🤖</span>` to `<div className="mb-4 animate-bounce text-slate-500"><Bot size={64} /></div>`

5. **Header.tsx**
   - Import added: `Bot` from `lucide-react`
   - Line 30: Changed from `<span className="text-3xl">🤖</span>` to `<Bot size={32} className="text-blue-600" />`

## Benefits of Migration

1. **Accessibility**: Lucide icons are properly rendered SVG elements that can be styled and scaled
2. **Consistency**: Icons maintain consistent stroke width and visual style
3. **Scalability**: Icons can be scaled without pixelation
4. **Customization**: Icons can be styled with CSS (color, size, etc.)
5. **Tree-shaking**: Lucide icons can be tree-shaken to reduce bundle size

## Future Maintenance

To add a new icon category:
1. Add the icon name to `SCRATCH_THEME.icons` in `src/lib/theme/scratch.ts`
2. Import the corresponding Lucide icon in `src/lib/theme/iconRenderer.tsx`
3. Add a case in the `renderCategoryIcon` switch statement

## Verification

To verify all emojis have been replaced:
```bash
grep -r "🤖\|🔄\|✋\|👁️\|🔢\|⭐" src/components/ --include="*.tsx" --include="*.ts"
```

Expected result: No matches (0 lines returned)
