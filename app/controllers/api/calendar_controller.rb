class Api::CalendarController < AdminController

  def show
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    month_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    @months = []
    12.times do |index|
      start_date = DateTime.parse("#{month_names[index]} 1 #{params[:year]}")
      end_date = DateTime.parse("#{month_names[index]} #{month_days[index]} #{params[:year]}")
      club_releases = Film.where(club_date: start_date..end_date).order(:club_date).map(&:title)
      theatrical_releases = Film.where(theatrical_release: start_date..end_date).order(:theatrical_release).map { |film| { title: film.title, date: film.theatrical_release.strftime("%-m/%-d/%y"), tentative: film.theatrical_tentative } }
      tvod_releases = Film.where(tvod_release: start_date..end_date).order(:tvod_release).map { |film| { title: film.title, date: film.tvod_release.strftime("%-m/%-d/%y"), tentative: film.tvod_tentative } }
      svod_releases = Film.where(svod_release: start_date..end_date).order(:svod_release).map { |film| { title: film.title, date: film.svod_release.strftime("%-m/%-d/%y"), tentative: film.svod_tentative } }
      dvd_releases = Dvd.where(retail_date: start_date..end_date).includes(:feature).order(:retail_date).map { |dvd| { title: dvd.feature.title, date: dvd.retail_date.strftime("%-m/%-d/%y") } }
      @months << {
        theatrical_releases: theatrical_releases,
        dvd_releases: dvd_releases,
        tvod_releases: tvod_releases,
        svod_releases: svod_releases,
        club_releases: club_releases
      }
    end
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

end
