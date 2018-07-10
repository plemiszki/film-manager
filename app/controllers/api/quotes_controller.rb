class Api::QuotesController < AdminController

  include Reorderable

  def show
    @quotes = Quote.where(id: params[:id]).order(:order)
    render "show.json.jbuilder"
  end

  def create
    current_length = Quote.where(film_id: quote_params[:film_id]).length
    @quote = Quote.new(quote_params.merge({ order: current_length }))
    if @quote.save
      @quotes = Quote.where(film_id: quote_params[:film_id]).order(:order)
      render "show.json.jbuilder"
    else
      render json: @quote.errors.full_messages, status: 422
    end
  end

  def update
    @quote = Quote.find(params[:id])
    if @quote.update(quote_params)
      @quotes = Quote.where(film_id: quote_params[:film_id]).order(:order)
      render "show.json.jbuilder"
    else
      render json: @quote.errors.full_messages, status: 422
    end
  end

  def destroy
    @quote = Quote.find(params[:id])
    @quote.destroy
    reorder(Quote.where(film_id: @quote.film_id).order(:order))
    render json: @quote, status: 200
  end

  private

  def quote_params
    params[:quote].permit(:film_id, :text, :author, :publication)
  end

end
