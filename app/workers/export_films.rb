class ExportFilms
  include Sidekiq::Worker
  include ActionView::Helpers::NumberHelper
  sidekiq_options retry: false

  def perform(film_ids, time_started)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

    require 'xlsx_writer'
    doc = XlsxWriter.new
    sheet = doc.add_sheet('Films')
    sheet.add_row([
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
      'Theatrical',
      'Educational',
      'Festival',
      'Other NT',
      'SVOD',
      'TVOD (Cable)',
      'EST/DTR',
      'Pay TV',
      'Free TV',
      'FVOD',
      'AVOD',
      'DVD/Video',
      'Hotels',
      'Airlines',
      'Ships'
    ])

    films = Film.where(id: film_ids).order(:title).includes(:licensor, :label, :laurels, :film_rights)
    films.each_with_index do |film, film_index|
      film_rights = film.film_rights
      retail_dvd = Dvd.find_by({ feature_film_id: film.id, dvd_type_id: 1 })
      blu_ray = Dvd.find_by({ feature_film_id: film.id, dvd_type_id: 6 })
      sheet.add_row([
        film.title,
        (film.licensor ? film.licensor.name : ''),
        film.start_date,
        film.end_date,
        film.proper_label_name,
        film.year,
        film.synopsis,
        film.short_synopsis,
        film.vod_synopsis,
        film.logline,
        film.laurels.map(&:string).join("\n"),
        "#{film.length} min",
        film.directors.map(&:string).join(", "),
        film.actors.map(&:string).join(", "),
        film.countries.map(&:name).join(", "),
        film.languages.map(&:name).join(", "),
        film.genres.map(&:name).join(", "),
        film.topics.map(&:name).join(", "),
        retail_dvd ? "$#{number_with_precision(retail_dvd.price, precision: 2, delimiter: ',')}" : 'n/a',
        (retail_dvd && retail_dvd.retail_date) ? retail_dvd.retail_date.strftime("%-m/%-d/%y") : 'n/a',
        retail_dvd ? retail_dvd.upc : 'n/a',
        retail_dvd ? retail_dvd.stock : 'n/a',
        blu_ray ? "$#{number_with_precision(blu_ray.price, precision: 2, delimiter: ',')}" : 'n/a',
        (blu_ray && blu_ray.retail_date) ? blu_ray.retail_date.strftime("%-m/%-d/%y") : 'n/a',
        blu_ray ? blu_ray.upc : 'n/a',
        blu_ray ? blu_ray.stock : 'n/a',
        film_rights.select { |right| right.right_id == 1 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 2 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 3 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 4 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 5 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 6 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 7 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 8 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 9 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 10 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 11 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 12 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 13 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 14 }.length > 0 ? 'Yes' : 'No',
        film_rights.select { |right| right.right_id == 15 }.length > 0 ? 'Yes' : 'No',
      ])
      job.update({ current_value: film_index + 1 })
    end

    file_path = "#{job_folder}/films.xlsx"
    FileUtils.mv doc.path, file_path
    doc.cleanup

    job.update({ first_line: 'Uploading to AWS' })
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/metadata.xlsx")
    obj.upload_file(file_path, acl:'public-read')

    job.update!({ done: true, first_line: obj.public_url })
  end

end
