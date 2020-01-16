class Api::AlternateSubsController < ApplicationController

  def destroy
    sub = AlternateSub.find(params[:id]).destroy
    @alternate_subs = sub.film.alternate_subs
    @subtitle_languages = Language.where.not(id: @alternate_subs.pluck(:language_id))
    render 'index.json.jbuilder'
  end

end
