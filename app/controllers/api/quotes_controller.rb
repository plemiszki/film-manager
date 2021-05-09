class Api::QuotesController < AdminController

  include Reorderable

  def show
    @quote = Quote.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    current_length = Quote.where(film_id: quote_params[:film_id]).length
    @quote = Quote.new(quote_params.merge({ order: current_length }))
    if @quote.save
      @quotes = Quote.where(film_id: quote_params[:film_id]).order(:order)
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: @quote.errors.full_messages, status: 422
    end
  end

  def update
    @quote = Quote.find(params[:id])
    if @quote.update(quote_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
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

  def rearrange
    params[:new_order].each do |index, id|
      quote = Quote.find(id)
      quote.update(order: index)
    end
    @quotes = Quote.where(film_id: params[:film_id]).order(:order)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def quote_params
    params[:quote].permit(:film_id, :text, :author, :publication)
  end

end
