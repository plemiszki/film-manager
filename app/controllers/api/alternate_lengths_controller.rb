class Api::AlternateLengthsController < ApplicationController

  def create
    alternate_length = AlternateLength.new(alternate_length_params)
    if alternate_length.save
      @alternate_lengths = alternate_length.film.alternate_lengths
      render 'index.json.jbuilder'
    else
      render json: alternate_length.errors.full_messages, status: 422
    end
  end

  def destroy
    length = AlternateLength.find(params[:id]).destroy
    @alternate_lengths = length.film.alternate_lengths
    render 'index.json.jbuilder'
  end

  private

  def alternate_length_params
    params.require(:alternate_length).permit(:length, :film_id)
  end

end
