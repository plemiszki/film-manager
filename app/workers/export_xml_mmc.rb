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
        builder.tag!("manifest:Video", "VideoTrackID" => "md:vidtrackid:org:filmmovement:FM_Once_Were_Warriors_Movie:feature.video.en-US") do
          builder.__send__('md:Type', 'primary')
          builder.tag!("md:Picture") do
            builder.__send__('md:AspectRatio', '16:9')
            builder.__send__('md:WidthPixels', '1920')
            builder.__send__('md:HeightPixels', '1080')
          end
          builder.__send__('md:Language', 'en-EN')
          builder.tag!("manifest:ContainerReference") do
            builder.__send__('manifest:ContainerLocation', 'filmmovement-Once_Were_Warriors_Movie-Full-mezz-en-US.mov')
          end
        end
        builder.comment! "Embedded audio in the video file"
        builder.tag!("manifest:Audio", "AudioTrackID" => "md:audtrackid:org:filmmovement:FM_Once_Were_Warriors_Movie:feature.audio.en-US") do
          builder.__send__('md:Type', 'primary')
          builder.__send__('md:Language', 'en-US')
          builder.tag!("manifest:ContainerReference") do
            builder.__send__('manifest:ContainerLocation', 'filmmovement-Once_Were_Warriors_Movie-Full-feature-en-US.mov')
          end
        end
        builder.comment! "Feature subtitle File"
        builder.tag!("manifest:Subtitle", "SubtitleTrackID" => "md:subtrackid:org:filmmovement:FM_Once_Were_Warriors_Movie:caption.en-US") do
          builder.__send__('md:Format', 'SCC')
          builder.__send__('md:Type', 'SDH')
          builder.__send__('md:Language', 'en-US')
          builder.tag!("md:Encoding") do
            builder.__send__('md:Framerate', '24', timecode: 'NonDrop', multiplier: '1000/1001')
          end
          builder.tag!("manifest:ContainerReference") do
            builder.__send__('manifest:ContainerLocation', 'filmmovement-FM_Once_Were_Warriors_Movie-Full-Caption2398NDF-en-US.scc')
          end
        end
      end
      builder.comment! "Presentation section"
      builder.tag!("manifest:Presentations") do
        builder.tag!("manifest:Presentation", "PresentationID" => "md:presentationid:org:filmmovement:FM_Once_Were_Warriors_Movie:feature.presentation") do
          builder.tag!("manifest:TrackMetadata") do
            builder.__send__('manifest:TrackSelectionNumber', '0')
            builder.tag!('manifest:VideoTrackReference') do
              builder.__send__('manifest:VideoTrackID', 'md:vidtrackid:org:filmmovement:FM_Once_Were_Warriors_Movie:feature.video.en-US')
            end
            builder.tag!('manifest:AudioTrackReference') do
              builder.__send__('manifest:AudioTrackID', 'md:audtrackid:org:filmmovement:FM_Once_Were_Warriors_Movie:feature.audio.en-US')
            end
            builder.tag!('manifest:SubtitleTrackReference') do
              builder.__send__('manifest:SubtitleTrackID', 'md:subtrackid:org:filmmovement:FM_Once_Were_Warriors_Movie:caption.en-US')
            end
          end
        end
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
