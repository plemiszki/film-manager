Clearance.configure do |config|
  config.allow_sign_up = false
  config.mailer_sender = "reply@example.com"
  config.routes = false # set to false because we're using custom Clearance routes
end
