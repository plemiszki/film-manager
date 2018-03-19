class Api::CountriesController < AdminController

  def index
    @countries = Country.all
    render "index.json.jbuilder"
  end

  def show
    @countries = Country.where(id: params[:id])
    render "index.json.jbuilder"
  end

  def create
    @country = Country.new(country_params)
    if @country.save
      @countries = Country.all
      render "index.json.jbuilder"
    else
      render json: @country.errors.full_messages, status: 422
    end
  end

  def update
    @country = Country.find(params[:id])
    if @country.update(country_params)
      @countries = Country.all
      render "index.json.jbuilder"
    else
      render json: @country.errors.full_messages, status: 422
    end
  end

  def destroy
    @country = Country.find(params[:id])
    if @country.destroy
      render json: @country, status: 200
    else
      render json: @country.errors.full_messages, status: 422
    end
  end

  private

  def country_params
    params[:country].permit(:name)
  end

end
