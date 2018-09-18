class Api::FilmsController < AdminController

  def index
    @films = Film.where(film_type: (params[:film_type]))
    render 'index.json.jbuilder'
  end

  def show
    gather_data_for_show_view
    render 'show.json.jbuilder'
  end

  def create
    @film = Film.new(title: params[:title], label_id: 1, days_statement_due: 30, film_type: params[:film_type], year: params[:year], length: params[:length])
    if @film.save
      @films = Film.where(film_type: params[:film_type])
      render 'index.json.jbuilder'
    else
      render json: @film.errors.full_messages, status: 422
    end
  end

  def update
    error_present = false
    errors = {
      film: [],
      percentages: {}
    }
    begin
      ActiveRecord::Base.transaction do
        @film = Film.find(params[:id])
        unless @film.update(film_params)
          error_present = true
          errors[:film] = @film.errors.full_messages
        end
        FilmRevenuePercentage.where(film_id: params[:id]).each do |revenue_percentage|
          unless revenue_percentage.update(value: params[:percentages][revenue_percentage.id.to_s])
            error_present = true
            errors[:percentages][revenue_percentage.id] = revenue_percentage.errors.full_messages
          end
        end
        fail if error_present
        gather_data_for_show_view
        render 'show.json.jbuilder'
      end
    rescue
      render json: errors, status: 422
    end
  end

  def destroy
    @film = Film.find(params[:id])
    if @film.destroy
      render json: @film, status: 200
    else
      render json: @film.errors.full_messages, status: 422
    end
  end

  def export
    if params[:film_ids]
      film_ids = params[:film_ids].to_a.map(&:to_i)
    else
      search_criteria = params[:search_criteria]
      rights_hash = Hash.new { |h, k| h[k] = {} }
      search_criteria[:selected_rights].each do |right_id|
        search_criteria[:selected_territories].each do |territory_id|
          where_object = { right_id: right_id, territory_id: territory_id }
          if search_criteria[:exclusive] == 'true'
            where_object[:exclusive] = true
          end
          film_rights = FilmRight.where(where_object)
          if !search_criteria[:start_date].empty? && !search_criteria[:end_date].empty?
            film_rights = film_rights.where('(start_date <= ? OR start_date IS NULL) AND (end_date >= ? OR end_date IS NULL)', search_criteria[:start_date], search_criteria[:end_date])
          elsif !search_criteria[:start_date].empty?
            film_rights = film_rights.where('start_date <= ? OR start_date IS NULL', search_criteria[:start_date])
          elsif !search_criteria[:end_date].empty?
            film_rights = film_rights.where('end_date >= ? OR end_date IS NULL', search_criteria[:end_date])
          end
          rights_hash[right_id][territory_id] = film_rights.pluck(:film_id).uniq
        end
      end
      film_ids_result = []
      populated_starting_array = false
      rights_hash.each do |right_id, territories_hash|
        territories_hash.each do |territory_id, film_ids|
          if populated_starting_array
            film_ids_result = film_ids_result & film_ids
          else
            film_ids_result = film_ids
            populated_starting_array = true
          end
        end
      end
      film_ids = Film.where(id: film_ids_result, film_type: params[:film_type]).pluck(:id)
    end
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "export films", first_line: "Exporting Metadata", second_line: true, current_value: 0, total_value: film_ids.length)
    ExportFilms.perform_async(film_ids, time_started, search_criteria)
    render json: job
  end

  def catalog
    film_ids = params[:film_ids].to_a.map(&:to_i)
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "export catalog", first_line: "Exporting Catalog", second_line: true, current_value: 0, total_value: film_ids.length)
    ExportCatalog.perform_async(film_ids, time_started)
    render json: job
  end

  def update_artwork
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "update artwork", first_line: "Updating Artwork", second_line: true, current_value: 0, total_value: Film.count)
    UpdateArtwork.perform_async(time_started, params[:trigger_id])
    render json: job
  end

  private

  def film_params
    result = params[:film].permit(
      :days_statement_due,
      :start_date,
      :end_date,
      :deal_type_id,
      :e_and_o,
      :expense_cap,
      :gr_percentage,
      :licensor_id,
      :mg,
      :royalty_notes,
      :sage_id,
      :film_type,
      :title,
      :send_reports,
      :export_reports,
      :reserve,
      :reserve_percentage,
      :reserve_quarters,
      :sell_off_period,
      :auto_renew,
      :auto_renew_term,
      :year,
      :length,
      :synopsis,
      :short_synopsis,
      :vod_synopsis,
      :logline,
      :institutional_synopsis,
      :vimeo_trailer,
      :youtube_trailer,
      :prores_trailer,
      :standalone_site,
      :facebook_link,
      :twitter_link,
      :instagram_link,
      :active,
      :label_id,
      :club_date,
      :avod_release,
      :svod_release,
      :tvod_release,
      :theatrical_release,
      :ignore_sage_id,
      :avod_tentative,
      :svod_tentative,
      :tvod_tentative,
      :theatrical_tentative,
      :video_page,
      :edu_page,
      :fm_plus_url,
      :aspect_ratio,
      :rating,
      :sound_config,
      :certified_fresh,
      :critics_pick
    )
    result[:licensor_id] = nil unless params[:film][:licensor_id]
    result
  end

  def gather_data_for_show_view
    @films = Film.where(id: params[:id])
    @film_formats = FilmFormat.where(film_id: params[:id])
    @formats = Format.where.not(id: @film_formats.map { |ff| ff.format_id })
    @bookings = Booking.where(film_id: @films.first.id).includes(:venue)
    @templates = DealTemplate.all
    @licensors = Licensor.all
    @revenue_streams = RevenueStream.all
    @reports = RoyaltyReport.where(film_id: params[:id])
    @film_revenue_percentages = FilmRevenuePercentage.where(film_id: params[:id])
    @rights = FilmRight.where(film_id: params[:id]).includes(:right, :territory)
    @dvds = (@films.first.film_type == 'Feature' ? Dvd.where(feature_film_id: params[:id]) : Dvd.where(id: [DvdShort.where(short_id: params[:id]).includes(:dvd).map(&:dvd_id)]))
    @dvd_types = DvdType.where.not(id: @dvds.pluck(:dvd_type_id))
    @film_countries = FilmCountry.where(film_id: @films.first.id).includes(:country)
    @countries = Country.where.not(id: @film_countries.pluck(:country_id))
    @film_languages = FilmLanguage.where(film_id: @films.first.id).includes(:language)
    @languages = Language.where.not(id: @film_languages.pluck(:language_id))
    @film_genres = FilmGenre.where(film_id: @films.first.id).includes(:genre)
    @genres = Genre.where.not(id: @film_genres.pluck(:genre_id))
    @film_topics = FilmTopic.where(film_id: @films.first.id).includes(:topic)
    @topics = Topic.where.not(id: @film_topics.pluck(:topic_id))
    @labels = Label.all
    @laurels = Laurel.where(film_id: @films.first.id).order(:order)
    @quotes = Quote.where(film_id: @films.first.id).order(:order)
    @related_films = RelatedFilm.where(film_id: @films.first.id).includes(:other_film)
    @other_films = Film.where.not(id: ([@films.first.id] + @related_films.pluck(:other_film_id)))
    @actors = Actor.where(film_id: @films.first.id)
    @directors = Director.where(film_id: @films.first.id)
    @digital_retailer_films = DigitalRetailerFilm.where(film_id: @films.first.id).includes(:digital_retailer)
    @digital_retailers = DigitalRetailer.all
    @schedule = create_schedule
    @sub_rights = @films.first.sub_rights
  end

  def create_schedule
    result = []
    film = @films.first
    if film.theatrical_release
      result << { label: 'Theatrical', date: film.theatrical_release.strftime("%-m/%-d/%y"), tentative: film.theatrical_tentative }
    end
    if film.avod_release
      result << { label: 'AVOD', date: film.avod_release.strftime("%-m/%-d/%y"), tentative: film.avod_tentative }
    end
    if film.svod_release
      result << { label: 'SVOD', date: film.svod_release.strftime("%-m/%-d/%y"), tentative: film.svod_tentative }
    end
    if film.tvod_release
      result << { label: 'TVOD/EST', date: film.tvod_release.strftime("%-m/%-d/%y"), tentative: film.tvod_tentative }
    end
    if film.club_date
      result << { label: 'Club', date: film.club_date.strftime("%-m/%-d/%y") }
    end
    @dvds.each do |dvd|
      if dvd.retail_date
        result << { label: "#{dvd.dvd_type.name} DVD", date: dvd.retail_date.strftime("%-m/%-d/%y") }
      end
    end
    result
  end

end
