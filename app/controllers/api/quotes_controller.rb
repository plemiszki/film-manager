class Api::QuotesController < ApplicationController

  def show
    @quotes = Quote.where(id: params[:id])
    render "show.json.jbuilder"
  end

  def create
    @quote = Quote.new(quote_params)
    if @quote.save
      @quotes = Quote.all
      render "show.json.jbuilder"
    else
      render json: @quote.errors.full_messages, status: 422
    end
  end

  def update
    @quote = Quote.find(params[:id])
    if @quote.update(quote_params)
      @quotes = Quote.all
      render "show.json.jbuilder"
    else
      render json: @quote.errors.full_messages, status: 422
    end
  end

  def destroy
    @quote = Quote.find(params[:id])
    if @quote.destroy
      render json: @quote, status: 200
    else
      render json: @quote.errors.full_messages, status: 422
    end
  end

  private

  def quote_params
    params[:quote].permit(:film_id, :text, :author, :publication)
  end

end
