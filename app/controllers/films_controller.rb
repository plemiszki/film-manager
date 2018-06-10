class FilmsController < AdminController

  def index
    render "index.html.erb"
  end

  def show
    @film = Film.find_by(id: params[:id])
    render "show.html.erb"
  end

  def import_data
    render "import.html.erb"
  end

  def upload
    films_io = params[:user][:films_file]
    # theaters_io = params[:user][:theaters_file]
    admin_io = params[:user][:admin_file]
    # bookings_io = params[:user][:bookings_file]
    formats_io = params[:user][:formats_file]
    time_started = Time.now.to_s
    # upload files to server
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    File.open(Rails.root.join('tmp', time_started, films_io.original_filename), 'wb') do |file|
      file.write(films_io.read)
    end
    # File.open(Rails.root.join('tmp', time_started, theaters_io.original_filename), 'wb') do |file|
    #   file.write(theaters_io.read)
    # end
    File.open(Rails.root.join('tmp', time_started, admin_io.original_filename), 'wb') do |file|
      file.write(admin_io.read)
    end
    # File.open(Rails.root.join('tmp', time_started, bookings_io.original_filename), 'wb') do |file|
    #   file.write(bookings_io.read)
    # end
    File.open(Rails.root.join('tmp', time_started, formats_io.original_filename), 'wb') do |file|
      file.write(formats_io.read)
    end
    # upload files to S3
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    films_obj = bucket.object("#{time_started}/Films.txt")
    films_obj.upload_file(Rails.root.join('tmp', time_started, 'Films.txt'), acl:'private')
    # theaters_obj = bucket.object("#{time_started}/Theaters.txt")
    # theaters_obj.upload_file(Rails.root.join('tmp', time_started, 'Theaters.txt'), acl:'private')
    admin_obj = bucket.object("#{time_started}/Admin.txt")
    admin_obj.upload_file(Rails.root.join('tmp', time_started, 'Admin.txt'), acl:'private')
    # bookings_obj = bucket.object("#{time_started}/Bookings.txt")
    # bookings_obj.upload_file(Rails.root.join('tmp', time_started, 'Bookings.txt'), acl:'private')
    formats_obj = bucket.object("#{time_started}/Formats.txt")
    formats_obj.upload_file(Rails.root.join('tmp', time_started, 'Formats.txt'), acl:'private')
    # start worker
    ImportData.perform_async(time_started)
    redirect_to "/films"
  end

end
