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

    builder.tag!("mdmec:CoreMetadata", "xmlns:xsi" => "http://www.w3.org/2001/XMLSchema-instance", "xmlns:md" => "http://www.movielabs.com/schema/md/v2.6/md", "xmlns:mdmec" => "http://www.movielabs.com/schema/mdmec/v2.6", "xsi:schemaLocation" => "http://www.movielabs.com/schema/mdmec/v2.6/mdmec-v2.6.xsd") do
      builder << "\n\n"

      builder.tag!("mdmec:Basic", "ContentID" => "md:cid:org:amazonstudios:AS_Hunter_Killer_Movie") do
        builder << "\n\n"

        builder.tag!("md:LocalizedInfo", language: "en-US") do
          builder << "\n\n"

          builder.tag!("md:TitleDisplayUnlimited") { builder << "Hunter Killer" }
          builder << "\n\n"

          builder.tag!("md:TitleSort")
          builder << "\n\n"

          builder.tag!("md:ArtReference", resolution: "1920x2560", purpose: "boxart") { builder << "Enter_the_3x4_boxart_file_name_here" }
          builder << "\n"
          builder.tag!("md:ArtReference", resolution: "3840x2160", purpose: "cover") { builder << "Enter_the_16x9_cover_file_name_here" }
          builder << "\n"
          builder.tag!("md:ArtReference", resolution: "3840x2160", purpose: "hero") { builder << "Enter_the_16x9_hero_file_name_here" }
          builder << "\n\n"

          builder.tag!("md:Summary190") { builder << "Enter the short synopsis of the movie here" }
          builder << "\n\n"

          builder.tag!("md:Summary400") { builder << "Enter the long synopsis of the movie here" }
          builder << "\n\n"

          builder.tag!("md:Genre", id: "av_genre_action")
          builder << "\n\n"
        end
        builder << "\n\n"

        builder.tag!("md:ReleaseYear") { builder << "2021" }
        builder << "\n"
        builder.tag!("md:ReleaseDate") { builder << "2021-06-01" }
        builder << "\n\n"
        builder.tag!("md:WorkType") { builder << "movie" }
        builder << "\n\n"

        builder.tag!("md:AltIdentifier") do
          builder << "\n"

          builder.tag!("md:Namespace") { builder << "org" }
          builder << "\n\n"
          builder.tag!("md:Identifier") { builder << "AS_Hunter_Killer_Movie" }
          builder << "\n"
        end
        builder << "\n\n"

        builder.tag!("md:RatingSet") do
          builder << "\n"

          builder.tag!("md:Rating") do
            builder << "\n"

            builder.tag!("md:Region") do
              builder << "\n"

              builder.tag!("md:country") { builder << "US" }
              builder << "\n"
            end
            builder << "\n"

            builder.tag!("md:System") { builder << "MPAA" }
            builder << "\n"

            builder.tag!("md:Value") { builder << "PG" }
            builder << "\n"
          end
          builder << "\n"

        end
        builder << "\n"

        builder.tag!("md:People") do
          builder << "\n"

          builder.tag!("md:Job") do
            builder << "\n"

            builder.tag!("md:JobFunction") { builder << "Director" }
            builder << "\n"
            builder.tag!("md:BillingBlockOrder") { builder << "1" }
            builder << "\n"
          end
          builder << "\n"

          builder.tag!("md:Name") do
            builder << "\n"

            builder.tag!("md:DisplayName", language: "en-US") { builder << "Enter_director_name_here" }
            builder << "\n"
          end
          builder << "\n"
        end
        builder << "\n"

        builder.tag!("md:People") do
          builder << "\n"

          builder.tag!("md:Job") do
            builder << "\n"

            builder.tag!("md:JobFunction") { builder << "Actor" }
            builder << "\n"
            builder.tag!("md:BillingBlockOrder") { builder << "2" }
            builder << "\n"
          end
          builder << "\n"

          builder.tag!("md:Name") do
            builder << "\n"

            builder.tag!("md:DisplayName", language: "en-US") { builder << "Enter_actor_name_here" }
            builder << "\n"
          end
          builder << "\n"
        end
        builder << "\n"

        builder.tag!("md:OriginalLanguage") { builder << "en-US" }
        builder << "\n"

        builder.tag!("md:AssociatedOrg", "organizationID" => "Enter_your_partneralias_here", role: "licensor")
        builder << "\n"
      end
      builder << "\n"

      builder.tag!("mdmec:CompanyDisplayCredit") do
        builder << "\n"

        builder.tag!("md:DisplayString", language: "en-US") { builder << "Enter Display credits name here" }
        builder << "\n"
      end
      builder << "\n"
    end

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
