class Api::CalendarController < AdminController

  def show
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    month_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    @months = []
    12.times do |index|
      start_date = DateTime.parse("#{month_names[index]} 1 #{params[:year]}")
      end_date = DateTime.parse("#{month_names[index]} #{month_days[index]} #{params[:year]}")
      club_releases = Film.where(club_date: start_date..end_date).order(:club_date).map(&:title)
      tvod_releases = Film.where(tvod_release: start_date..end_date).order(:tvod_release).map { |film| { title: film.title, date: film.tvod_release.strftime("%-m/%-d/%y"), tentative: film.tvod_tentative } }
      svod_releases = Film.where(svod_release: start_date..end_date).order(:svod_release).map { |film| { title: film.title, date: film.svod_release.strftime("%-m/%-d/%y"), tentative: film.svod_tentative } }
      avod_releases = Film.where(avod_release: start_date..end_date).order(:avod_release).map { |film| { title: film.title, date: film.avod_release.strftime("%-m/%-d/%y"), tentative: film.avod_tentative } }
      dvd_releases = Dvd.where(retail_date: start_date..end_date).includes(:feature).order(:retail_date).map { |dvd| { title: dvd.feature.title, date: dvd.retail_date.strftime("%-m/%-d/%y") } }
      @months << {
        dvd_releases: dvd_releases,
        tvod_releases: tvod_releases,
        svod_releases: svod_releases,
        avod_releases: avod_releases,
        club_releases: club_releases
      }
    end
    render 'index.json.jbuilder'
  end

end
