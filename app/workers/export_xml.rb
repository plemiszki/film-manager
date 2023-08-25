class ExportXml
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(film_id, time_started)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

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

    release_date = (film.theatrical_release || film.tvod_release || film.fm_plus_release).strftime("%Y-%m-%d")

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

          builder.tag!("md:TitleDisplayUnlimited") { builder << film.title }
          builder << "\n\n"

          builder.tag!("md:TitleSort")
          builder << "\n\n"

          builder.tag!("md:ArtReference", resolution: "1920x2560", purpose: "boxart") { builder << "#{film.title.camelize}_Box-Art_1920x2560" }
          builder << "\n"
          builder.tag!("md:ArtReference", resolution: "1920x1080", purpose: "cover") { builder << "#{film.title.camelize}_Cover-Art_1920x1080" }
          builder << "\n"
          builder.tag!("md:ArtReference", resolution: "1920x1080", purpose: "hero") { builder << "#{film.title.camelize}_Background-Art_1920x1080" }
          builder << "\n\n"

          builder.tag!("md:Summary190") { builder << film.logline }
          builder << "\n\n"

          builder.tag!("md:Summary400") { builder << film.synopsis }
          builder << "\n\n"

          builder.tag!("md:Genre", id: "av_genre_action")
          builder << "\n\n"
        end
        builder << "\n\n"

        builder.tag!("md:ReleaseYear") { builder << film.year }
        builder << "\n"
        builder.tag!("md:ReleaseDate") { builder << release_date }
        builder << "\n\n"
        builder.tag!("md:WorkType") { builder << "movie" }
        builder << "\n\n"

        builder.tag!("md:AltIdentifier") do
          builder << "\n"

          builder.tag!("md:Namespace") { builder << "org" }
          builder << "\n\n"
          builder.tag!("md:Identifier") { builder << film.imdb_id }
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

            builder.tag!("md:System") { builder << "TVPG" }
            builder << "\n"

            builder.tag!("md:Value") { builder << film.rating }
            builder << "\n"
          end
          builder << "\n"

        end
        builder << "\n"

        directors[0..1].each_with_index do |director, index|
          builder.tag!("md:People") do
            builder << "\n"

            builder.tag!("md:Job") do
              builder << "\n"

              builder.tag!("md:JobFunction") { builder << "Director" }
              builder << "\n"
              builder.tag!("md:BillingBlockOrder") { builder << (index + 1) }
              builder << "\n"
            end
            builder << "\n"

            builder.tag!("md:Name") do
              builder << "\n"

              builder.tag!("md:DisplayName", language: "en-US") { builder << director.string }
              builder << "\n"
            end
            builder << "\n"
          end
          builder << "\n"
        end

        actors[0..1].each_with_index do |actor, index|
          builder.tag!("md:People") do
            builder << "\n"

            builder.tag!("md:Job") do
              builder << "\n"

              builder.tag!("md:JobFunction") { builder << "Actor" }
              builder << "\n"
              builder.tag!("md:BillingBlockOrder") { builder << (directors.length + index + 1) }
              builder << "\n"
            end
            builder << "\n"

            builder.tag!("md:Name") do
              builder << "\n"

              builder.tag!("md:DisplayName", language: "en-US") { builder << actor.string }
              builder << "\n"
            end
            builder << "\n"
          end
          builder << "\n"
        end

        film.languages.each do |language|
          builder.tag!("md:OriginalLanguage") { builder << "en-US" }
          builder << "\n"
        end

        builder.tag!("md:AssociatedOrg", "organizationID" => "Film_Movement", role: "licensor")
        builder << "\n"
      end
      builder << "\n"

      builder.tag!("mdmec:CompanyDisplayCredit") do
        builder << "\n"

        builder.tag!("md:DisplayString", language: "en-US") { builder << label_name }
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
