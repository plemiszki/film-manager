Rails.application.routes.draw do
  root to: "films#index"
  resources :films, only: [:index, :show]
  resources :users, only: [:index, :show]

  # Clearance ------------------------
  get "/sign_in" => "clearance/sessions#new", as: "sign_in"
  delete "/sign_out" => "clearance/sessions#destroy", as: "sign_out"
  # ----------------------------------
end
