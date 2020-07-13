Rails.application.routes.draw do

  root to: "films#index"
  resources :films, only: [:index, :show]
  resources :venues, only: [:index, :show]
  get '/bookings/advanced' => 'bookings#advanced'
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
  resources :invoices, only: [:index, :show]
  resources :returns, only: [:index, :show]
  resource :setting, path: "settings"
  get '/catalog' => 'films#catalog'
  patch '/users/1' => 'api/convert#import'
  patch '/users/2' => 'api/royalty_reports#import'
  patch '/users/4' => 'api/dvds#update_stock'
  patch '/users/6' => 'api/films#catalog'
  resources :countries, only: [:show]
  resources :languages, only: [:show]
  resources :genres, only: [:show]
  resources :topics, only: [:show]
  resources :quotes, only: [:show]
  resources :formats, only: [:show]
  resources :territories, only: [:show]
  resources :digital_retailers, only: [:show]
  resources :film_rights, only: [:show]
  resources :digital_retailer_films, only: [:show]
  get '/in_theaters' => 'in_theaters_films#index'
  get '/calendar' => 'calendar#show'
  get '/convert' => 'convert#show'
  resources :sub_rights, only: [:show]
  resources :episodes, only: [:show]
  resources :merchandise_types, only: [:show]
  resources :merchandise_items, only: [:index, :show]
  resources :aliases, only: [:index, :show]

  namespace :api do
    get '/users' => '/api/users#api_index'
    get '/users/:id' => '/api/users#show'
    post '/users' => '/api/users#api_create'
    patch '/users/:id' => '/api/users#api_update'
    delete '/users/:id' => '/api/users#api_destroy'
    resources :licensors, only: [:index, :show, :create, :update, :destroy]
    resources :films, only: [:index, :show, :create, :update, :destroy]
    post '/films/export' => '/api/films#export'
    post '/films/copy' => '/api/films#copy'
    post '/films/catalog' => '/api/films#catalog'
    post '/films/update_artwork' => '/api/films#update_artwork'
    resources :venues, only: [:index, :show, :create, :update, :destroy]
    get '/bookings/upcoming' => '/api/bookings#upcoming_index'
    get '/bookings/advanced' => '/api/bookings#advanced'
    post '/bookings/export' => '/api/bookings#export'
    resources :bookings, only: [:index, :show, :create, :update, :destroy]
    post '/bookings/copy' => 'bookings#copy'
    post '/bookings/:id/confirm' => '/api/bookings#send_confirmation'
    resources :virtual_bookings, only: [:index, :new, :create, :show, :update, :destroy]
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
    post '/royalty_reports/totals' => '/api/royalty_reports#totals'
    get '/jobs/status' => '/api/jobs#status'
    resources :jobs, only: [:index, :show, :update]
    resources :dvd_customers, only: [:index, :show, :create, :update, :destroy]
    resources :sublicensors, only: [:index, :show, :create, :update, :destroy]
    resources :dvds, only: [:show, :create, :update, :destroy]
    resources :dvd_shorts, only: [:create, :destroy]
    get '/dvd_reports' => '/api/purchase_orders#reporting'
    resources :purchase_orders, only: [:index, :show, :create, :update, :destroy]
    post '/purchase_orders/ship' => '/api/purchase_orders#ship'
    resources :purchase_order_items, only: [:create, :destroy]
    resources :shipping_addresses, only: [:index, :create, :show, :update, :destroy]
    resources :invoices, only: [:index, :show, :update]
    get '/invoices/:id/export' => '/api/invoices#export'
    post '/invoices/export' => '/api/invoices#export_sage'
    post '/invoices' => '/api/invoices#create'
    post '/dvd_reports/export' => '/api/purchase_orders#export'
    get '/calendar' => 'calendar#show'
    resources :returns, only: [:index, :create, :show, :update, :destroy]
    post '/returns/export' => '/api/returns#export'
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

    resources :formats, only: [:index, :create, :show, :update, :destroy]
    resources :territories, only: [:index, :create, :show, :update, :destroy]
    patch '/film_rights/change_dates' => '/api/film_rights#change_dates'
    resources :film_rights, only: [:create, :show, :update, :destroy]
    resources :digital_retailers, only: [:index, :create, :show, :update, :destroy]
    resources :digital_retailer_films, only: [:create, :show, :update, :destroy]
    get '/rights_and_territories' => '/api/film_rights#rights_and_territories'
    get '/in_theaters' => '/api/in_theaters_films#index'
    post '/in_theaters' => '/api/in_theaters_films#create'
    post '/in_theaters/rearrange' => '/api/in_theaters_films#rearrange'
    delete '/in_theaters/:id' => '/api/in_theaters_films#destroy'
    resources :sub_rights, only: [:create, :show, :update, :destroy]
    resources :merchandise_types, only: [:index, :create, :show, :update, :destroy]
    resources :merchandise_items, only: [:index, :create, :show, :update, :destroy]

    get '/website/films' => '/api/website#films'
    get '/website/gift_boxes' => '/api/website#gift_boxes'
    get '/website/bookings' => '/api/website#bookings'
    get '/website/merchandise' => '/api/website#merchandise'
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
