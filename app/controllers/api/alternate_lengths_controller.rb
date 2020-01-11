class Api::AlternateLengthsController < ApplicationController

  def destroy
    length = AlternateLength.find(params[:id]).destroy
    @alternate_lengths = length.film.alternate_lengths
    render 'index.json.jbuilder'
  end

end
