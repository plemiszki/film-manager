Rails.application.routes.draw do

  # require 'sidekiq/web'
  # mount Sidekiq::Web => '/sidekiq'

  root to: "films#index"
  resources :films, only: [:index, :show]
  resources :venues, only: [:index, :show]
  resources :bookings, only: [:index, :show]
  resources :virtual_bookings, only: [:index, :show]
  resources :bookers, only: [:index, :show]
  resources :dvds, only: [:show]
  resources :shorts, only: [:index]
  resources :tv_series, only: [:index]
  resources :licensors, only: [:index, :show]
  resources :dvd_customers, only: [:index, :show]
  resources :sublicensors, only: [:index, :show]
  resources :shipping_addresses, only: [:index, :show]
  resources :purchase_orders, only: [:index, :show]
  get '/dvd_reports' => 'purchase_orders#reporting'
  resources :giftboxes, only: [:index, :show]
  get '/royalty_reports/codes' => 'royalty_reports#codes'
  resources :royalty_reports, only: [:index, :show]
  resources :users, only: [:index, :show]
  resources :emails, only: [:index]
  resources :invoices, only: [:index, :show]
  resources :returns, only: [:index, :show]
  resources :credit_memos, only: [:index, :show]
  get '/credit_memos/:id/export' => 'credit_memos#export'
  resource :setting, path: 'settings'
  patch '/users/1' => 'api/convert#import'
  patch '/users/2' => 'api/royalty_reports#import'
  patch '/users/5' => 'api/dvds#update_stock'
  resources :countries, only: [:show]
  resources :languages, only: [:show]
  resources :genres, only: [:show]
  resources :topics, only: [:show]
  resources :quotes, only: [:show]
  resources :formats, only: [:show]
  resources :territories, only: [:show]
  resources :digital_retailers, only: [:show]
  resources :edu_platforms, only: [:show]
  resources :film_rights, only: [:show]
  resources :digital_retailer_films, only: [:show]
  resources :edu_platform_films, only: [:show]
  get '/in_theaters' => 'in_theaters_films#index'
  get '/calendar' => 'calendar#show'
  get '/convert' => 'convert#show'
  resources :sub_rights, only: [:show]
  resources :episodes, only: [:show]
  resources :merchandise_types, only: [:show]
  resources :merchandise_items, only: [:index, :show]
  resources :aliases, only: [:index, :show]
  resources :amazon_genres, only: [:show]
  resources :amazon_languages, only: [:show]
  resources :institutions, only: [:index, :show]
  resources :institution_orders, only: [:index, :show]

  namespace :api do
    get '/users' => '/api/users#api_index'
    get '/users/:id' => '/api/users#show'
    post '/users' => '/api/users#api_create'
    patch '/users/:id' => '/api/users#api_update'
    delete '/users/:id' => '/api/users#api_destroy'
    get '/licensors/:id/generate_statements_summary' => '/api/licensors#generate_statements_summary'
    resources :licensors, only: [:index, :show, :create, :update, :destroy]
    get '/films/auto_renew' => '/api/films#auto_renew'
    get '/films/auto_renew/all' => '/api/films#auto_renew_all'
    get '/films/auto_renew/:id' => '/api/films#auto_renew_film'
    get '/films/export_xml_mec' => '/api/films#export_xml_mec'
    get '/films/export_xml_mmc' => '/api/films#export_xml_mmc'
    resources :films, only: [:index, :show, :create, :update, :destroy]
    post '/films/export' => '/api/films#export'
    post '/films/copy' => '/api/films#copy'
    post '/films/update_artwork' => '/api/films#update_artwork'
    resources :venues, only: [:index, :show, :create, :update, :destroy]
    post '/venues/:id/create_in_stripe' => '/api/venues#create_in_stripe'
    resources :institutions, only: [:index, :show, :create, :update, :destroy]
    post '/institutions/:id/create_in_stripe' => '/api/institutions#create_in_stripe'
    resources :institution_orders, only: [:index, :new, :show, :create, :update, :destroy]
    resources :institution_order_films, only: [:create, :destroy]
    post '/institution_orders/:id/send_invoice' => 'institution_orders#send_invoice'
    get '/bookings/advanced' => '/api/bookings#advanced'
    get '/bookings/export' => '/api/bookings#export'
    resources :bookings, only: [:index, :new, :show, :create, :update, :destroy]
    post '/bookings/:id/create_in_stripe' => '/api/bookings#create_in_stripe'
    post '/bookings/copy' => 'bookings#copy'
    post '/bookings/:id/confirm' => '/api/bookings#send_confirmation'
    get '/bookings/:id/invoices' => '/api/bookings#invoices'
    get '/virtual_bookings/export' => '/api/virtual_bookings#export'
    resources :virtual_bookings, only: [:index, :new, :create, :show, :update, :destroy]
    post '/virtual_bookings/:id/send_report' => '/api/virtual_bookings#send_report'
    get '/virtual_bookings/:id/invoices' => '/api/virtual_bookings#invoices'
    resources :bookers, only: [:index, :show, :create, :update, :destroy]
    resources :booker_venues, only: [:create, :destroy]
    resources :giftboxes, only: [:index, :show, :create, :update, :destroy]
    resources :giftbox_dvds, only: [:create, :destroy]
    get '/royalty_reports/zip' => '/api/royalty_reports#zip'
    get '/royalty_reports/status' => '/api/royalty_reports#status'
    get '/royalty_reports/summary' => '/api/royalty_reports#summary'
    get '/royalty_reports/export_uncrossed' => '/api/royalty_reports#export_uncrossed'
    resources :royalty_reports, only: [:index, :show, :create, :update, :destroy]
    get '/royalty_reports/:id/export' => '/api/royalty_reports#export'
    post '/royalty_reports/export_all' => '/api/royalty_reports#export_all'
    post '/royalty_reports/send_all' => '/api/royalty_reports#send_all'
    post '/royalty_reports/error_check' => '/api/royalty_reports#error_check'
    post '/royalty_reports/licensor_invoices' => '/api/royalty_reports#licensor_invoices'
    post '/royalty_reports/totals' => '/api/royalty_reports#totals'
    resources :jobs, only: [:index, :show, :update]
    resources :dvd_customers, only: [:index, :show, :create, :update, :destroy]
    post '/dvd_customers/:id/create_in_stripe' => '/api/dvd_customers#create_in_stripe'
    resources :sublicensors, only: [:index, :show, :create, :update, :destroy]
    resources :dvds, only: [:show, :create, :update, :destroy]
    resources :dvd_shorts, only: [:create, :destroy]
    get '/dvd_reports' => '/api/purchase_orders#reporting'
    get '/purchase_orders/check_jobs' => 'purchase_orders#check_jobs'
    resources :purchase_orders, only: [:index, :new, :show, :create, :update, :destroy]
    post '/purchase_orders/ship' => '/api/purchase_orders#ship'
    resources :purchase_order_items, only: [:create, :destroy]
    resources :shipping_addresses, only: [:index, :create, :show, :update, :destroy]
    get '/invoices/:id/export' => '/api/invoices#export_single'
    get '/invoices/export' => '/api/invoices#export'
    resources :invoices, only: [:index, :show, :update, :destroy]
    post '/invoices' => '/api/invoices#create'
    get '/credit_memos/export' => '/api/credit_memos#export'
    resources :credit_memos, only: [:index, :new, :create, :show]
    get '/dvd_reports/export' => '/api/purchase_orders#export'
    get '/calendar' => 'calendar#show'

    get '/returns/export' => '/api/returns#export'
    resources :returns, only: [:index, :new, :create, :show, :update, :destroy]
    post '/returns/:id/send_credit_memo' => '/api/returns#send_credit_memo'
    resources :return_items, only: [:create, :destroy]

    resources :weekly_terms, only: [:create, :destroy]
    resources :weekly_box_offices, only: [:create, :destroy]
    resources :payments, only: [:create, :destroy]
    resource :settings
    resources :countries, only: [:index, :create, :show, :update, :destroy]
    resources :languages, only: [:index, :create, :show, :update, :destroy]
    resources :genres, only: [:index, :create, :show, :update, :destroy]
    resources :topics, only: [:index, :create, :show, :update, :destroy]
    resources :episodes, only: [:create, :show, :update, :destroy]
    resources :aliases, only: [:index, :new, :create, :show, :update, :destroy]
    resources :alternate_lengths, only: [:create, :destroy]
    resources :alternate_audios, only: [:create, :destroy]
    resources :alternate_subs, only: [:create, :destroy]
    resources :alternate_audios, only: [:create, :destroy]

    patch '/film_countries/rearrange' => '/api/film_countries#rearrange'
    resources :film_countries, only: [:index, :create, :destroy]
    patch '/film_languages/rearrange' => '/api/film_languages#rearrange'
    resources :film_languages, only: [:index, :create, :destroy]
    patch '/film_genres/rearrange' => '/api/film_genres#rearrange'
    resources :film_genres, only: [:index, :create, :destroy]
    patch '/quotes/rearrange' => '/api/quotes#rearrange'
    resources :quotes, only: [:create, :show, :update, :destroy]
    patch '/laurels/rearrange' => '/api/laurels#rearrange'
    resources :laurels, only: [:create, :destroy]
    patch '/actors/rearrange' => '/api/actors#rearrange'
    resources :actors, only: [:create, :destroy]
    patch '/directors/rearrange' => '/api/directors#rearrange'
    resources :directors, only: [:create, :destroy]

    resources :film_formats, only: [:index, :create, :destroy]
    resources :film_topics, only: [:index, :create, :destroy]
    resources :related_films, only: [:create, :destroy]
    resources :crossed_films, only: [:create, :destroy]
    resources :amazon_genre_films, only: [:create, :destroy]
    resources :amazon_language_films, only: [:create, :destroy]

    resources :formats, only: [:index, :create, :show, :update, :destroy]
    resources :territories, only: [:index, :create, :show, :update, :destroy]
    patch '/film_rights/change_dates' => '/api/film_rights#change_dates'
    resources :film_rights, only: [:create, :show, :update, :destroy]
    resources :digital_retailers, only: [:index, :create, :show, :update, :destroy]
    resources :digital_retailer_films, only: [:new, :create, :show, :update, :destroy]
    resources :edu_platforms, only: [:index, :create, :show, :update, :destroy]
    resources :edu_platform_films, only: [:new, :create, :show, :update, :destroy]
    get '/rights_and_territories' => '/api/film_rights#rights_and_territories'
    get '/in_theaters' => '/api/in_theaters_films#index'
    post '/in_theaters' => '/api/in_theaters_films#create'
    post '/in_theaters/rearrange' => '/api/in_theaters_films#rearrange'
    delete '/in_theaters/:id' => '/api/in_theaters_films#destroy'
    resources :sub_rights, only: [:index, :new, :create, :show, :update, :destroy]
    resources :merchandise_types, only: [:index, :create, :show, :update, :destroy]
    resources :merchandise_items, only: [:index, :new, :create, :show, :update, :destroy]
    resources :amazon_genres, only: [:index, :create, :show, :update, :destroy]
    resources :amazon_languages, only: [:index, :create, :show, :update, :destroy]

    get '/website/films' => '/api/website#films'
    get '/website/bookings' => '/api/website#bookings'
    get '/website/merchandise' => '/api/website#merchandise'

    get '/justwatch' => 'external#justwatch'
    get '/samsung' => 'external#samsung'
  end

  # Clearance ------------------------
  resources :passwords, controller: "clearance/passwords", only: [:create, :new]
  resource :session, controller: "clearance/sessions", only: [:create]
  resources :users, controller: "clearance/users", only: [:create] do
    resource :password,
      controller: "clearance/passwords",
      only: [:create, :edit, :update]
  end
  get "/sign_in" => "clearance/sessions#new", as: "sign_in"
  delete "/sign_out" => "clearance/sessions#destroy", as: "sign_out"
  # ----------------------------------
end
