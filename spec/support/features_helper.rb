RSpec.configure do |config|
  config.before(:all) { $admin_user ||= User.create!(name: 'Peter Lemiszki', email: 'peter+features@filmmovement.com', password: 'password', access: 150) }
end
