RSpec.configure do |config|

  config.before(:each, type: :controller) {
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
    sign_in_as(User.first)
  }
  
end
