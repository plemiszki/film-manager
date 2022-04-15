Sentry.init do |config|
  config.dsn = ENV.fetch('SENTRY_DSN')
  config.enabled_environments = ['production']
end
