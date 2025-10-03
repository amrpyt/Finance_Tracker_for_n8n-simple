export default {
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '_generated/**',
        '**/*.test.ts',
        '**/*.config.ts',
      ],
    },
  },
};
