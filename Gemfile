source 'https://rubygems.org'
ruby '2.5.0'

gem 'rails', '4.2.11.1' # Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'pg', '~> 0.15' # Use postgresql as the database for Active Record
gem 'sass-rails', '~> 5.0' # Use SCSS for stylesheets
gem 'uglifier', '>= 1.3.0' # Use Uglifier as compressor for JavaScript assets
gem 'jquery-rails' # Use jquery as the JavaScript library
gem 'jquery-ui-rails' # more jquery functionality (including drag and drop)
gem 'jbuilder', '~> 2.0' # Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'sdoc', '~> 0.4.0', group: :doc # bundle exec rake doc:rails generates the API under doc/api.

# My Gems ----------------------
gem 'aws-sdk'
gem 'bootstrap-sass'
gem 'caracal', '1.2.0'
gem 'clearance', '~> 1.11'
gem 'httparty'
gem 'mailgun-ruby', '~>1.1.6'
gem 'roo-xls'
gem 'roo', '~> 2.7.0'
gem 'rubyzip', '~> 1.2.2'
gem 'sidekiq'
gem 'timeliness'
gem 'validates_timeliness', '~> 4.0'
gem 'wicked_pdf'
gem 'wkhtmltopdf-binary'
gem 'xlsx_writer'
# ------------------------------

group :development, :test do
  gem 'better_errors'
  gem 'byebug'
  gem 'database_cleaner'
  gem 'dotenv-rails'
  gem 'factory_bot'
  gem 'pry-rails'
  gem 'rspec-rails'
end

group :development do
  gem 'web-console', '~> 2.0' # see console on error pages (or <% console %>)
  gem 'spring' # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
end

group :production do
  gem 'rails_12factor' # apparently heroku needs this
end
