class Api::FilmsController < AdminController

  include BookingCalculations

  class UpdateError < RuntimeError; end

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

  def auto_renew
    @films = Film.within_auto_renew_window.order(:title)
    render 'auto_renew', formats: [:json], handlers: [:jbuilder]
  end

  def auto_renew_film
    film = Film.find(params[:id])
    film.auto_renew!
    @films = Film.within_auto_renew_window.order(:title)
    render 'auto_renew', formats: [:json], handlers: [:jbuilder]
  end

  def auto_renew_all
    Film.within_auto_renew_window.each do |film|
      film.auto_renew!
    end
    @films = Film.within_auto_renew_window.order(:title)
    render 'auto_renew', formats: [:json], handlers: [:jbuilder]
  end

  def show
    gather_data_for_show_view
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @film = Film.new(film_params)
    @film.label_id = Label.find_by_name("Film Movement").id
    @film.days_statement_due = 30
    @film.title = @film.title.strip
    if @film.save
      render 'create', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@film)
    end
  end

  def update
    error_present = false
    errors = {
      film: [],
      percentages: {}
    }
    ActiveRecord::Base.transaction do
      @film = Film.find(params[:id])
      @film_revenue_percentages = @film.film_revenue_percentages
      @film.assign_attributes(film_params)
      if @film.reserve_percentage_changed? || @film.reserve_quarters_changed?
        recalculate_statements = true
      end
      @film.update(film_params)
      @film_revenue_percentages.each do |revenue_percentage|
        revenue_percentage.update(value: params[:percentages][revenue_percentage.id.to_s])
      end
      fail UpdateError if @film.errors.present? || @film_revenue_percentages.map(&:errors).any? { |errors| errors.present? }
      if recalculate_statements
        @film.royalty_reports.order(:year, :quarter).each do |report|
          report.calculate!
        end
      end
      gather_data_for_show_view
      render 'show', formats: [:json], handlers: [:jbuilder]
    end
  rescue UpdateError
    film_errors = @film.errors.as_json(full_messages: true)
    percentage_errors = @film_revenue_percentages.map(&:errors).select { |errors| errors.present? }
    percentage_errors_hashes = percentage_errors.map { |errors| { errors.instance_variable_get(:@base).id => errors.as_json(full_messages: true) } }
    percentage_errors_hash = percentage_errors_hashes.reduce({}, &:merge)
    render json: {
      errors: { film: film_errors }
        .merge(percentage_errors_hash)
        .deep_transform_keys { |k| k.to_s.camelize(:lower) }
    }, status: 422
  end

  def destroy
    @film = Film.find(params[:id])
    if @film.destroy
      RelatedFilm.where(other_film_id: @film.id).destroy_all
      render json: @film, status: 200
    else
      render_errors(@film)
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
      render json: { film: { id: film.id } }
    else
      render_errors(film)
    end
  end

  def export_xml_mec
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "export xml (mec)", first_line: "Exporting XML (MEC)", second_line: false)
    ExportXmlMec.perform_async(params[:film_id], time_started)
    render json: { job: job.render_json }
  end

  def export_xml_mmc
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "export xml (mmc)", first_line: "Exporting XML (MMC)", second_line: false)
    ExportXmlMmc.perform_async(params[:film_id], time_started)
    render json: { job: job.render_json }
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

  def update_artwork
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "update artwork", first_line: "Updating Artwork", second_line: true, current_value: 0, total_value: Film.count)
    UpdateArtwork.perform_async(time_started, params[:trigger_id])
    render json: { job: job.render_json }
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
      :auto_renew_opt_out,
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
      :fm_plus_release,
      :theatrical_release,
      :ignore_sage_id,
      :avod_tentative,
      :svod_tentative,
      :tvod_tentative,
      :theatrical_tentative,
      :fm_plus_tentative,
      :video_page,
      :now_playing_page,
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
      :contractual_obligations,
      :msrp_pre_street,
      :ppr_pre_street,
      :ppr_post_street,
      :drl_pre_street,
      :drl_post_street,
      :ppr_drl_pre_street,
      :ppr_drl_post_street,
      :msrp_pre_street_member,
      :ppr_pre_street_member,
      :ppr_post_street_member,
      :drl_pre_street_member,
      :drl_post_street_member,
      :ppr_drl_pre_street_member,
      :ppr_drl_post_street_member,
      :xml_video_filename,
      :xml_trailer_filename,
      :xml_subtitles_filename,
      :xml_caption_filename,
      :xml_include_trailer,
      :xml_include_captions,
      :xml_mmc_filename,
      :xml_mec_filename
    )
    result[:licensor_id] = nil unless params[:film][:licensor_id]
    result
  end

  def gather_data_for_show_view
    @film = Film.find(params[:id])
    @film_formats = FilmFormat.where(film_id: params[:id]).includes(:format)
    @formats = Format.where.not(id: @film_formats.map { |ff| ff.format_id })
    @bookings = Booking.where(film_id: @film.id).includes(:venue, :payments)
    @virtual_bookings = VirtualBooking.where(film_id: @film.id).includes(:venue)
    @calculations = {}
    @total_box_office = 0
    @missing_reports = 0
    @bookings.each do |booking|
      @calculations[booking.id] = booking_calculations(booking)
      if booking.theatrical?
        @total_box_office += @calculations[booking.id][:total_gross]
        @missing_reports += 1 unless booking.box_office_received
      end
    end
    @templates = DealTemplate.all
    @licensors = Licensor.all
    @revenue_streams = RevenueStream.all.order(:order)
    @reports = RoyaltyReport.where(film_id: params[:id]).order(:year, :quarter)
    @film_revenue_percentages = FilmRevenuePercentage.where(film_id: params[:id]).includes(:revenue_stream).order('revenue_streams.order')
    @rights = FilmRight.where(film_id: params[:id]).includes(:right, :territory)
    @dvds = (@film.film_type.in?(['Feature', 'TV Series']) ? Dvd.where(feature_film_id: params[:id]) : Dvd.where(id: [DvdShort.where(short_id: params[:id]).includes(:dvd).map(&:dvd_id)]))
    @dvd_types = DvdType.all
    @film_countries = FilmCountry.where(film_id: @film.id).includes(:country)
    @countries = Country.where.not(id: @film_countries.map(&:country_id))
    @film_languages = FilmLanguage.where(film_id: @film.id).includes(:language)
    all_languages = Language.all
    @languages = all_languages.filter { |language| @film_languages.map(&:language_id).include?(language.id) == false }
    @film_genres = FilmGenre.where(film_id: @film.id).includes(:genre)
    @genres = Genre.where.not(id: @film_genres.map(&:genre_id))
    @film_topics = FilmTopic.where(film_id: @film.id).includes(:topic)
    @topics = Topic.where.not(id: @film_topics.map(&:topic_id))
    @labels = Label.all
    @laurels = Laurel.where(film_id: @film.id).order(:order)
    @quotes = Quote.where(film_id: @film.id).order(:order)
    @related_films = RelatedFilm.where(film_id: @film.id)
    this_film_and_related_film_ids = ([@film.id] + @related_films.map(&:other_film_id))
    all_films = Film.all
    @other_films = all_films.reject { |f| this_film_and_related_film_ids.include?(f.id) }
    @actors = Actor.where(actorable_id: @film.id)
    @directors = Director.where(film_id: @film.id).order(:order)
    @digital_retailer_films = DigitalRetailerFilm.where(film_id: @film.id).includes(:digital_retailer)
    @digital_retailers = DigitalRetailer.all.order(:name)
    @edu_platform_films = EduPlatformFilm.where(film_id: @film.id).includes(:edu_platform)
    @edu_platforms = EduPlatform.all.order(:name)
    @schedule = create_schedule
    @sub_rights = @film.sub_rights
    @crossed_films = @film.crossed_films
    @other_crossed_films = Film.where(licensor_id: @film.licensor_id, days_statement_due: @film.days_statement_due, deal_type_id: @film.deal_type_id).reject { |f| ([@film.id] + @crossed_films.map(&:crossed_film_id)).include?(f.id) || f.film_type == 'Short' }
    if @film.film_type == 'TV Series'
      @episodes = @film.episodes
    end
    @alternate_lengths = @film.alternate_lengths
    @alternate_subs = @film.alternate_subs.includes(:language)
    @subtitle_languages = all_languages.filter { |language| @alternate_subs.map(&:language_id).include?(language.id) == false }
    @alternate_audios = @film.alternate_audios.includes(:language)
    @audio_languages = all_languages.filter { |language| @alternate_audios.map(&:language_id).include?(language.id) == false }
    @amazon_genres = AmazonGenre.all.order(:code)
    @amazon_languages = AmazonLanguage.all.order(:name)
    @amazon_genre_films = @film.amazon_genre_films.includes(:amazon_genre)
    @amazon_language_films = @film.amazon_language_films.includes(:amazon_language)
  end

  def create_schedule
    result = []
    if @film.theatrical_release
      result << { label: 'Theatrical', date_string: @film.theatrical_release.strftime("%-m/%-d/%Y"), date: @film.theatrical_release, tentative: @film.theatrical_tentative }
    end
    if @film.avod_release
      result << { label: 'AVOD', date_string: @film.avod_release.strftime("%-m/%-d/%Y"), date: @film.avod_release, tentative: @film.avod_tentative }
    end
    if @film.svod_release
      result << { label: 'SVOD', date_string: @film.svod_release.strftime("%-m/%-d/%Y"), date: @film.svod_release, tentative: @film.svod_tentative }
    end
    if @film.tvod_release
      result << { label: 'TVOD/EST', date_string: @film.tvod_release.strftime("%-m/%-d/%Y"), date: @film.tvod_release, tentative: @film.tvod_tentative }
    end
    if @film.fm_plus_release
      result << { label: 'FM Plus', date_string: @film.fm_plus_release.strftime("%-m/%-d/%Y"), date: @film.fm_plus_release, tentative: @film.fm_plus_tentative }
    end
    if @film.club_date
      result << { label: 'Club', date: @film.club_date, date_string: @film.club_date.strftime("%-m/%-d/%Y") }
    end
    @dvds.each do |dvd|
      if dvd.retail_date
        result << { label: "#{dvd.dvd_type.name} DVD", date: dvd.retail_date, date_string: dvd.retail_date.strftime("%-m/%-d/%Y") }
      end
    end
    result.sort_by { |element| element[:date] }
  end

end
