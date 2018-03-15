class Api::FilmsController < ApplicationController

  def index
    @films = Film.where(short_film: params[:shorts])
    render "index.json.jbuilder"
  end

  def show
    @films = Film.where(id: params[:id])
    @templates = DealTemplate.all
    @licensors = Licensor.all
    @revenue_streams = RevenueStream.all
    @reports = RoyaltyReport.where(film_id: params[:id])
    @film_revenue_percentages = FilmRevenuePercentage.where(film_id: params[:id])
    @rights = FilmRight.where(film_id: params[:id])
    @dvds = Dvd.where(feature_film_id: params[:id])
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
    @quotes = Quote.where(film_id: @films.first.id)
    render "show.json.jbuilder"
  end

  def create
    @film = Film.new(title: film_params[:title], label_id: 1, days_statement_due: 30, short_film: params[:short])
    if @film.save
      @films = Film.where(short_film: params[:short])
      render "index.json.jbuilder"
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
        @films = Film.where(id: params[:id])
        @film_revenue_percentages = FilmRevenuePercentage.where(film_id: params[:id])
        @dvds = Dvd.where(feature_film_id: params[:id])
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
        render "show.json.jbuilder"
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

  private

  def film_params
    result = params[:film].permit(
      :days_statement_due,
      :deal_type_id,
      :e_and_o,
      :expense_cap,
      :gr_percentage,
      :licensor_id,
      :mg,
      :royalty_notes,
      :sage_id,
      :short_film,
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
      :director,
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
      :label_id
    )
    result[:licensor_id] = nil unless params[:film][:licensor_id]
    result
  end

end
