class ExportXmlMmc
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(film_id, time_started)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

    errors = []

    film = Film.find(film_id)
    filename = film.xml_mmc_filename.presence || "#{film.title_amazon_export.downcase}_mmc.xml"
    file = File.open(filename, 'w')

    title = film.title_amazon_export

    language = film.amazon_languages.first

    if language.nil?
      errors << 'Missing Amazon Language'
      job.update!({ status: :failed, first_line: "Errors Found", errors_text: errors.join("\n") })
      return
    else
      language_code = language.code
    end

    video_filename = film.xml_video_filename.presence || "filmmovement-#{title}_Movie-Full-mezz-#{language_code}.mov"
    trailer_filename = film.xml_trailer_filename.presence || "filmmovement-#{title}_Trailer.mov"
    subtitles_filename = film.xml_subtitles_filename.presence || "filmmovement-FM_#{title}_Subtitle.scc"
    captions_filename = film.xml_caption_filename.presence || "filmmovement-FM_#{title}_Caption.scc"

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
        builder.tag!("manifest:Video", "VideoTrackID" => "md:vidtrackid:org:filmmovement:FM_#{title}_Movie:feature.video.#{language_code}") do
          builder.__send__('md:Type', 'primary')
          builder.__send__('md:Language', language_code)
          builder.tag!("manifest:ContainerReference") do
            builder.__send__('manifest:ContainerLocation', video_filename)
          end
        end
        builder.comment! "Embedded audio in the video file"
        builder.tag!("manifest:Audio", "AudioTrackID" => "md:audtrackid:org:filmmovement:FM_#{title}_Movie:feature.audio.#{language_code}") do
          builder.__send__('md:Type', 'primary')
          builder.__send__('md:Language', language_code)
          builder.tag!("manifest:ContainerReference") do
            builder.__send__('manifest:ContainerLocation', video_filename)
          end
        end
        builder.comment! "Feature subtitle File"
        builder.tag!("manifest:Subtitle", "SubtitleTrackID" => "md:subtrackid:org:filmmovement:FM_#{title}_Movie:caption.en-US") do
          builder.__send__('md:Format', 'SCC')
          builder.__send__('md:Type', 'SDH')
          builder.__send__('md:Language', 'en-US')
          builder.tag!("md:Encoding") do
            builder.__send__('md:FrameRate', '24', timecode: 'NonDrop', multiplier: '1000/1001')
          end
          builder.tag!("manifest:ContainerReference") do
            builder.__send__('manifest:ContainerLocation', captions_filename)
          end
        end
        builder.tag!("manifest:Subtitle", "SubtitleTrackID" => "md:subtrackid:org:filmmovement:FM_#{title}_Movie:subtitle.en-US") do
          builder.__send__('md:Format', 'SCC')
          builder.__send__('md:Type', 'normal')
          builder.__send__('md:Language', 'en-US')
          builder.tag!("md:Encoding") do
            builder.__send__('md:FrameRate', '24', timecode: 'NonDrop', multiplier: '1000/1001')
          end
          builder.tag!("manifest:ContainerReference") do
            builder.__send__('manifest:ContainerLocation', subtitles_filename)
          end
        end
        if film.xml_include_trailer
          builder.tag!("manifest:Video", "VideoTrackID" => "md:vidtrackid:org:filmmovement:FM_#{title}_Movie:trailer.video.#{language_code}") do
            builder.__send__('md:Type', 'primary')
            builder.__send__('md:Language', language_code)
            builder.tag!("manifest:ContainerReference") do
              builder.__send__('manifest:ContainerLocation', trailer_filename)
            end
          end
          builder.tag!("manifest:Audio", "AudioTrackID" => "md:audtrackid:org:filmmovement:FM_#{title}_Movie:trailer.audio.#{language_code}") do
            builder.__send__('md:Type', 'primary')
            builder.__send__('md:Language', language_code)
            builder.tag!("manifest:ContainerReference") do
              builder.__send__('manifest:ContainerLocation', trailer_filename)
            end
          end
        end
      end
      builder.comment! "Presentation section"
      builder.tag!("manifest:Presentations") do
        builder.tag!("manifest:Presentation", "PresentationID" => "md:presentationid:org:filmmovement:FM_#{title}_Movie:feature.presentation") do
          builder.tag!("manifest:TrackMetadata") do
            builder.__send__('manifest:TrackSelectionNumber', '0')
            builder.tag!('manifest:VideoTrackReference') do
              builder.__send__('manifest:VideoTrackID', "md:vidtrackid:org:filmmovement:FM_#{title}_Movie:feature.video.#{language_code}")
            end
            builder.tag!('manifest:AudioTrackReference') do
              builder.__send__('manifest:AudioTrackID', "md:audtrackid:org:filmmovement:FM_#{title}_Movie:feature.audio.#{language_code}")
            end
            builder.tag!('manifest:SubtitleTrackReference') do
              builder.__send__('manifest:SubtitleTrackID', "md:subtrackid:org:filmmovement:FM_#{title}_Movie:caption.en-US")
            end
            builder.tag!('manifest:SubtitleTrackReference') do
              builder.__send__('manifest:SubtitleTrackID', "md:subtrackid:org:filmmovement:FM_#{title}_Movie:subtitle.en-US")
            end
          end
        end
      end
      if film.xml_include_trailer
        builder.tag!("manifest:Presentations") do
          builder.tag!("manifest:Presentation", "PresentationID" => "md:presentationid:org:filmmovement:FM_#{title}_Movie:trailer.presentation") do
            builder.tag!("manifest:TrackMetadata") do
              builder.__send__('manifest:TrackSelectionNumber', '0')
              builder.tag!('manifest:VideoTrackReference') do
                builder.__send__('manifest:VideoTrackID', "md:vidtrackid:org:filmmovement:FM_#{title}_Movie:trailer.video.#{language_code}")
              end
              builder.tag!('manifest:AudioTrackReference') do
                builder.__send__('manifest:AudioTrackID', "md:audtrackid:org:filmmovement:FM_#{title}_Movie:trailer.audio.#{language_code}")
              end
            end
          end
        end
      end
      builder.comment! "Experiences"
      builder.tag!("manifest:Experiences") do
        builder.tag!("manifest:Experience", "ExperienceID" => "md:experienceid:org:filmmovement:FM_#{title}_Movie:experience", "version" => "1.0") do
          builder.tag!("manifest:Audiovisual", "ContentID" => "md:cid:org:filmmovement:FM_#{title}_Movie") do
            builder.__send__('manifest:Type', 'Main')
            builder.__send__('manifest:SubType', 'Feature')
            builder.__send__('manifest:PresentationID', "md:presentationid:org:filmmovement:FM_#{title}_Movie:feature.presentation")
          end
          if film.xml_include_trailer
            builder.tag!("manifest:ExperienceChild") do
              builder.__send__('manifest:Relationship', "ispromotionfor")
              builder.__send__('manifest:ExperienceID', "md:experienceid:org:filmmovement:FM_#{title}_Movie:trailer.experience")
            end
          end
        end
        if film.xml_include_trailer
          builder.tag!("manifest:Experience", "ExperienceID" => "md:experienceid:org:filmmovement:FM_#{title}_Movie:trailer.experience", "version" => "1.0") do
            builder.tag!("manifest:Audiovisual", "ContentID" => "md:cid:org:filmmovement:FM_#{title}_Movie") do
              builder.__send__('manifest:Type', 'Promotion')
              builder.__send__('manifest:SubType', 'Default Trailer')
              builder.__send__('manifest:PresentationID', "md:presentationid:org:filmmovement:FM_#{title}_Movie:trailer.presentation")
            end
          end
        end
      end
      builder.comment! "ALIDExperienceMap"
      builder.tag!("manifest:ALIDExperienceMaps") do
        builder.tag!("manifest:ALIDExperienceMap") do
          builder.__send__('manifest:ALID', "md:alid:org:filmmovement:FM_#{title}_Movie")
          builder.__send__('manifest:ExperienceID', "md:experienceid:org:filmmovement:FM_#{title}_Movie:experience")
        end
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
    obj = bucket.object("#{time_started}/#{filename}")
    obj.upload_file(file.path, acl:'public-read')


    job.update!({ status: 'success', first_line: '', metadata: { url: obj.public_url }, errors_text: '' })
  end

end
