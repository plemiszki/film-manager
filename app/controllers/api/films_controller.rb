class Api::FilmsController < AdminController

  include BookingCalculations

  def index
    if params[:film_type] == 'all'
      @films = Film.all.includes(:alternate_lengths, alternate_subs: [:language], alternate_audios: [:language])
    else
      @films = Film.where(film_type: params[:film_type]).includes(:alternate_lengths, alternate_subs: [:language], alternate_audios: [:language])
    end
    @alternate_lengths = AlternateLength.all.pluck(:length).uniq
    @alternate_audios = AlternateAudio.all.includes(:language).map { |audio| audio.language.name }.uniq
    @alternate_subs = AlternateSub.all.includes(:language).map { |altsub| altsub.language.name }.uniq
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    gather_data_for_show_view
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @film = Film.new(film_params)
    @film.label_id = Label.find_by_name("Film Movement").id
    @film.days_statement_due = 30
    if @film.save
      render 'create', formats: [:json], handlers: [:jbuilder]
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
        @film.assign_attributes(film_params)
        if @film.reserve_percentage_changed? || @film.reserve_quarters_changed?
          recalculate_statements = true
        end
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
        if recalculate_statements
          @film.royalty_reports.order(:year, :quarter).each do |report|
            report.calculate!
          end
        end
        gather_data_for_show_view
        render 'show', formats: [:json], handlers: [:jbuilder]
      end
    rescue
      render json: errors, status: 422
    end
  end

  def destroy
    @film = Film.find(params[:id])
    if @film.destroy
      RelatedFilm.where(other_film_id: @film.id).destroy_all
      render json: @film, status: 200
    else
      render json: @film.errors.full_messages, status: 422
    end
  end

  def copy
    original_film = Film.find(params[:copy_from_id])
    film = Film.new(
      title: params[:title],
      film_type: params[:film_type],
      year: params[:year],
      length: params[:length],
      label_id: original_film.label_id,
      days_statement_due: original_film.days_statement_due,
      licensor_id: original_film.licensor_id,
      deal_type_id: original_film.deal_type_id,
      gr_percentage: original_film.gr_percentage,
      mg: original_film.mg,
      e_and_o: original_film.e_and_o,
      expense_cap: original_film.expense_cap,
      reserve: original_film.reserve,
      reserve_percentage: original_film.reserve_percentage,
      reserve_quarters: original_film.reserve_quarters,
      sell_off_period: original_film.sell_off_period,
      auto_renew: original_film.auto_renew,
      auto_renew_term: original_film.auto_renew_term,
      start_date: original_film.start_date,
      end_date: original_film.end_date
    )
    if film.save
      original_film_rights = original_film.film_rights
      original_film_rights.each do |film_right|
        FilmRight.create!(film_id: film.id, right_id: film_right.right_id, territory_id: film_right.territory_id, start_date: film_right.start_date, end_date: film_right.end_date, exclusive: film_right.exclusive)
      end
      unless film.film_type == 'Short'
        original_film_percentages = original_film.film_revenue_percentages
        original_film_percentages.each do |percentage|
          new_percentage = FilmRevenuePercentage.find_by(film_id: film.id, revenue_stream_id: percentage.revenue_stream_id)
          new_percentage.update!(value: percentage.value)
        end
      end
      render json: film.id
    else
      render json: film.errors.full_messages, status: 422
    end
  end

  def export
    if params[:film_ids]
      film_ids = params[:film_ids].to_a.map(&:to_i)
    else
      search_criteria = params[:search_criteria]
      film_ids_result = []

      if search_criteria[:rights_operator] == 'AND' && search_criteria[:territories_operator] == 'AND'
        rights_hash = Hash.new { |h, k| h[k] = {} }
        search_criteria[:selected_rights].each do |right_id|
          search_criteria[:selected_territories].each do |territory_id|
            film_rights = FilmRight.where({ right_id: right_id, territory_id: territory_id })
            film_rights = filter_by_dates(film_rights, search_criteria, right_id)
            rights_hash[right_id][territory_id] = film_rights.map(&:film_id).uniq
          end
        end
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
      elsif search_criteria[:rights_operator] == 'AND' && search_criteria[:territories_operator] == 'OR'
        rights_hash = Hash.new { |h, k| h[k] = {} }
        search_criteria[:selected_rights].each do |right_id|
          film_rights = FilmRight.where({ right_id: right_id, territory_id: search_criteria[:selected_territories] })
          film_rights = filter_by_dates(film_rights, search_criteria, right_id)
          rights_hash[right_id] = film_rights.map(&:film_id).uniq
        end
        populated_starting_array = false
        rights_hash.each do |right_id, film_ids|
          if populated_starting_array
            film_ids_result = film_ids_result & film_ids
          else
            film_ids_result = film_ids
            populated_starting_array = true
          end
        end
      elsif search_criteria[:rights_operator] == 'OR' && search_criteria[:territories_operator] == 'AND'
        rights_hash = Hash.new { |h, k| h[k] = {} }
        search_criteria[:selected_rights].each do |right_id|
          search_criteria[:selected_territories].each do |territory_id|
            film_rights = FilmRight.where({ right_id: right_id, territory_id: territory_id })
            film_rights = filter_by_dates(film_rights, search_criteria, right_id)
            rights_hash[right_id][territory_id] = film_rights.map(&:film_id).uniq
          end
        end
        film_ids_result = []
        rights_hash.each do |right_id, territories_hash|
          right_film_ids = []
          territories_hash.each do |territory_id, film_ids|
            right_film_ids = (right_film_ids.empty? ? film_ids : (right_film_ids & film_ids))
          end
          film_ids_result = (film_ids_result.empty? ? right_film_ids : (film_ids_result | right_film_ids))
        end
      elsif search_criteria[:rights_operator] == 'OR' && search_criteria[:territories_operator] == 'OR'
        rights_hash = Hash.new { |h, k| h[k] = {} }
        search_criteria[:selected_rights].each do |right_id|
          film_rights = FilmRight.where({ right_id: right_id, territory_id: search_criteria[:selected_territories] })
          film_rights = filter_by_dates(film_rights, search_criteria, right_id)
          rights_hash[right_id] = film_rights.map(&:film_id).uniq
        end
        populated_starting_array = false
        rights_hash.each do |right_id, film_ids|
          if populated_starting_array
            film_ids_result = film_ids_result | film_ids
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
    ExportFilms.perform_async(film_ids, time_started, search_criteria.to_json)
    render json: { job: job.render_json }
  end

  def catalog
    uploaded_io = params[:user][:spreadsheet]
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
    obj.upload_file(Rails.root.join('tmp', time_started, original_filename), acl: 'private')
    job = Job.create!(job_id: time_started, name: "export catalog", first_line: "Reading Spreadsheet", second_line: false, current_value: 0, total_value: 0)
    ExportCatalog.perform_async(original_filename, time_started)
    redirect_to "/catalog", flash: { job_id: job.id }
  end

  def update_artwork
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "update artwork", first_line: "Updating Artwork", second_line: true, current_value: 0, total_value: Film.count)
    UpdateArtwork.perform_async(time_started, params[:trigger_id])
    render json: job.render_json
  end

  private

  def filter_by_dates(film_rights, search_criteria, right_id)
    result = film_rights.where('(start_date <= ? OR start_date IS NULL) AND (end_date_calc >= ? OR end_date_calc IS NULL)', search_criteria[:start_date], search_criteria[:end_date])
    if right_id == "12"
      films_with_sell_off_period = Film.where.not(sell_off_period: 0)
      films_with_sell_off_period.each do |film|
        more_rights = film_rights.where('(start_date <= ? OR start_date IS NULL) AND (end_date_calc >= ? OR end_date_calc IS NULL)', search_criteria[:start_date], (Date.strptime(search_criteria[:end_date], "%m/%d/%y") - film.sell_off_period.months))
        result = (result | more_rights)
      end
    end
    result
  end

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
      :auto_renew_days_notice,
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
      :critics_pick,
      :imdb_id,
      :accept_delivery,
      :day_and_date,
      :rental_url,
      :rental_price,
      :rental_days,
      :tv_rating,
      :contractual_obligations
    )
    result[:licensor_id] = nil unless params[:film][:licensor_id]
    result
  end

  def gather_data_for_show_view
    @films = Film.where(id: params[:id])
    film = @films.first
    @film_formats = FilmFormat.where(film_id: params[:id]).includes(:format)
    @formats = Format.where.not(id: @film_formats.map { |ff| ff.format_id })
    @bookings = Booking.where(film_id: film.id).includes(:venue, :payments)
    @virtual_bookings = VirtualBooking.where(film_id: film.id).includes(:venue)
    @calculations = {}
    @bookings.each do |booking|
      @calculations[booking.id] = booking_calculations(booking)
    end
    @templates = DealTemplate.all
    @licensors = Licensor.all
    @revenue_streams = RevenueStream.all
    @reports = RoyaltyReport.where(film_id: params[:id])
    @film_revenue_percentages = FilmRevenuePercentage.where(film_id: params[:id])
    @rights = FilmRight.where(film_id: params[:id]).includes(:right, :territory)
    @dvds = (film.film_type.in?(['Feature', 'TV Series']) ? Dvd.where(feature_film_id: params[:id]) : Dvd.where(id: [DvdShort.where(short_id: params[:id]).includes(:dvd).map(&:dvd_id)]))
    @dvd_types = DvdType.where.not(id: @dvds.map(&:dvd_type_id))
    @film_countries = FilmCountry.where(film_id: film.id).includes(:country)
    @countries = Country.where.not(id: @film_countries.map(&:country_id))
    @film_languages = FilmLanguage.where(film_id: film.id).includes(:language)
    all_languages = Language.all
    @languages = all_languages.filter { |language| @film_languages.map(&:language_id).include?(language.id) == false }
    @film_genres = FilmGenre.where(film_id: film.id).includes(:genre)
    @genres = Genre.where.not(id: @film_genres.map(&:genre_id))
    @film_topics = FilmTopic.where(film_id: film.id).includes(:topic)
    @topics = Topic.where.not(id: @film_topics.map(&:topic_id))
    @labels = Label.all
    @laurels = Laurel.where(film_id: film.id).order(:order)
    @quotes = Quote.where(film_id: film.id).order(:order)
    @related_films = RelatedFilm.where(film_id: film.id)
    this_film_and_related_film_ids = ([film.id] + @related_films.map(&:other_film_id))
    all_films = Film.all
    @other_films = all_films.reject { |f| this_film_and_related_film_ids.include?(f.id) }
    @actors = Actor.where(actorable_id: film.id)
    @directors = Director.where(film_id: film.id)
    @digital_retailer_films = DigitalRetailerFilm.where(film_id: film.id).includes(:digital_retailer)
    @digital_retailers = DigitalRetailer.all
    @edu_platform_films = EduPlatformFilm.where(film_id: film.id).includes(:edu_platform)
    @edu_platforms = EduPlatform.all
    @schedule = create_schedule
    @sub_rights = film.sub_rights
    @crossed_films = film.crossed_films
    @other_crossed_films = Film.where(licensor_id: film.licensor_id, days_statement_due: film.days_statement_due, deal_type_id: film.deal_type_id).reject { |f| ([film.id] + @crossed_films.map(&:crossed_film_id)).include?(f.id) || f.film_type == 'Short' }
    if film.film_type == 'TV Series'
      @episodes = film.episodes
    end
    @alternate_lengths = film.alternate_lengths
    @alternate_subs = film.alternate_subs.includes(:language)
    @subtitle_languages = all_languages.filter { |language| @alternate_subs.map(&:language_id).include?(language.id) == false }
    @alternate_audios = film.alternate_audios.includes(:language)
    @audio_languages = all_languages.filter { |language| @alternate_audios.map(&:language_id).include?(language.id) == false }
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
