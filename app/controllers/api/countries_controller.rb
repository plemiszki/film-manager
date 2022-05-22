class Api::CountriesController < AdminController

  def index
    @countries = Country.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @country = Country.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @country = Country.new(country_params)
    if @country.save
      @countries = Country.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@country)
    end
  end

  def update
    @country = Country.find(params[:id])
    if @country.update(country_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@country)
    end
  end

  def destroy
    @country = Country.find(params[:id])
    if @country.destroy
      render json: @country, status: 200
    else
      render_errors(@country)
    end
  end

  private

  def country_params
    params[:country].permit(:name)
  end

end
