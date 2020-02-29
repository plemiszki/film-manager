RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end
  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end
  config.shared_context_metadata_behavior = :apply_to_host_groups
end

def set_up_user_and_label_and_licensor_and_rights_and_revenue_streams
  create(:user)
  create(:label)
  create(:licensor)
  [
    'Theatrical',
    'Educational',
    'Festival',
    'Other Non-Theatrical',
    'SVOD',
    'TVOD (Cable)',
    'EST/DTR',
    'Pay TV',
    'Free TV',
    'FVOD',
    'AVOD',
    'DVD/Video',
    'Hotels',
    'Airlines',
    'Ships',
    'Film Movement Plus'
  ].each_with_index do |name, index|
    create(:right, name: name, order: index)
  end
  [
    'Theatrical',
    'Non-Theatrical',
    'Video',
    'Commercial Video',
    'VOD',
    'SVOD',
    'TVOD',
    'AVOD',
    'FVOD',
    'Other Internet',
    'Hotels, Ships, Airlines',
    'Television',
    'FM Subscription',
    'Jewish Festivals'
  ].each_with_index do |name, index|
    create(:revenue_stream, name: name, order: index)
  end
end
