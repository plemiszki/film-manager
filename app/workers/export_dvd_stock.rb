class ExportDvdStock
  include Sidekiq::Worker
  include ActionView::Helpers::NumberHelper
  sidekiq_options retry: false

  def perform(time_started)
    # job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

    dvd_types = DvdType.all.order(:id)
    dvd_type_names = dvd_types.map(&:name)

    require 'xlsx_writer'
    doc = XlsxWriter.new
    sheet = doc.add_sheet('Films')
    headers = [
      'Title',
      'Licensor'
    ] + dvd_type_names.map { |dvd_type_name| "#{dvd_type_name} Stock"}

    sheet.add_row(headers)

    films = Film.where(film_type: 'Feature').order(:title).includes(:licensor)
    films.each_with_index do |film, index|
      row = [
        film.title,
        film.licensor.try(:name) || ''
      ]
      dvd_types.each do |dvd_type|
        dvd = Dvd.find_by(feature_film_id: film.id, dvd_type_id: dvd_type.id)
        if dvd
          row << dvd.stock
        else
          row << ''
        end
      end
      sheet.add_row(row)
      # job.update({ current_value: index + 1 })
    end

    file_path = "#{job_folder}/dvd_stock.xlsx"
    FileUtils.mv doc.path, file_path
    doc.cleanup

    # job.update({ first_line: 'Uploading to AWS' })
    # s3 = Aws::S3::Resource.new(
    #   credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
    #   region: 'us-east-1'
    # )
    # bucket = s3.bucket(ENV['S3_BUCKET'])
    # obj = bucket.object("#{time_started}/metadata.xlsx")
    # obj.upload_file(file_path, acl:'public-read')
    #
    # job.update!({ done: true, first_line: obj.public_url })
  end

end
