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
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    File.open(Rails.root.join('tmp', time_started, films_io.original_filename), 'wb') do |file|
      file.write(films_io.read)
    end
    File.open(Rails.root.join('tmp', time_started, admin_io.original_filename), 'wb') do |file|
      file.write(admin_io.read)
    end
    ImportData.perform_async(time_started)
    render "index.html.erb"
  end

end
