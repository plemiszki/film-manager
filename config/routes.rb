Rails.application.routes.draw do
  root to: "films#index"
  resources :films, only: [:index, :show]
  resources :shorts, only: [:index]
  resources :users, only: [:index, :show]
  resources :licensors, only: [:index, :show]
  resources :royalty_reports, only: [:index, :show]
  resources :giftboxes, only: [:index, :show]
  resources :dvd_customers, only: [:index, :show]
  resources :dvds, only: [:show]
  get '/import' => 'films#import_data'
  patch '/users/1' => 'films#upload'
  patch '/users/2' => 'api/royalty_reports#import'

  namespace :api do
    get '/users' => '/api/users#api_index'
    get '/users/:id' => '/api/users#show'
    post '/users' => '/api/users#api_create'
    patch '/users/:id' => '/api/users#api_update'
    delete '/users/:id' => '/api/users#api_destroy'
    resources :licensors, only: [:index, :show, :create, :update, :destroy]
    resources :films, only: [:index, :show, :create, :update, :destroy]
    resources :giftboxes, only: [:index, :show, :create, :update, :destroy]
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
