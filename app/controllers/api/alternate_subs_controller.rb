class Api::AlternateSubsController < ApplicationController

  def create
    alternate_sub = AlternateSub.new(alternate_sub_params)
    if alternate_sub.save!
      @alternate_subs = alternate_sub.film.alternate_subs
      @subtitle_languages = Language.where.not(id: @alternate_subs.pluck(:language_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: alternate_sub.errors.full_messages, status: 422
    end
  end

  def destroy
    sub = AlternateSub.find(params[:id]).destroy
    @alternate_subs = sub.film.alternate_subs
    @subtitle_languages = Language.where.not(id: @alternate_subs.pluck(:language_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def alternate_sub_params
    params.require(:alternate_sub).permit(:film_id, :language_id)
  end

end
