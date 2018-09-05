class ExportCatalog
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(film_ids, time_started)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

    require 'caracal'
    file_path = "/tmp/#{time_started}/catalog.docx"
    document = Caracal::Document.save(file_path) do |docx|
      films = Film.where(id: film_ids).order(:title).includes(:countries, :languages)
      films.each_with_index do |film, film_index|
        country = film.film_countries.order(:order).first.country
        language = film.film_languages.order(:order).first.language

        c1 = Caracal::Core::Models::TableCellModel.new margins: { top: 0, bottom: 100, left: 0, right: 0 } do
          if film.artwork_url
            img film.artwork_url, width: 200, height: 280
          else
            img 'https://film-movement.herokuapp.com/black.jpg', width: 200, height: 280
          end
        end
        c2 = Caracal::Core::Models::TableCellModel.new margins: { top: 0, bottom: 100, left: 0, right: 0 } do
          h2 film.title
          p "#{country ? country.name : ''} | #{language ? language.name : ''} | #{film.length} min"
          p
          p film.synopsis
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
