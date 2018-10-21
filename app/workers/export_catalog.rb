class ExportCatalog
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(original_filename, time_started)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/#{original_filename}")
    object.get(response_target: Rails.root.join("tmp/#{time_started}/#{original_filename}"))

    require 'roo'
    xlsx = Roo::Spreadsheet.open(Rails.root.join("tmp/#{time_started}/#{original_filename}").to_s)
    sheet = xlsx.sheet(0)
    index = 2
    job.update!(first_line: "Reading Spreadsheet", second_line: true, current_value: 0, total_value: xlsx.last_row)
    film_ids = []
    while index <= xlsx.last_row
      columns = sheet.row(index)
      film = Film.find_by_title(columns[0])
      film_ids << film.id if film

      index += 1
      job.update!(current_value: index)
    end

    require 'caracal'
    file_path = "/tmp/#{time_started}/catalog.docx"
    document = Caracal::Document.save(file_path) do |docx|
      films = Film.where(id: film_ids).order(:title).includes(:countries, :languages)
      films.each_with_index do |film, film_index|
        film_country = film.film_countries.order(:order).first
        country_name = film_country ? film_country.country.name : ''
        film_language = film.film_languages.order(:order).first
        film_genre = film.film_genres.order(:order).first
        language_name = film_language ? film_language.language.name : ''
        genre_name = film_genre ? film_genre.genre.name : ''
        laurels = film.laurels

        c1 = Caracal::Core::Models::TableCellModel.new margins: { top: 0, bottom: 100, left: 0, right: 0 } do
          if film.artwork_url && !film.artwork_url.empty?
            img film.artwork_url, width: 200, height: 280
          else
            img 'https://film-movement.herokuapp.com/black.jpg', width: 200, height: 280
          end
        end
        c2 = Caracal::Core::Models::TableCellModel.new margins: { top: 0, bottom: 100, left: 0, right: 0 } do
          h2 film.title
          p "#{country_name} | #{language_name} | #{genre_name} | #{film.length} min"
          p
          unless laurels.empty?
            laurels.each do |laurel|
              p laurel.string
            end
            p
          end
          p "#{film.synopsis || ""}"
        end

        docx.table [[c1,c2]] do
          cell_style cols[0], width: 4500
        end

        job.update({ current_value: film_index + 1 })
      end
      job.update({ first_line: 'Saving Word Document', second_line: false })
    end

    job.update({ first_line: 'Uploading to AWS' })
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/catalog.docx")
    obj.upload_file("#{Rails.root}/tmp/#{time_started}/catalog.docx", acl:'public-read')

    job.update!({ done: true, first_line: obj.public_url })
  end

end
