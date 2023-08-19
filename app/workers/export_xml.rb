class ExportXml
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(film_id, time_started)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

    file = File.open("#{job_folder}/test.xml", 'w')

    require 'builder'
    builder = Builder::XmlMarkup.new(target: file)
    builder.instruct!

    builder << "\n\n"
    builder.tag!("md:TitleSort")

    builder << "\n\n"
    builder.tag!("md:ArtReference", resolution: "1920x2560", purpose: "boxart") { builder << "Enter_the_3x4_boxart_file_name_here" }
    builder << "\n"
    builder.tag!("md:ArtReference", resolution: "3840x2160", purpose: "cover") { builder << "Enter_the_16x9_cover_file_name_here" }
    builder << "\n"
    builder.tag!("md:ArtReference", resolution: "3840x2160", purpose: "hero") { builder << "Enter_the_16x9_hero_file_name_here" }

    file.close

    job.update({ first_line: "Uploading to AWS" })
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1',
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/test.xml")
    obj.upload_file(file.path, acl:'public-read')

    job.update!({ status: 'success', first_line: '', metadata: { url: obj.public_url }, errors_text: '' })
  end

end
