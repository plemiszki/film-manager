class Api::AlternateAudiosController < ApplicationController

  def create
  end

  def destroy
    sub = AlternateAudio.find(params[:id]).destroy
    @alternate_audios = sub.film.alternate_audios
    render 'index.json.jbuilder'
  end

end
