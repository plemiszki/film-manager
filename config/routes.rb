Rails.application.routes.draw do
  root to: "films#index"
  resources :films, only: [:index, :show]
  resources :users, only: [:index, :show]
end
