class ExportCatalog
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(film_ids, time_started)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

    require 'rtf'
    document = RTF::Document.new(RTF::Font.new(RTF::Font::ROMAN, 'Times New Roman'))
    document.paragraph << "This is a short paragraph of text."

    films = Film.where(id: film_ids).order(:title).includes(:licensor, :label, :laurels, :film_rights)
    films.each_with_index do |film, film_index|
      job.update({ current_value: film_index + 1 })
    end

    file_path = "#{job_folder}/catalog.rtf"
    File.open(file_path, 'w') { |file| file.write(document.to_rtf) }

    job.update({ first_line: 'Uploading to AWS' })
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/catalog.rtf")
    obj.upload_file(file_path, acl:'public-read')

    job.update!({ done: true, first_line: obj.public_url })
  end

end
