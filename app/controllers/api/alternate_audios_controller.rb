class Api::AlternateAudiosController < ApplicationController

  def create
    alternate_audio = AlternateAudio.new(alternate_audio_params)
    if alternate_audio.save!
      @alternate_audios = alternate_audio.film.alternate_audios
      @audio_languages = Language.where.not(id: @alternate_audios.pluck(:language_id))
      render 'index.json.jbuilder'
    else
      render json: alternate_audio.errors.full_messages, status: 422
    end
  end

  def destroy
    audio = AlternateAudio.find(params[:id]).destroy
    @alternate_audios = audio.film.alternate_audios
    @audio_languages = Language.where.not(id: @alternate_audios.pluck(:language_id))
    render 'index.json.jbuilder'
  end

  private

  def alternate_audio_params
    params.require(:alternate_audio).permit(:film_id, :language_id)
  end

end
