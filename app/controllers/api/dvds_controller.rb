class Api::DvdsController < AdminController

  def show
    @dvd = Dvd.find(params[:id])
    @dvd_types = DvdType.all
    @dvd_shorts = @dvd.dvd_shorts.includes(:film)
    @other_shorts = Film.shorts - @dvd_shorts.map(&:film)
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @dvd = Dvd.new(dvd_params)
    if @dvd.save
      render json: { dvd: @dvd.render_json }
    else
      render_errors(@dvd)
    end
  end

  def update
    @dvd = Dvd.find(params[:id])
    if @dvd.update(dvd_params)
      @dvd_types = DvdType.all
      @dvd_shorts = @dvd.dvd_shorts.includes(:film)
      @other_shorts = Film.shorts - @dvd_shorts.map(&:film)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@dvd)
    end
  end

  def destroy
    @dvd = Dvd.find(params[:id])
    if @dvd.destroy
      render json: @dvd, status: 200
    else
      render_errors(@dvd)
    end
  end

  def update_stock
    uploaded_io = params[:user][:file]
    original_filename = uploaded_io.original_filename
    time_started = Time.now.to_s
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    File.open(Rails.root.join('tmp', time_started, original_filename), 'wb') do |file|
      file.write(uploaded_io.read)
    end
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/#{original_filename}")
    obj.upload_file(Rails.root.join('tmp', time_started, original_filename), acl:'private')
    job = Job.create!(job_id: time_started, name: "import inventory", first_line: "Updating Stock", second_line: false)
    ImportInventory.perform_async(time_started, original_filename)
    redirect_to "/purchase_orders", flash: { inventory_import_id: job.id }
  end

  private

  def dvd_params
    result = params[:dvd].permit(:name, :upc, :price, :dvd_type_id, :feature_film_id, :stock, :repressing, :sound_config, :special_features, :discs, :units_shipped, :first_shipment, :pre_book_date, :retail_date)
    result[:upc] = result[:upc].strip if result[:upc]
    result
  end

end
