Rails.application.routes.draw do
  root to: "films#index"
  resources :films, only: [:index, :show]
  resources :users, only: [:index, :show]

  namespace :api do
    get '/users' => '/api/users#api_index'
    post '/users' => '/api/users#api_create'
    patch '/users' => '/api/users#api_update'
    delete '/users/:id' => '/api/users#api_destroy'
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
