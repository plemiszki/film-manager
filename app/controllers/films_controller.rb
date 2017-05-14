class FilmsController < ApplicationController

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
    admin_io = params[:user][:admin_file]
    time_started = Time.now.to_s
    # upload files to server
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    File.open(Rails.root.join('tmp', time_started, films_io.original_filename), 'wb') do |file|
      file.write(films_io.read)
    end
    File.open(Rails.root.join('tmp', time_started, admin_io.original_filename), 'wb') do |file|
      file.write(admin_io.read)
    end
    # upload files to S3
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    films_obj = bucket.object("#{time_started}/Films.txt")
    films_obj.upload_file(Rails.root.join('tmp', time_started, 'Films.txt'), acl:'private')
    admin_obj = bucket.object("#{time_started}/Admin.txt")
    admin_obj.upload_file(Rails.root.join('tmp', time_started, 'Admin.txt'), acl:'private')
    # start worker
    # ImportData.perform_async(time_started)
    render "index.html.erb"
  end

end
