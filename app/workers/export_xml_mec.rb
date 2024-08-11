class ExportXmlMec
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

    release_date = (film.theatrical_release || film.tvod_release || film.fm_plus_release)
    if release_date.nil?
      errors << 'No Release Date (Theatrical, TVOD, or FM+)'
      release_date_string = ""
    else
      release_date_string = release_date.strftime("%Y-%m-%d")
    end

    filename = film.xml_mec_filename.presence || "#{film.title_amazon_export.downcase}_mec.xml"
    file = File.open("#{job_folder}/#{filename}", 'w')
    identifier = "FM_#{film.title_amazon_export}_Movie"

    safe_characters = -> (input) { input.gsub('<', '&lt;').gsub('>', '&gt;').gsub('&', '&amp;').gsub("'", '&apos;').gsub("\"", "&quot;") }

    require 'builder'
    builder = Builder::XmlMarkup.new(target: file)

    builder.instruct!
    builder << "\n\n"

    builder.tag!("mdmec:CoreMetadata", "xmlns:xsi" => "http://www.w3.org/2001/XMLSchema-instance", "xmlns:md" => "http://www.movielabs.com/schema/md/v2.6/md", "xmlns:mdmec" => "http://www.movielabs.com/schema/mdmec/v2.6", "xsi:schemaLocation" => "http://www.movielabs.com/schema/mdmec/v2.6/mdmec-v2.6.xsd") do
      builder << "\n\n"

      builder.tag!("mdmec:Basic", "ContentID" => "md:cid:org:filmmovement:#{identifier}") do
        builder << "\n\n"

        builder.tag!("md:LocalizedInfo", language: "en-US") do
          builder << "\n\n"

          builder.tag!("md:TitleDisplayUnlimited") { builder << film.title }
          builder << "\n\n"

          builder.tag!("md:TitleSort")
          builder << "\n\n"

          builder.tag!("md:ArtReference", resolution: "1920x2560", purpose: "boxart") { builder << "#{film.title_amazon_export.camelize}_Box_1920x2560.jpg" }
          builder << "\n"
          builder.tag!("md:ArtReference", resolution: "1920x1080", purpose: "cover") { builder << "#{film.title_amazon_export.camelize}_Cover_1920x1080.jpg" }
          builder << "\n"
          builder.tag!("md:ArtReference", resolution: "1920x1080", purpose: "hero") { builder << "#{film.title_amazon_export.camelize}_Hero_1920x1080.jpg" }
          builder << "\n"
          builder.tag!("md:ArtReference", resolution: "2000x3000", purpose: "poster") { builder << "#{film.title_amazon_export.camelize}_Poster_2000x3000.jpg" }
          builder << "\n\n"

          builder.tag!("md:Summary190") { builder << safe_characters.(film.logline) }
          builder << "\n\n"

          builder.tag!("md:Summary400") { builder << safe_characters.(film.vod_synopsis) }
          builder << "\n\n"

          film.amazon_genres.each do |amazon_genre|
            builder.tag!("md:Genre", id: amazon_genre.code)
            builder << "\n\n"
          end

        end
        builder << "\n\n"

        builder.tag!("md:ReleaseYear") { builder << film.year }
        builder << "\n"
        builder.tag!("md:ReleaseDate") { builder << release_date_string }
        builder << "\n\n"
        builder.tag!("md:WorkType") { builder << "movie" }
        builder << "\n\n"

        builder.tag!("md:AltIdentifier") do
          builder << "\n"
          builder.tag!("md:Namespace") { builder << "ORG" }
          builder << "\n"
          builder.tag!("md:Identifier") { builder << identifier }
          builder << "\n"
        end
        builder << "\n\n"

        builder.tag!("md:AltIdentifier") do
          builder << "\n"
          builder.tag!("md:Namespace") { builder << "IMDB" }
          builder << "\n"
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

            builder.tag!("md:Value") { builder << film.tv_rating.strip }
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

              builder.tag!("md:DisplayName", language: "en-US") { builder << director.full_name }
              builder << "\n"
            end
            builder << "\n"
          end
          builder << "\n"
        end

        actors.each_with_index do |actor, index|
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

              builder.tag!("md:DisplayName", language: "en-US") { builder << actor.full_name }
              builder << "\n"
            end
            builder << "\n"
          end
          builder << "\n"
        end

        film.amazon_languages.each do |amazon_language|
          builder.tag!("md:OriginalLanguage") { builder << amazon_language.code }
          builder << "\n"
        end

        builder.tag!("md:AssociatedOrg", "organizationID" => "filmmovement", role: "licensor")
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
