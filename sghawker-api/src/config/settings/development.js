const settings = {
  PORT: 4000,
  DATABASE_URL: 'mongodb+srv://admin:admin@test-cluster.4dlhv.mongodb.net/test?retryWrites=true&w=majority',
  ADMIN_EMAIL: 'admin@admin.com',
  ADMIN_PASSWORD: 'passWORD!',
  SENDGRID_API_KEY: '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',
  ACCOUNT_INACTIVITY_LIMIT_IN_DAYS: 30,
  UNPAID_ORDER_MAX_DURATION_IN_MINUTES: 15,
  ADVANCE_ORDER_READY_LIMIT_IN_MINUTES: 15,
  ORDER_BUFFER_TIME_IN_MINUTES: 2,
  DELIVERY_COMMISSION_RATE_IN_PERCENTAGE: 0.1,
};

export default settings;
