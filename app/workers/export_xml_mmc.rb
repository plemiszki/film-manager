class ExportXmlMmc
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(film_id, time_started)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

    errors = []

    film = Film.find(film_id)
    case film.label.name
    when "3rd Party"
      label_name = "Film Movement Plus"
    when "Classics"
      label_name = "Film Movement Classics"
    when "Omnibus"
      label_name = "Omnibus Entertainment"
    else
      label_name = film.label.name
    end

    directors = film.directors
    actors = film.actors

    newline = lambda { |builder| builder << "\n" }

    release_date = (film.theatrical_release || film.tvod_release || film.fm_plus_release).strftime("%Y-%m-%d")

    file = File.open("#{job_folder}/test.xml", 'w')

    require 'builder'
    builder = Builder::XmlMarkup.new(target: file, indent: 2)

    builder.instruct!

    builder.tag!("manifest:MediaManifest", "xmlns:manifest" => "http://www.movielabs.com/schema/manifest/v1.10/manifest", "xmlns:md" => "http://www.movielabs.com/schema/md/v2.9/md", "xmlns:xsi" => "http://www.w3.org/2001/XMLSchema-instance", "xsi:schemaLocation" => "http://www.movielabs.com/schema/manifest/v1.10/manifest manifest-v1.10.xsd") do
      builder.tag!("manifest:Compatibility") do
        builder.__send__('manifest:SpecVersion', '1.10')
        builder.__send__('manifest:Profile', 'MMC-1')
      end
      builder.tag!("manifest:Inventory") do
        builder.comment! "video file"
        builder.tag!("manifest:Video") do
        end
        builder.comment! "Embedded audio in the video file"
        builder.tag!("manifest:Audio") do
        end
        builder.comment! "Feature subtitle File"
        builder.tag!("manifest:Subtitle") do
        end
      end
      builder.comment! "Presentation section"
      builder.tag!("manifest:Presentations") do
      end
      builder.comment! "Experiences"
      builder.tag!("manifest:Experiences") do
      end
      builder.comment! "ALIDExperienceMap"
      builder.tag!("manifest:ALIDExperienceMaps") do
      end
    end

    file.close

    if errors.present?
      job.update!({ status: :failed, first_line: "Errors Found", errors_text: errors.join("\n") })
      return
    end

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
