import type { App, InjectionKey, Plugin } from 'vue'


/**
 * 创建类型安全的 InjectionKey
 *
 * @example
 * ```ts
 * const ThemeKey = createInjectionKey<ThemeConfig>('theme')
 * provide(ThemeKey, themeConfig)
 * const theme = inject(ThemeKey)
 * ```
 */
export function createInjectionKey<T>(key: string): InjectionKey<T> {
  return key as any
}
