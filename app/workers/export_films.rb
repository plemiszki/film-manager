class ExportFilms
  include Sidekiq::Worker
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
        film.film_rights.select { |right| right.right_id == 1 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 2 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 3 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 4 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 5 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 6 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 7 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 8 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 9 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 10 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 11 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 12 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 13 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 14 }.length > 0 ? 'Yes' : 'No',
        film.film_rights.select { |right| right.right_id == 15 }.length > 0 ? 'Yes' : 'No',
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
