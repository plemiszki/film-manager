class Api::MerchandiseTypesController < AdminController

  def index
    @merchandise_types = MerchandiseType.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @merchandise_type = MerchandiseType.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @merchandise_type = MerchandiseType.new(merchandise_type_params)
    if @merchandise_type.save
      @merchandise_types = MerchandiseType.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: @merchandise_type.errors.full_messages, status: 422
    end
  end

  def update
    @merchandise_type = MerchandiseType.find(params[:id])
    if @merchandise_type.update(merchandise_type_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render json: @merchandise_type.errors.full_messages, status: 422
    end
  end

  def destroy
    @merchandise_type = MerchandiseType.find(params[:id])
    if @merchandise_type.destroy
      render json: @merchandise_type, status: 200
    else
      render json: @merchandise_type.errors.full_messages, status: 422
    end
  end

  private

  def merchandise_type_params
    params[:merchandise_type].permit(:name)
  end

end
