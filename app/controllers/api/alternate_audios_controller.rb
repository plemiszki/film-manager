class Api::AlternateAudiosController < ApplicationController

  def create
  end

  def destroy
    sub = AlternateAudio.find(params[:id]).destroy
    @alternate_audios = sub.film.alternate_audios
    @audio_languages = Language.where.not(id: @alternate_audios.pluck(:language_id))
    render 'index.json.jbuilder'
  end

end
