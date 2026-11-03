import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude, // 保留默认排除项（node_modules、dist 等）
      'Lab 7',
      'Lab 8',
      'Lab 9'
    ]
  }
})
