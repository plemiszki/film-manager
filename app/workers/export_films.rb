class ExportFilms
  include Sidekiq::Worker
  include ActionView::Helpers::NumberHelper

  sidekiq_options retry: false

  def perform(film_ids, time_started, search_criteria)
    job = Job.find_by_job_id(time_started)

    headers = [
      'Title',
      'Licensor',
      'Date Signed',
      'Expiration',
      'Label',
      'Production Year',
      'Synopsis',
      'Short Synopsis',
      'VOD Synopsis',
      'Logline',
      'Festival Pedigree',
      'Length',
      'Director(s)',
      'Cast',
      'Countries',
      'Languages',
      'Alternate Audio Tracks',
      'Genres',
      'Topics',
      'Retail DVD Price',
      'Retail DVD Street Date',
      'Retail DVD UPC',
      'Retail DVD Stock',
      'Blu-ray Price',
      'Blu-ray Street Date',
      'Blu-ray UPC',
      'Blu-ray Stock',
      'Auto Renew',
      'Auto Renew Term',
      'Auto Renew Days Notice',
      'TV Rating',
      'IMDB ID',
      'FM Plus URL',
      'Vimeo Trailer URL',
      'YouTube Trailer URL',
      'ProRes Trailer URL',
    ]

    if search_criteria != 'null'
      search_criteria = JSON.parse(search_criteria)
      search_criteria["selected_territories"].each do |territory_id|
        territory_name = Territory.find(territory_id).name
        search_criteria["selected_rights"].each do |right_id|
          right_name = Right.find(right_id).name
          headers << "#{territory_name} - #{right_name}"
        end
      end
    end

    films = Film.where(id: film_ids).order(:title).includes(:licensor, :label, :laurels, :film_rights)
    rows = films.map do |film|
      retail_dvd = Dvd.find_by({ feature_film_id: film.id, dvd_type_id: 1 })
      blu_ray    = Dvd.find_by({ feature_film_id: film.id, dvd_type_id: 6 })

      row = [
        film.title,
        film.licensor ? film.licensor.name : '',
        film.start_date ? film.start_date.strftime("%-m/%-d/%Y") : '',
        film.end_date ? film.end_date.strftime("%-m/%-d/%Y") : '',
        film.proper_label_name,
        film.year,
        film.synopsis,
        film.short_synopsis,
        film.vod_synopsis,
        film.logline,
        film.laurels.map(&:string).join("\n"),
        "#{film.length} min",
        film.directors.map(&:full_name).join(", "),
        film.actors.map(&:full_name).join(", "),
        film.countries.map(&:name).join(", "),
        film.languages.map(&:name).join(", "),
        film.alternate_audios.map { |alternate_audio| alternate_audio.language.name }.join(", "),
        film.genres.map(&:name).join(", "),
        film.topics.map(&:name).join(", "),
        retail_dvd ? "$#{number_with_precision(retail_dvd.price, precision: 2, delimiter: ',')}" : 'n/a',
        (retail_dvd && retail_dvd.retail_date) ? retail_dvd.retail_date.strftime("%-m/%-d/%Y") : 'n/a',
        retail_dvd ? retail_dvd.upc : 'n/a',
        retail_dvd ? retail_dvd.stock : 'n/a',
        blu_ray ? "$#{number_with_precision(blu_ray.price, precision: 2, delimiter: ',')}" : 'n/a',
        (blu_ray && blu_ray.retail_date) ? blu_ray.retail_date.strftime("%-m/%-d/%Y") : 'n/a',
        blu_ray ? blu_ray.upc : 'n/a',
        blu_ray ? blu_ray.stock : 'n/a',
        film.auto_renew ? 'Yes' : 'No',
        film.auto_renew ? film.auto_renew_term : '',
        film.auto_renew ? film.auto_renew_days_notice : '',
        film.tv_rating,
        film.imdb_id,
        film.fm_plus_url,
        film.vimeo_trailer,
        film.youtube_trailer,
        film.prores_trailer,
      ]

      if search_criteria != 'null'
        search_criteria["selected_territories"].each do |territory_id|
          search_criteria["selected_rights"].each do |right_id|
            film_right = FilmRight.find_by({ right_id: right_id, territory_id: territory_id, film_id: film.id })
            value = film_right ? (film_right.exclusive ? 'Exclusive' : 'Non-Exclusive') : 'NOT LICENSED'
            sub_rights = SubRight.where(right_id: right_id, territory_id: territory_id, film_id: film.id).where("end_date > ?", search_criteria["start_date"]).where("start_date < ?", search_criteria["end_date"])
            sub_rights.each do |sub_right|
              value += "\n#{sub_right.sublicensor.name}: #{sub_right.start_date.strftime("%-m/%-d/%Y")} - #{sub_right.end_date.strftime("%-m/%-d/%Y")} (#{sub_right.exclusive ? 'E' : 'NE'})"
            end
            row << value
          end
        end
      end

      row
    end

    public_url = ExportAndUploadSpreadsheet.new(
      headers:  headers,
      rows:     rows,
      job:      job,
      filename: 'films.xlsx'
    ).call

    job.update!({ status: 'success', metadata: { url: public_url } })
  end
end
