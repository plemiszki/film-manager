Rails.application.routes.draw do
  root to: "films#index"
  resources :films, only: [:index, :show]
  resources :venues, only: [:index, :show]
  get '/bookings/advanced' => 'bookings#advanced'
  resources :bookings, only: [:index, :show]
  resources :dvds, only: [:show]
  resources :shorts, only: [:index]
  resources :licensors, only: [:index, :show]
  resources :dvd_customers, only: [:index, :show]
  resources :shipping_addresses, only: [:index, :show]
  resources :purchase_orders, only: [:index, :show]
  get '/dvd_reports' => 'purchase_orders#reporting'
  resources :giftboxes, only: [:index, :show]
  resources :royalty_reports, only: [:index, :show]
  resources :users, only: [:index, :show]
  resources :invoices, only: [:index, :show]
  resources :returns, only: [:index, :show]
  resource :setting, path: "settings"
  get '/import' => 'films#import_data'
  patch '/users/1' => 'films#upload'
  patch '/users/2' => 'api/royalty_reports#import'
  patch '/users/3' => 'api/dvds#update_stock'
  resources :countries, only: [:show]
  resources :languages, only: [:show]
  resources :genres, only: [:show]
  resources :topics, only: [:show]
  resources :quotes, only: [:show]

  namespace :api do
    get '/users' => '/api/users#api_index'
    get '/users/:id' => '/api/users#show'
    post '/users' => '/api/users#api_create'
    patch '/users/:id' => '/api/users#api_update'
    delete '/users/:id' => '/api/users#api_destroy'
    resources :licensors, only: [:index, :show, :create, :update, :destroy]
    resources :films, only: [:index, :show, :create, :update, :destroy]
    resources :venues, only: [:index, :show, :create, :update, :destroy]
    get '/bookings/upcoming' => '/api/bookings#upcoming_index'
    get '/bookings/advanced' => '/api/bookings#advanced'
    post '/bookings/export' => '/api/bookings#export'
    resources :bookings, only: [:index, :show, :create, :update, :destroy]
    post '/bookings/:id/confirm' => '/api/bookings#send_confirmation'
    resources :giftboxes, only: [:index, :show, :create, :update, :destroy]
    resources :giftbox_dvds, only: [:create, :destroy]
    get '/royalty_reports/zip' => '/api/royalty_reports#zip'
    get '/royalty_reports/status' => '/api/royalty_reports#status'
    resources :royalty_reports, only: [:index, :show, :create, :update, :destroy]
    get '/royalty_reports/:id/export' => '/api/royalty_reports#export'
    post '/royalty_reports/export_all' => '/api/royalty_reports#export_all'
    post '/royalty_reports/send_all' => '/api/royalty_reports#send_all'
    post '/royalty_reports/error_check' => '/api/royalty_reports#error_check'
    get '/jobs/status' => '/api/jobs#status'
    resources :dvd_customers, only: [:index, :show, :create, :update, :destroy]
    resources :dvds, only: [:show, :create, :update, :destroy]
    resources :dvd_shorts, only: [:create, :destroy]
    get '/dvd_reports' => '/api/purchase_orders#reporting'
    resources :purchase_orders, only: [:index, :show, :create, :update, :destroy]
    post '/purchase_orders/ship' => '/api/purchase_orders#ship'
    resources :purchase_order_items, only: [:create, :destroy]
    resources :shipping_addresses, only: [:index, :create, :show, :update, :destroy]
    resources :invoices, only: [:index, :show]
    get '/invoices/:id/export' => '/api/invoices#export'
    post '/invoices/export' => '/api/invoices#export_sage'
    resources :returns, only: [:index, :create, :show, :update, :destroy]
    resources :return_items, only: [:create, :destroy]
    resources :weekly_terms, only: [:create, :destroy]
    resources :weekly_box_offices, only: [:create, :destroy]
    resources :payments, only: [:create, :destroy]
    resource :settings
    resources :countries, only: [:index, :create, :show, :update, :destroy]
    resources :languages, only: [:index, :create, :show, :update, :destroy]
    resources :genres, only: [:index, :create, :show, :update, :destroy]
    resources :topics, only: [:index, :create, :show, :update, :destroy]
    resources :film_countries, only: [:index, :create, :destroy]
    resources :film_languages, only: [:index, :create, :destroy]
    resources :film_genres, only: [:index, :create, :destroy]
    resources :film_topics, only: [:index, :create, :destroy]
    resources :quotes, only: [:create, :show, :update, :destroy]
    resources :laurels, only: [:create, :destroy]
    resources :related_films, only: [:create, :destroy]
    resources :directors, only: [:create, :destroy]
    resources :actors, only: [:create, :destroy]

    get '/website/films' => '/api/website#films'
    get '/website/gift_boxes' => '/api/website#gift_boxes'
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
