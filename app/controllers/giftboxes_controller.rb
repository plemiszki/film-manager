class GiftboxesController < ApplicationController

  def index
    render "index.html.erb"
  end

  def show
    @giftbox = Giftbox.find_by(id: params[:id])
    render "show.html.erb"
  end

end
