class Api::AlternateSubsController < ApplicationController

  def destroy
    sub = AlternateSub.find(params[:id]).destroy
    @alternate_subs = sub.film.alternate_subs
    render 'index.json.jbuilder'
  end

end
